package com.provana.inventory.dto;

import com.provana.inventory.entity.InventoryStatus;

import java.time.Instant;
import java.util.UUID;

public record InventoryResponse(
        UUID id,
        UUID skuId,
        String skuCode,
        String productName,
        String variantName,
        Integer availableQuantity,
        Integer reservedQuantity,
        Integer sellableQuantity,
        Integer soldQuantity,
        Integer lowStockThreshold,
        InventoryStatus status,
        boolean isLowStock,
        boolean isOutOfStock,
        Instant updatedAt
) {
}
