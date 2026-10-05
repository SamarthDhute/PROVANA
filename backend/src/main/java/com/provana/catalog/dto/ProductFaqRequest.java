package com.provana.catalog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Schema(description = "Product FAQ request")
public record ProductFaqRequest(
        @Schema(description = "Product ID")
        @NotNull(message = "Product ID is required")
        UUID productId,

        @Schema(description = "Question text")
        @NotBlank(message = "Question is required")
        String question,

        @Schema(description = "Answer text")
        @NotBlank(message = "Answer is required")
        String answer,

        @Schema(description = "Sort order", example = "1")
        Integer sortOrder,

        @Schema(description = "Active status", example = "true")
        Boolean active
) {}
