package com.provana.inventory.dto;

import com.provana.inventory.entity.MovementType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record InventoryAdjustmentRequest(
        @NotNull(message = "Adjustment quantity cannot be null")
        Integer adjustmentQuantity,

        MovementType movementType,

        @NotBlank(message = "Reason for stock adjustment is required")
        String reason,

        String referenceType,

        String referenceId
) {
}
