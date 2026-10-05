package com.provana.catalog.dto;

import com.provana.catalog.entity.ProductStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Schema(description = "Product card / catalogue listing summary DTO")
public record ProductSummaryResponse(
        @Schema(description = "Product ID")
        UUID id,

        @Schema(description = "Product Name")
        String name,

        @Schema(description = "Product URL Slug")
        String slug,

        @Schema(description = "Brand ID")
        UUID brandId,

        @Schema(description = "Brand Name")
        String brandName,

        @Schema(description = "Category ID")
        UUID categoryId,

        @Schema(description = "Category Name")
        String categoryName,

        @Schema(description = "Subcategory ID")
        UUID subcategoryId,

        @Schema(description = "Subcategory Name")
        String subcategoryName,

        @Schema(description = "Goal Tag")
        String goalTag,

        @Schema(description = "Badge label")
        String badge,

        @Schema(description = "Key Highlight")
        String highlight,

        @Schema(description = "Minimal description for product cards")
        String minimalDesc,

        @Schema(description = "Publication Status")
        ProductStatus status,

        @Schema(description = "Lowest sellable SKU price")
        BigDecimal startingPrice,

        @Schema(description = "Compare-at / Original reference price")
        BigDecimal compareAtPrice,

        @Schema(description = "Primary display image URL")
        String primaryImageUrl,

        @Schema(description = "Average rating", example = "4.9")
        Double rating,

        @Schema(description = "Review count", example = "128")
        Integer reviewCount,

        @Schema(description = "Created timestamp")
        Instant createdAt
) {}
