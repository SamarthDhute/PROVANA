package com.provana.catalog.dto;

import com.provana.catalog.entity.ProductStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;

@Schema(description = "Product creation request payload")
public record CreateProductRequest(
        @Schema(description = "Product name", example = "Provana 100% Pure Whey Isolate")
        @NotBlank(message = "Product name is required")
        @Size(max = 200, message = "Product name must not exceed 200 characters")
        String name,

        @Schema(description = "Unique URL slug", example = "provana-100-pure-whey-isolate")
        @NotBlank(message = "Slug is required")
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug must be lowercase alphanumeric with hyphens")
        String slug,

        @Schema(description = "Brand ID")
        @NotNull(message = "Brand ID is required")
        UUID brandId,

        @Schema(description = "Category ID")
        @NotNull(message = "Category ID is required")
        UUID categoryId,

        @Schema(description = "Subcategory ID (optional)")
        UUID subcategoryId,

        @Schema(description = "Goal tag", example = "Muscle Building")
        String goalTag,

        @Schema(description = "Badge label", example = "Best Seller")
        String badge,

        @Schema(description = "Short highlight", example = "27g Pure Isolate Protein | Zero Sugar")
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

        @Schema(description = "Publication status (DRAFT, PUBLISHED, UNPUBLISHED)", example = "DRAFT")
        ProductStatus status,

        @Schema(description = "SEO Meta Title")
        String metaTitle,

        @Schema(description = "SEO Meta Description")
        String metaDescription
) {}
