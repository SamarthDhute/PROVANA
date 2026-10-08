package com.provana.inventory.service;

import com.provana.catalog.entity.Sku;
import com.provana.catalog.repository.SkuRepository;
import com.provana.common.exception.BadRequestException;
import com.provana.common.exception.ResourceNotFoundException;
import com.provana.common.response.PageResponse;
import com.provana.inventory.dto.*;
import com.provana.inventory.entity.*;
import com.provana.inventory.repository.InventoryMovementRepository;
import com.provana.inventory.repository.InventoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class InventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryService.class);

    private final InventoryRepository inventoryRepository;
    private final InventoryMovementRepository movementRepository;
    private final SkuRepository skuRepository;

    public InventoryService(InventoryRepository inventoryRepository,
                            InventoryMovementRepository movementRepository,
                            SkuRepository skuRepository) {
        this.inventoryRepository = inventoryRepository;
        this.movementRepository = movementRepository;
        this.skuRepository = skuRepository;
    }

    @Transactional(readOnly = true)
    public InventoryResponse getInventoryBySkuId(UUID skuId) {
        Inventory inventory = inventoryRepository.findBySkuId(skuId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory for SKU", "skuId", skuId));
        return mapToResponse(inventory);
    }

    @Transactional(readOnly = true)
    public PageResponse<InventoryResponse> listInventory(Pageable pageable, Boolean lowStockOnly) {
        Page<Inventory> page = Boolean.TRUE.equals(lowStockOnly)
                ? inventoryRepository.findLowStock(pageable)
                : inventoryRepository.findAll(pageable);

        return new PageResponse<>(
                page.getContent().stream().map(this::mapToResponse).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    @Transactional(readOnly = true)
    public StockCheckResponse checkStock(UUID skuId) {
        Inventory inventory = inventoryRepository.findBySkuId(skuId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory for SKU", "skuId", skuId));

        int sellable = inventory.getSellableQuantity();
        return new StockCheckResponse(
                skuId,
                inventory.getSku().getSkuCode(),
                sellable > 0,
                inventory.getAvailableQuantity(),
                sellable
        );
    }

    @Transactional
    public InventoryResponse adjustStock(UUID skuId, InventoryAdjustmentRequest request, String performedBy) {
        if (request.adjustmentQuantity() == null || request.adjustmentQuantity() == 0) {
            throw new BadRequestException("Adjustment quantity cannot be zero");
        }

        // Pessimistic write lock for concurrency protection
        Inventory inventory = inventoryRepository.findBySkuIdWithLock(skuId)
                .orElseGet(() -> {
                    Sku sku = skuRepository.findById(skuId)
                            .orElseThrow(() -> new ResourceNotFoundException("SKU", "id", skuId));
                    Inventory newInv = new Inventory(sku, 0, 5);
                    return inventoryRepository.save(newInv);
                });

        int prevAvailable = inventory.getAvailableQuantity();
        int newAvailable = prevAvailable + request.adjustmentQuantity();

        if (newAvailable < 0) {
            throw new BadRequestException(String.format(
                    "Cannot adjust stock: Resulting available quantity (%d) cannot be negative (current available: %d, adjustment: %d)",
                    newAvailable, prevAvailable, request.adjustmentQuantity()
            ));
        }

        int sellableAfter = newAvailable - inventory.getReservedQuantity();
        if (sellableAfter < 0) {
            throw new BadRequestException(String.format(
                    "Cannot adjust stock: Resulting sellable quantity (%d) would be less than reserved quantity (%d)",
                    sellableAfter, inventory.getReservedQuantity()
            ));
        }

        inventory.setAvailableQuantity(newAvailable);
        inventory.recalculateStatus();
        Inventory saved = inventoryRepository.save(inventory);

        // Synchronize SKU availability flag
        Sku sku = inventory.getSku();
        sku.setAvailable(saved.getSellableQuantity() > 0);
        skuRepository.save(sku);

        MovementType movementType = request.movementType() != null
                ? request.movementType()
                : (request.adjustmentQuantity() > 0 ? MovementType.STOCK_RECEIVED : MovementType.MANUAL_ADJUSTMENT);

        InventoryMovement movement = new InventoryMovement(
                sku,
                movementType,
                request.adjustmentQuantity(),
                prevAvailable,
                newAvailable,
                request.reason(),
                request.referenceType() != null ? request.referenceType() : "MANUAL_ADJUSTMENT",
                request.referenceId(),
                performedBy != null ? performedBy : "ADMIN"
        );
        movementRepository.save(movement);

        log.info("Inventory adjusted for SKU '{}': {} -> {} (delta: {}, by: {})",
                sku.getSkuCode(), prevAvailable, newAvailable, request.adjustmentQuantity(), performedBy);

        return mapToResponse(saved);
    }

    @Transactional
    public InventoryResponse reserveStock(UUID skuId, int quantity, String referenceId, String performedBy) {
        if (quantity <= 0) {
            throw new BadRequestException("Reservation quantity must be greater than zero");
        }

        Inventory inventory = inventoryRepository.findBySkuIdWithLock(skuId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory for SKU", "skuId", skuId));

        int sellable = inventory.getSellableQuantity();
        if (sellable < quantity) {
            throw new BadRequestException(String.format(
                    "Insufficient sellable stock for SKU '%s': Requested %d, but only %d sellable units remain",
                    inventory.getSku().getSkuCode(), quantity, sellable
            ));
        }

        int prevReserved = inventory.getReservedQuantity();
        int newReserved = prevReserved + quantity;
        inventory.setReservedQuantity(newReserved);
        inventory.recalculateStatus();
        Inventory saved = inventoryRepository.save(inventory);

        InventoryMovement movement = new InventoryMovement(
                inventory.getSku(),
                MovementType.RESERVATION,
                quantity,
                prevReserved,
                newReserved,
                "Stock reserved for checkout order",
                "ORDER",
                referenceId,
                performedBy != null ? performedBy : "CHECKOUT"
        );
        movementRepository.save(movement);

        return mapToResponse(saved);
    }

    @Transactional
    public InventoryResponse releaseStock(UUID skuId, int quantity, String referenceId, String performedBy) {
        if (quantity <= 0) {
            throw new BadRequestException("Release quantity must be greater than zero");
        }

        Inventory inventory = inventoryRepository.findBySkuIdWithLock(skuId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory for SKU", "skuId", skuId));

        int prevReserved = inventory.getReservedQuantity();
        int newReserved = Math.max(0, prevReserved - quantity);
        inventory.setReservedQuantity(newReserved);
        inventory.recalculateStatus();
        Inventory saved = inventoryRepository.save(inventory);

        InventoryMovement movement = new InventoryMovement(
                inventory.getSku(),
                MovementType.RELEASE,
                quantity,
                prevReserved,
                newReserved,
                "Stock reservation released",
                "ORDER",
                referenceId,
                performedBy != null ? performedBy : "CHECKOUT"
        );
        movementRepository.save(movement);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<InventoryMovementResponse> getMovementHistory(UUID skuId, Pageable pageable) {
        Page<InventoryMovement> page = movementRepository.findBySkuIdOrderByCreatedAtDesc(skuId, pageable);
        return new PageResponse<>(
                page.getContent().stream().map(this::mapToMovementResponse).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    @Transactional
    public void initInventoryForSku(Sku sku, int initialStock, int lowStockThreshold, String performedBy) {
        if (!inventoryRepository.existsBySkuId(sku.getId())) {
            Inventory inventory = new Inventory(sku, initialStock, lowStockThreshold);
            inventoryRepository.save(inventory);

            if (initialStock > 0) {
                InventoryMovement movement = new InventoryMovement(
                        sku,
                        MovementType.STOCK_RECEIVED,
                        initialStock,
                        0,
                        initialStock,
                        "Initial stock creation",
                        "SYSTEM_INIT",
                        null,
                        performedBy != null ? performedBy : "SYSTEM"
                );
                movementRepository.save(movement);
            }
        }
    }

    public InventoryResponse mapToResponse(Inventory inventory) {
        Sku sku = inventory.getSku();
        String productName = sku.getVariant() != null && sku.getVariant().getProduct() != null
                ? sku.getVariant().getProduct().getName()
                : "Unknown Product";
        String variantName = sku.getVariant() != null
                ? sku.getVariant().getName()
                : "Standard";

        return new InventoryResponse(
                inventory.getId(),
                sku.getId(),
                sku.getSkuCode(),
                productName,
                variantName,
                inventory.getAvailableQuantity(),
                inventory.getReservedQuantity(),
                inventory.getSellableQuantity(),
                inventory.getSoldQuantity(),
                inventory.getLowStockThreshold(),
                inventory.getStatus(),
                inventory.isLowStock(),
                inventory.isOutOfStock(),
                inventory.getUpdatedAt()
        );
    }

    public InventoryMovementResponse mapToMovementResponse(InventoryMovement m) {
        return new InventoryMovementResponse(
                m.getId(),
                m.getSku().getId(),
                m.getSku().getSkuCode(),
                m.getMovementType(),
                m.getQuantity(),
                m.getPreviousQuantity(),
                m.getNewQuantity(),
                m.getReason(),
                m.getReferenceType(),
                m.getReferenceId(),
                m.getPerformedBy(),
                m.getCreatedAt()
        );
    }
}
