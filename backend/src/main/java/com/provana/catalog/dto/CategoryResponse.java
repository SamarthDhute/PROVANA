package com.provana.catalog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.UUID;

@Schema(description = "Category response payload")
public record CategoryResponse(
        @Schema(description = "Category ID")
        UUID id,

        @Schema(description = "Category Name", example = "Protein")
        String name,

        @Schema(description = "URL Slug", example = "protein")
        String slug,

        @Schema(description = "Category Description")
        String description,

        @Schema(description = "Category Image URL")
        String imageUrl,

        @Schema(description = "Active status")
        Boolean active,

        @Schema(description = "Display sort order")
        Integer sortOrder,

        @Schema(description = "Creation timestamp")
        Instant createdAt,

        @Schema(description = "Last update timestamp")
        Instant updatedAt
) {}
