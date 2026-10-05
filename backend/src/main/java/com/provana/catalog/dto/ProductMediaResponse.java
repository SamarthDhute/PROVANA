package com.provana.catalog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;

@Schema(description = "Product media response payload")
public record ProductMediaResponse(
        @Schema(description = "Media ID")
        UUID id,

        @Schema(description = "Product ID")
        UUID productId,

        @Schema(description = "Variant ID")
        UUID variantId,

        @Schema(description = "Media Type (IMAGE or VIDEO)")
        String mediaType,

        @Schema(description = "Media URL")
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
