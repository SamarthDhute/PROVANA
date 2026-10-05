package com.provana.catalog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.UUID;

@Schema(description = "Subcategory response payload")
public record SubcategoryResponse(
        @Schema(description = "Subcategory ID")
        UUID id,

        @Schema(description = "Parent Category ID")
        UUID categoryId,

        @Schema(description = "Parent Category Name")
        String categoryName,

        @Schema(description = "Subcategory Name", example = "Whey Protein")
        String name,

        @Schema(description = "URL Slug", example = "whey-protein")
        String slug,

        @Schema(description = "Subcategory Description")
        String description,

        @Schema(description = "Active status")
        Boolean active,

        @Schema(description = "Display sort order")
        Integer sortOrder,

        @Schema(description = "Creation timestamp")
        Instant createdAt,

        @Schema(description = "Last update timestamp")
        Instant updatedAt
) {}
