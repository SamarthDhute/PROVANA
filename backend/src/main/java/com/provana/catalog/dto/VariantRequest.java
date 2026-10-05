package com.provana.catalog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Schema(description = "Product variant creation/update request")
public record VariantRequest(
        @Schema(description = "Product ID")
        @NotNull(message = "Product ID is required")
        UUID productId,

        @Schema(description = "Variant Name", example = "Chocolate / 1kg")
        @NotBlank(message = "Variant name is required")
        String name,

        @Schema(description = "Flavor attribute", example = "Rich Chocolate")
        String flavor,

        @Schema(description = "Size attribute", example = "1kg")
        String size,

        @Schema(description = "Extensible attributes JSON")
        String attributesJson,

        @Schema(description = "Active status", example = "true")
        Boolean active,

        @Schema(description = "Display sort order", example = "1")
        Integer sortOrder
) {}
