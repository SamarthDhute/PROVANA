package com.provana.catalog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Schema(description = "Product media creation/update request")
public record ProductMediaRequest(
        @Schema(description = "Product ID")
        @NotNull(message = "Product ID is required")
        UUID productId,

        @Schema(description = "Variant ID (optional)")
        UUID variantId,

        @Schema(description = "Media Type (IMAGE or VIDEO)", example = "IMAGE")
        String mediaType,

        @Schema(description = "Media URL")
        @NotBlank(message = "Media URL is required")
        String url,

        @Schema(description = "Image Alt Text")
        String altText,

        @Schema(description = "Is Primary Display Image")
        Boolean isPrimary,

        @Schema(description = "Display sort order")
        Integer sortOrder,

        @Schema(description = "Active status")
        Boolean active
) {}
