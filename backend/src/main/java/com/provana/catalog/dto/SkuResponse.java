package com.provana.catalog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.UUID;

@Schema(description = "SKU response payload")
public record SkuResponse(
        @Schema(description = "SKU ID")
        UUID id,

        @Schema(description = "Variant ID")
        UUID variantId,

        @Schema(description = "SKU code", example = "PROV-WPI-CHOC-1KG")
        String skuCode,

        @Schema(description = "Selling Price", example = "2899.00")
        BigDecimal price,

        @Schema(description = "Compare-at Price", example = "3499.00")
        BigDecimal compareAtPrice,

        @Schema(description = "Currency", example = "INR")
        String currency,

        @Schema(description = "Is Available for purchase")
        Boolean available,

        @Schema(description = "Active status")
        Boolean active
) {}
