package com.provana.catalog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;

@Schema(description = "Subcategory creation/update request")
public record SubcategoryRequest(
        @Schema(description = "Parent Category ID")
        @NotNull(message = "Category ID is required")
        UUID categoryId,

        @Schema(description = "Subcategory Name", example = "Whey Protein")
        @NotBlank(message = "Subcategory name is required")
        @Size(max = 100, message = "Subcategory name must not exceed 100 characters")
        String name,

        @Schema(description = "URL Slug", example = "whey-protein")
        @NotBlank(message = "Slug is required")
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug must be lowercase alphanumeric with hyphens")
        String slug,

        @Schema(description = "Subcategory Description")
        String description,

        @Schema(description = "Active status", example = "true")
        Boolean active,

        @Schema(description = "Display sort order", example = "1")
        Integer sortOrder
) {}
