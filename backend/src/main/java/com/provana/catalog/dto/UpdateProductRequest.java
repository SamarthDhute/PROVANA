package com.provana.catalog.dto;

import com.provana.catalog.entity.ProductStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;

@Schema(description = "Product update request payload")
public record UpdateProductRequest(
        @Schema(description = "Product name")
        @Size(max = 200, message = "Product name must not exceed 200 characters")
        String name,

        @Schema(description = "Unique URL slug")
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug must be lowercase alphanumeric with hyphens")
        String slug,

        @Schema(description = "Brand ID")
        UUID brandId,

        @Schema(description = "Category ID")
        UUID categoryId,

        @Schema(description = "Subcategory ID")
        UUID subcategoryId,

        @Schema(description = "Goal tag")
        String goalTag,

        @Schema(description = "Badge label")
        String badge,

        @Schema(description = "Short highlight")
        String highlight,

        @Schema(description = "Detailed product description")
        String description,

        @Schema(description = "Minimal description for product cards")
        String minimalDesc,

        @Schema(description = "Key benefits")
        String benefits,

        @Schema(description = "Usage and consumption instructions")
        String usageInstructions,

        @Schema(description = "Detailed ingredients list")
        String ingredients,

        @Schema(description = "Allergens warning")
        String allergens,

        @Schema(description = "Publication status")
        ProductStatus status,

        @Schema(description = "SEO Meta Title")
        String metaTitle,

        @Schema(description = "SEO Meta Description")
        String metaDescription
) {}
