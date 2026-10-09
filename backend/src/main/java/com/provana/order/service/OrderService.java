package com.provana.order.service;

import com.provana.catalog.entity.Product;
import com.provana.catalog.entity.ProductVariant;
import com.provana.catalog.entity.Sku;
import com.provana.catalog.repository.ProductRepository;
import com.provana.catalog.repository.ProductVariantRepository;
import com.provana.catalog.repository.SkuRepository;
import com.provana.common.exception.BadRequestException;
import com.provana.common.exception.ResourceNotFoundException;
import com.provana.common.response.PageResponse;
import com.provana.inventory.service.InventoryService;
import com.provana.order.dto.*;
import com.provana.order.entity.*;
import com.provana.order.repository.OrderItemRepository;
import com.provana.order.repository.OrderRepository;
import com.provana.user.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final SkuRepository skuRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final InventoryService inventoryService;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        SkuRepository skuRepository,
                        ProductRepository productRepository,
                        ProductVariantRepository productVariantRepository,
                        InventoryService inventoryService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.skuRepository = skuRepository;
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.inventoryService = inventoryService;
    }

    @Transactional
    public Order createOrderEntity(CreateOrderRequest request, User user) {
        if (request.items() == null || request.items().isEmpty()) {
            throw new BadRequestException("Cannot create order with zero items");
        }

        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setUser(user);
        order.setCustomerName(request.customerName().trim());
        order.setCustomerEmail(request.customerEmail().trim().toLowerCase());
        order.setCustomerPhone(request.customerPhone() != null ? request.customerPhone().trim() : null);
        order.setShippingAddress(request.shippingAddress().trim());
        order.setShippingCity(request.shippingCity().trim());
        order.setShippingState(request.shippingState().trim());
        order.setShippingPincode(request.shippingPincode().trim());
        order.setNotes(request.notes());
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.PENDING);

        BigDecimal subtotal = BigDecimal.ZERO;

        for (CreateOrderItemRequest itemReq : request.items()) {
            Sku sku = resolveSku(itemReq);

            if (!Boolean.TRUE.equals(sku.getActive()) || !Boolean.TRUE.equals(sku.getAvailable())) {
                throw new BadRequestException(String.format("SKU %s (%s) is currently unavailable for purchase",
                        sku.getSkuCode(), sku.getVariant() != null ? sku.getVariant().getName() : ""));
            }

            var stockCheck = inventoryService.checkStock(sku.getId());
            if (stockCheck.sellableQuantity() < itemReq.quantity()) {
                throw new BadRequestException(String.format("Insufficient inventory for SKU %s (Requested: %d, Available: %d)",
                        sku.getSkuCode(), itemReq.quantity(), stockCheck.sellableQuantity()));
            }

            Product product = sku.getVariant() != null ? sku.getVariant().getProduct() : null;
            String productName = product != null ? product.getName() : sku.getSkuCode();
            String flavor = itemReq.flavor() != null ? itemReq.flavor() : (sku.getVariant() != null ? sku.getVariant().getFlavor() : null);
            String size = itemReq.size() != null ? itemReq.size() : (sku.getVariant() != null ? sku.getVariant().getSize() : null);
            BigDecimal unitPrice = sku.getPrice();
            BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(itemReq.quantity()));

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setSku(sku);
            orderItem.setProductName(productName);
            orderItem.setSkuCode(sku.getSkuCode());
            orderItem.setFlavor(flavor);
            orderItem.setSize(size);
            orderItem.setUnitPrice(unitPrice);
            orderItem.setQuantity(itemReq.quantity());
            orderItem.setTotalPrice(totalPrice);

            order.addItem(orderItem);
            subtotal = subtotal.add(totalPrice);
        }

        order.setSubtotalAmount(subtotal);

        // Calculate discount
        BigDecimal discount = calculateDiscount(subtotal, request.appliedCoupon());
        order.setDiscountAmount(discount);
        order.setAppliedCoupon(request.appliedCoupon());

        // Calculate tax (included in MRP in Indian retail standard)
        order.setTaxAmount(BigDecimal.ZERO);

        // Shipping fee (Free express delivery)
        order.setShippingFee(BigDecimal.ZERO);

        BigDecimal total = subtotal.subtract(discount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        order.setTotalAmount(total);

        return orderRepository.save(order);
    }

    private Sku resolveSku(CreateOrderItemRequest itemReq) {
        if (itemReq.skuId() != null) {
            return skuRepository.findById(itemReq.skuId())
                    .orElseThrow(() -> new ResourceNotFoundException("SKU", "id", itemReq.skuId()));
        }

        Product product = null;
        if (itemReq.productId() != null) {
            product = productRepository.findById(itemReq.productId())
                    .orElse(null);
        }

        if (product == null && itemReq.productSlug() != null && !itemReq.productSlug().isBlank()) {
            String slugOrId = itemReq.productSlug().trim();
            try {
                UUID parsedUuid = UUID.fromString(slugOrId);
                product = productRepository.findById(parsedUuid).orElse(null);
            } catch (IllegalArgumentException ignored) {}

            if (product == null) {
                product = productRepository.findBySlug(slugOrId.toLowerCase()).orElse(null);
            }
        }

        if (product != null) {
            List<ProductVariant> variants = productVariantRepository.findByProductIdAndActiveTrueOrderBySortOrderAsc(product.getId());
            if (variants.isEmpty()) {
                variants = productVariantRepository.findByProductIdOrderBySortOrderAsc(product.getId());
            }

            // 1. Try to find matching variant by flavor/size
            for (ProductVariant v : variants) {
                boolean flavorMatches = itemReq.flavor() == null || itemReq.flavor().equalsIgnoreCase(v.getFlavor());
                boolean sizeMatches = itemReq.size() == null || itemReq.size().equalsIgnoreCase(v.getSize());

                if (flavorMatches || sizeMatches) {
                    List<Sku> skus = skuRepository.findByVariantIdAndActiveTrue(v.getId());
                    if (skus.isEmpty()) {
                        skus = skuRepository.findByVariantId(v.getId());
                    }
                    for (Sku s : skus) {
                        if (Boolean.TRUE.equals(s.getActive()) && Boolean.TRUE.equals(s.getAvailable())) {
                            return s;
                        }
                    }
                }
            }

            // 2. Try any active SKU from any variant of this product
            for (ProductVariant v : variants) {
                List<Sku> skus = skuRepository.findByVariantIdAndActiveTrue(v.getId());
                if (skus.isEmpty()) {
                    skus = skuRepository.findByVariantId(v.getId());
                }
                for (Sku s : skus) {
                    if (Boolean.TRUE.equals(s.getActive()) && Boolean.TRUE.equals(s.getAvailable())) {
                        return s;
                    }
                }
            }
        }

        // Fallback: search any active SKU
        return skuRepository.findAll().stream()
                .filter(s -> Boolean.TRUE.equals(s.getActive()) && Boolean.TRUE.equals(s.getAvailable()))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("No available sellable SKU found to fulfill item"));
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderResponseById(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public Order getOrderEntityById(UUID id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> listUserOrders(UUID userId, Pageable pageable) {
        Page<Order> page = orderRepository.findByUserId(userId, pageable);
        return PageResponse.from(page.map(this::mapToResponse));
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> listAdminOrders(OrderStatus status, Pageable pageable) {
        Page<Order> page = status != null
                ? orderRepository.findByStatus(status, pageable)
                : orderRepository.findAll(pageable);
        return PageResponse.from(page.map(this::mapToResponse));
    }

    @Transactional
    public OrderResponse updateOrderStatus(UUID id, OrderStatus newStatus) {
        Order order = getOrderEntityById(id);
        order.setStatus(newStatus);
        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    public OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getProduct() != null ? item.getProduct().getId() : null,
                        item.getSku() != null ? item.getSku().getId() : null,
                        item.getProductName(),
                        item.getSkuCode(),
                        item.getFlavor(),
                        item.getSize(),
                        item.getUnitPrice(),
                        item.getQuantity(),
                        item.getTotalPrice()
                ))
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getUser() != null ? order.getUser().getId() : null,
                order.getCustomerEmail(),
                order.getCustomerName(),
                order.getCustomerPhone(),
                order.getShippingAddress(),
                order.getShippingCity(),
                order.getShippingState(),
                order.getShippingPincode(),
                order.getSubtotalAmount(),
                order.getDiscountAmount(),
                order.getTaxAmount(),
                order.getShippingFee(),
                order.getTotalAmount(),
                order.getCurrency(),
                order.getStatus(),
                order.getPaymentStatus(),
                order.getAppliedCoupon(),
                order.getNotes(),
                itemResponses,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }

    private String generateOrderNumber() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        int randNum = 10000 + RANDOM.nextInt(90000);
        return "PV-" + dateStr + "-" + randNum;
    }

    private BigDecimal calculateDiscount(BigDecimal subtotal, String coupon) {
        if (coupon == null || coupon.isBlank()) return BigDecimal.ZERO;
        String code = coupon.trim().toUpperCase();
        BigDecimal percentage = switch (code) {
            case "PRO10" -> BigDecimal.valueOf(0.10);
            case "PRO25" -> BigDecimal.valueOf(0.25);
            case "PRE20" -> BigDecimal.valueOf(0.20);
            case "GYM15" -> BigDecimal.valueOf(0.15);
            default -> BigDecimal.ZERO;
        };
        return subtotal.multiply(percentage).setScale(2, RoundingMode.HALF_UP);
    }
}
