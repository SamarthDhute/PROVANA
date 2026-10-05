package com.provana.catalog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.UUID;

@Schema(description = "Nutritional profile response")
public record NutritionResponse(
        @Schema(description = "Nutrition ID")
        UUID id,

        @Schema(description = "Serving size", example = "1 Scoop (30g)")
        String servingSize,

        @Schema(description = "Servings per container", example = "33")
        Integer servingsPerContainer,

        @Schema(description = "Energy in kcal", example = "120")
        Integer calories,

        @Schema(description = "Protein in grams", example = "27.00")
        BigDecimal proteinG,

        @Schema(description = "Carbohydrates in grams", example = "1.50")
        BigDecimal carbsG,

        @Schema(description = "Fat in grams", example = "0.50")
        BigDecimal fatG,

        @Schema(description = "Dietary Fiber in grams", example = "0.00")
        BigDecimal fiberG,

        @Schema(description = "Total Sugars in grams", example = "0.00")
        BigDecimal sugarG,

        @Schema(description = "Sodium in milligrams", example = "140.00")
        BigDecimal sodiumMg,

        @Schema(description = "Extensible micronutrient/BCAA metrics JSON")
        String metricsJson
) {}
