package com.provana.catalog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.UUID;

@Schema(description = "SKU creation/update request")
public record SkuRequest(
        @Schema(description = "Variant ID")
        @NotNull(message = "Variant ID is required")
        UUID variantId,

        @Schema(description = "SKU code", example = "PROV-WPI-CHOC-1KG")
        @NotBlank(message = "SKU code is required")
        String skuCode,

        @Schema(description = "Selling Price", example = "2899.00")
        @NotNull(message = "Price is required")
        @PositiveOrZero(message = "Price cannot be negative")
        BigDecimal price,

        @Schema(description = "Compare-at / Original Price", example = "3499.00")
        @PositiveOrZero(message = "Compare-at price cannot be negative")
        BigDecimal compareAtPrice,

        @Schema(description = "Currency", example = "INR")
        String currency,

        @Schema(description = "Is Available for purchase", example = "true")
        Boolean available,

        @Schema(description = "Active status", example = "true")
        Boolean active
) {}
