package com.provana.catalog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Brand creation/update request")
public record BrandRequest(
        @Schema(description = "Brand Name", example = "PROVANA")
        @NotBlank(message = "Brand name is required")
        @Size(max = 100, message = "Brand name must not exceed 100 characters")
        String name,

        @Schema(description = "URL Slug", example = "provana")
        @NotBlank(message = "Slug is required")
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug must be lowercase alphanumeric with hyphens")
        String slug,

        @Schema(description = "Brand Description")
        String description,

        @Schema(description = "Brand Logo URL")
        String logoUrl,

        @Schema(description = "Active status", example = "true")
        Boolean active
) {}
