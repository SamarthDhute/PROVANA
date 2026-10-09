package com.provana.payment.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.provana.common.exception.BadRequestException;
import com.provana.common.exception.ResourceNotFoundException;
import com.provana.common.response.PageResponse;
import com.provana.inventory.dto.InventoryAdjustmentRequest;
import com.provana.inventory.service.InventoryService;
import com.provana.order.entity.Order;
import com.provana.order.entity.OrderItem;
import com.provana.order.entity.OrderStatus;
import com.provana.order.entity.PaymentStatus;
import com.provana.order.repository.OrderRepository;
import com.provana.order.service.OrderService;
import com.provana.payment.config.RazorpayProperties;
import com.provana.payment.dto.*;
import com.provana.payment.entity.Payment;
import com.provana.payment.entity.PaymentGateway;
import com.provana.payment.entity.PaymentWebhookEvent;
import com.provana.payment.repository.PaymentRepository;
import com.provana.payment.repository.PaymentWebhookEventRepository;
import com.provana.user.entity.User;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final PaymentWebhookEventRepository webhookEventRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final InventoryService inventoryService;
    private final RazorpayProperties razorpayProperties;
    private final RazorpayClientWrapper razorpayClientWrapper;
    private final RazorpaySignatureValidator signatureValidator;
    private final ObjectMapper objectMapper;

    public PaymentService(PaymentRepository paymentRepository,
                          PaymentWebhookEventRepository webhookEventRepository,
                          OrderRepository orderRepository,
                          OrderService orderService,
                          InventoryService inventoryService,
                          RazorpayProperties razorpayProperties,
                          RazorpayClientWrapper razorpayClientWrapper,
                          RazorpaySignatureValidator signatureValidator,
                          ObjectMapper objectMapper) {
        this.paymentRepository = paymentRepository;
        this.webhookEventRepository = webhookEventRepository;
        this.orderRepository = orderRepository;
        this.orderService = orderService;
        this.inventoryService = inventoryService;
        this.razorpayProperties = razorpayProperties;
        this.razorpayClientWrapper = razorpayClientWrapper;
        this.signatureValidator = signatureValidator;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public RazorpayOrderResponse initiateRazorpayOrder(InitiateRazorpayOrderRequest request, User currentUser) {
        Order order;
        if (request.orderId() != null) {
            order = orderRepository.findById(request.orderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order", "id", request.orderId()));
            if (currentUser != null && order.getUser() != null && !order.getUser().getId().equals(currentUser.getId())) {
                throw new BadRequestException("Unauthorized access to requested order");
            }
        } else if (request.orderData() != null) {
            order = orderService.createOrderEntity(request.orderData(), currentUser);
        } else {
            throw new BadRequestException("Either orderId or orderData must be provided");
        }

        // Idempotency check
        if (request.idempotencyKey() != null && !request.idempotencyKey().isBlank()) {
            Optional<Payment> existing = paymentRepository.findByIdempotencyKey(request.idempotencyKey().trim());
            if (existing.isPresent()) {
                Payment p = existing.get();
                return new RazorpayOrderResponse(
                        razorpayProperties.getKeyId(),
                        p.getRazorpayOrderId(),
                        p.getAmountMinorUnits(),
                        p.getAmount(),
                        p.getCurrency(),
                        "PROVANA Pure Nutrition",
                        "Order " + order.getOrderNumber(),
                        order.getId(),
                        order.getOrderNumber(),
                        order.getCustomerName(),
                        order.getCustomerEmail(),
                        order.getCustomerPhone(),
                        order.getNotes()
                );
            }
        }

        // Amount in integer minor units (paise)
        long amountMinorUnits = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();

        JSONObject notes = new JSONObject();
        notes.put("orderId", order.getId().toString());
        notes.put("orderNumber", order.getOrderNumber());
        notes.put("customerEmail", order.getCustomerEmail());

        RazorpayClientWrapper.GatewayOrderResult gatewayOrder;
        try {
            gatewayOrder = razorpayClientWrapper.createRazorpayOrder(
                    amountMinorUnits,
                    order.getCurrency(),
                    order.getOrderNumber(),
                    notes
            );
        } catch (Exception e) {
            log.error("Failed to initiate Razorpay order for {}: {}", order.getOrderNumber(), e.getMessage());
            throw new BadRequestException("Failed to initiate payment gateway order: " + e.getMessage());
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setGateway(PaymentGateway.RAZORPAY);
        payment.setRazorpayOrderId(gatewayOrder.orderId());
        payment.setAmount(order.getTotalAmount());
        payment.setAmountMinorUnits(amountMinorUnits);
        payment.setCurrency(order.getCurrency());
        payment.setStatus(PaymentStatus.CREATED);
        payment.setIdempotencyKey(request.idempotencyKey() != null ? request.idempotencyKey().trim() : null);

        paymentRepository.save(payment);

        return new RazorpayOrderResponse(
                razorpayProperties.getKeyId(),
                gatewayOrder.orderId(),
                amountMinorUnits,
                order.getTotalAmount(),
                order.getCurrency(),
                "PROVANA Pure Nutrition",
                "Order " + order.getOrderNumber(),
                order.getId(),
                order.getOrderNumber(),
                order.getCustomerName(),
                order.getCustomerEmail(),
                order.getCustomerPhone(),
                order.getNotes()
        );
    }

    @Transactional
    public PaymentVerificationResponse verifyRazorpayPayment(VerifyRazorpayPaymentRequest request, User currentUser) {
        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", request.orderId()));

        if (currentUser != null && order.getUser() != null && !order.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Unauthorized access to requested order verification");
        }

        Payment payment = paymentRepository.findByRazorpayOrderId(request.razorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment for Razorpay Order", "razorpayOrderId", request.razorpayOrderId()));

        if (!payment.getOrder().getId().equals(order.getId())) {
            throw new BadRequestException("Payment does not belong to specified order");
        }

        // Check if already captured (idempotent duplicate verify call)
        if (payment.getStatus() == PaymentStatus.CAPTURED) {
            return new PaymentVerificationResponse(
                    true,
                    "Payment already confirmed",
                    payment.getId(),
                    order.getId(),
                    order.getOrderNumber(),
                    payment.getRazorpayOrderId(),
                    payment.getRazorpayPaymentId(),
                    payment.getAmount(),
                    payment.getCurrency(),
                    payment.getStatus(),
                    order.getStatus(),
                    payment.getCapturedAt()
            );
        }

        // Verify HMAC-SHA256 signature
        boolean isValid = signatureValidator.verifyPaymentSignature(
                request.razorpayOrderId(),
                request.razorpayPaymentId(),
                request.razorpaySignature(),
                razorpayProperties.getKeySecret()
        );

        if (!isValid) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureCode("INVALID_SIGNATURE");
            payment.setFailureDescription("Signature mismatch on checkout callback");
            paymentRepository.save(payment);
            throw new BadRequestException("Invalid payment signature: Authentication rejected by PROVANA security");
        }

        // Fetch and strictly confirm status with gateway
        RazorpayClientWrapper.GatewayPaymentResult gatewayPayment;
        try {
            gatewayPayment = razorpayClientWrapper.fetchPayment(request.razorpayPaymentId());
        } catch (Exception e) {
            log.error("Could not fetch payment details from Razorpay gateway for payment {}: {}",
                    request.razorpayPaymentId(), e.getMessage());
            // Do NOT mark as captured when gateway fetch fails! Keep in pending state.
            throw new BadRequestException("Unable to confirm payment status with Razorpay gateway: " + e.getMessage() + ". Payment remains in pending state.");
        }

        if (gatewayPayment == null) {
            throw new BadRequestException("Gateway returned empty payment record for " + request.razorpayPaymentId());
        }

        // Validate order ID
        if (gatewayPayment.orderId() != null && !gatewayPayment.orderId().equals(payment.getRazorpayOrderId())) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureCode("ORDER_ID_MISMATCH");
            payment.setFailureDescription(String.format("Payment order ID %s does not match expected %s",
                    gatewayPayment.orderId(), payment.getRazorpayOrderId()));
            paymentRepository.save(payment);
            throw new BadRequestException("Payment order ID mismatch detected: Security verification failed");
        }

        // Validate amount
        if (gatewayPayment.amountMinorUnits() != null && !gatewayPayment.amountMinorUnits().equals(payment.getAmountMinorUnits())) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureCode("AMOUNT_MISMATCH");
            payment.setFailureDescription(String.format("Payment amount %d does not match expected %d",
                    gatewayPayment.amountMinorUnits(), payment.getAmountMinorUnits()));
            paymentRepository.save(payment);
            throw new BadRequestException("Payment amount mismatch detected: Security verification failed");
        }

        // Validate payment status from gateway
        String status = gatewayPayment.status() != null ? gatewayPayment.status().toLowerCase() : "unknown";
        if ("failed".equals(status)) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureCode("GATEWAY_PAYMENT_FAILED");
            payment.setFailureDescription(gatewayPayment.errorDescription() != null ? gatewayPayment.errorDescription() : "Payment failed at bank / gateway");
            paymentRepository.save(payment);
            throw new BadRequestException("Payment failed at gateway: " + payment.getFailureDescription());
        }

        if (!"captured".equals(status) && !"authorized".equals(status)) {
            log.warn("Payment {} has uncaptured status: {}", request.razorpayPaymentId(), status);
            throw new BadRequestException("Payment is in unconfirmed state: " + status + ". Please retry or check with bank.");
        }

        String paymentMethod = gatewayPayment.method() != null ? gatewayPayment.method() : "gateway";

        // Confirm Payment & Order
        payment.setRazorpayPaymentId(request.razorpayPaymentId());
        payment.setRazorpaySignature(request.razorpaySignature());
        payment.setStatus(PaymentStatus.CAPTURED);
        payment.setPaymentMethod(paymentMethod);
        payment.setCapturedAt(Instant.now());
        paymentRepository.save(payment);

        order.setPaymentStatus(PaymentStatus.CAPTURED);
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        // Deduct inventory idempotently
        deductInventoryForOrder(order);

        log.info("Payment successfully verified and captured for Order: {} (Razorpay Payment ID: {})",
                order.getOrderNumber(), request.razorpayPaymentId());

        return new PaymentVerificationResponse(
                true,
                "Payment successfully verified and captured",
                payment.getId(),
                order.getId(),
                order.getOrderNumber(),
                payment.getRazorpayOrderId(),
                payment.getRazorpayPaymentId(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getStatus(),
                order.getStatus(),
                payment.getCapturedAt()
        );
    }

    @Transactional
    public void handleRazorpayWebhook(String rawBody, String signatureHeader) {
        if (signatureHeader == null || signatureHeader.isBlank()) {
            throw new BadRequestException("Missing X-Razorpay-Signature header");
        }

        boolean isValid = signatureValidator.verifyWebhookSignature(
                rawBody,
                signatureHeader,
                razorpayProperties.getWebhookSecret()
        );

        if (!isValid) {
            log.warn("Rejected webhook with invalid signature");
            throw new BadRequestException("Invalid webhook signature");
        }

        try {
            JsonNode root = objectMapper.readTree(rawBody);
            String eventType = root.path("event").asText();
            String eventId = root.has("event_id")
                    ? root.get("event_id").asText()
                    : (root.has("id") ? root.get("id").asText() : UUID.randomUUID().toString());

            // Deduplicate webhook event
            if (webhookEventRepository.existsByEventId(eventId)) {
                log.info("Duplicate webhook event ignored: {}", eventId);
                return;
            }

            webhookEventRepository.save(new PaymentWebhookEvent(eventId, eventType, rawBody, true));

            JsonNode payloadNode = root.path("payload");
            JsonNode paymentEntity = payloadNode.path("payment").path("entity");
            JsonNode orderEntity = payloadNode.path("order").path("entity");

            String rzpOrderId = paymentEntity.path("order_id").asText(orderEntity.path("id").asText(null));
            String rzpPaymentId = paymentEntity.path("id").asText(null);

            if (rzpOrderId != null && !rzpOrderId.isBlank()) {
                Optional<Payment> paymentOpt = paymentRepository.findByRazorpayOrderId(rzpOrderId);
                if (paymentOpt.isPresent()) {
                    Payment payment = paymentOpt.get();
                    Order order = payment.getOrder();

                    switch (eventType) {
                        case "payment.captured", "order.paid" -> {
                            if (payment.getStatus() != PaymentStatus.CAPTURED) {
                                payment.setStatus(PaymentStatus.CAPTURED);
                                if (rzpPaymentId != null) payment.setRazorpayPaymentId(rzpPaymentId);
                                if (paymentEntity.has("method")) payment.setPaymentMethod(paymentEntity.get("method").asText());
                                payment.setCapturedAt(Instant.now());
                                paymentRepository.save(payment);

                                order.setPaymentStatus(PaymentStatus.CAPTURED);
                                order.setStatus(OrderStatus.CONFIRMED);
                                orderRepository.save(order);

                                deductInventoryForOrder(order);
                                log.info("Webhook captured payment for order {}", order.getOrderNumber());
                            }
                        }
                        case "payment.failed" -> {
                            if (payment.getStatus() != PaymentStatus.CAPTURED) {
                                payment.setStatus(PaymentStatus.FAILED);
                                if (paymentEntity.has("error_code")) payment.setFailureCode(paymentEntity.get("error_code").asText());
                                if (paymentEntity.has("error_description")) payment.setFailureDescription(paymentEntity.get("error_description").asText());
                                paymentRepository.save(payment);

                                log.info("Webhook recorded payment failure for order {}", order.getOrderNumber());
                            }
                        }
                        default -> log.debug("Unhandled webhook event type: {}", eventType);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error processing Razorpay webhook payload: {}", e.getMessage(), e);
            throw new BadRequestException("Failed to process webhook: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public PaymentDetailResponse getPaymentById(UUID id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
        return mapToDetailResponse(payment);
    }

    @Transactional(readOnly = true)
    public PageResponse<PaymentDetailResponse> listAdminPayments(PaymentStatus status, Pageable pageable) {
        Page<Payment> page = status != null
                ? paymentRepository.findByStatus(status, pageable)
                : paymentRepository.findAll(pageable);
        return PageResponse.from(page.map(this::mapToDetailResponse));
    }

    private void deductInventoryForOrder(Order order) {
        for (OrderItem item : order.getItems()) {
            if (item.getSku() != null) {
                try {
                    inventoryService.adjustStock(
                            item.getSku().getId(),
                            new InventoryAdjustmentRequest(
                                    -item.getQuantity(),
                                    com.provana.inventory.entity.MovementType.SALE,
                                    "Order checkout fulfillment: " + order.getOrderNumber(),
                                    "ORDER",
                                    order.getId().toString()
                            ),
                            "PAYMENT_FULFILLMENT"
                    );
                } catch (Exception e) {
                    log.error("Failed to deduct inventory for SKU {} in Order {}: {}",
                            item.getSku().getSkuCode(), order.getOrderNumber(), e.getMessage());
                }
            }
        }
    }

    private PaymentDetailResponse mapToDetailResponse(Payment p) {
        return new PaymentDetailResponse(
                p.getId(),
                p.getOrder().getId(),
                p.getOrder().getOrderNumber(),
                p.getGateway(),
                p.getRazorpayOrderId(),
                p.getRazorpayPaymentId(),
                p.getAmount(),
                p.getAmountMinorUnits(),
                p.getCurrency(),
                p.getStatus(),
                p.getPaymentMethod(),
                p.getFailureCode(),
                p.getFailureDescription(),
                p.getIdempotencyKey(),
                p.getCapturedAt(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
}
