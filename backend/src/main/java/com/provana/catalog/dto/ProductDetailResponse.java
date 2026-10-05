package com.provana.catalog.dto;

import com.provana.catalog.entity.ProductStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Schema(description = "Full Product Detail Page (PDP) response DTO")
public record ProductDetailResponse(
        @Schema(description = "Product ID")
        UUID id,

        @Schema(description = "Product Name")
        String name,

        @Schema(description = "Product URL Slug")
        String slug,

        @Schema(description = "Brand details")
        BrandResponse brand,

        @Schema(description = "Category details")
        CategoryResponse category,

        @Schema(description = "Subcategory details")
        SubcategoryResponse subcategory,

        @Schema(description = "Goal Tag")
        String goalTag,

        @Schema(description = "Badge label")
        String badge,

        @Schema(description = "Key Highlight")
        String highlight,

        @Schema(description = "Detailed description")
        String description,

        @Schema(description = "Minimal description")
        String minimalDesc,

        @Schema(description = "Benefits text")
        String benefits,

        @Schema(description = "Usage instructions")
        String usageInstructions,

        @Schema(description = "Ingredients list")
        String ingredients,

        @Schema(description = "Allergens warning")
        String allergens,

        @Schema(description = "Publication Status")
        ProductStatus status,

        @Schema(description = "SEO Meta Title")
        String metaTitle,

        @Schema(description = "SEO Meta Description")
        String metaDescription,

        @Schema(description = "Publication timestamp")
        Instant publishedAt,

        @Schema(description = "List of product variants with sellable SKUs")
        List<VariantResponse> variants,

        @Schema(description = "List of product media items")
        List<ProductMediaResponse> media,

        @Schema(description = "Nutrition information breakdown")
        NutritionResponse nutrition,

        @Schema(description = "List of frequently asked questions")
        List<ProductFaqResponse> faqs,

        @Schema(description = "Created timestamp")
        Instant createdAt,

        @Schema(description = "Updated timestamp")
        Instant updatedAt
) {}
