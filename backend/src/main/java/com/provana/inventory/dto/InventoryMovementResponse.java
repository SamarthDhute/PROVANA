package com.provana.inventory.dto;

import com.provana.inventory.entity.MovementType;

import java.time.Instant;
import java.util.UUID;

public record InventoryMovementResponse(
        UUID id,
        UUID skuId,
        String skuCode,
        MovementType movementType,
        Integer quantity,
        Integer previousQuantity,
        Integer newQuantity,
        String reason,
        String referenceType,
        String referenceId,
        String performedBy,
        Instant createdAt
) {
}
