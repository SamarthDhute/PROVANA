package com.provana.catalog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Category creation/update request")
public record CategoryRequest(
        @Schema(description = "Category Name", example = "Protein")
        @NotBlank(message = "Category name is required")
        @Size(max = 100, message = "Category name must not exceed 100 characters")
        String name,

        @Schema(description = "URL Slug", example = "protein")
        @NotBlank(message = "Slug is required")
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug must be lowercase alphanumeric with hyphens")
        String slug,

        @Schema(description = "Category Description")
        String description,

        @Schema(description = "Category Image URL")
        String imageUrl,

        @Schema(description = "Active status", example = "true")
        Boolean active,

        @Schema(description = "Display sort order", example = "1")
        Integer sortOrder
) {}
