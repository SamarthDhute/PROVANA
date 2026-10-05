package com.provana.catalog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;

@Schema(description = "Product FAQ response")
public record ProductFaqResponse(
        @Schema(description = "FAQ ID")
        UUID id,

        @Schema(description = "Question text")
        String question,

        @Schema(description = "Answer text")
        String answer,

        @Schema(description = "Display sort order")
        Integer sortOrder,

        @Schema(description = "Active status")
        Boolean active
) {}
