package com.provana.catalog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import java.util.UUID;

@Schema(description = "Product variant response payload")
public record VariantResponse(
        @Schema(description = "Variant ID")
        UUID id,

        @Schema(description = "Product ID")
        UUID productId,

        @Schema(description = "Variant Name", example = "Chocolate / 1kg")
        String name,

        @Schema(description = "Flavor attribute", example = "Rich Chocolate")
        String flavor,

        @Schema(description = "Size attribute", example = "1kg")
        String size,

        @Schema(description = "Extensible attributes JSON")
        String attributesJson,

        @Schema(description = "Active status")
        Boolean active,

        @Schema(description = "Display sort order")
        Integer sortOrder,

        @Schema(description = "Associated sellable SKUs")
        List<SkuResponse> skus
) {}
