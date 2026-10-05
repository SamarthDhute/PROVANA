package com.provana.catalog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.UUID;

@Schema(description = "Brand response payload")
public record BrandResponse(
        @Schema(description = "Brand ID")
        UUID id,

        @Schema(description = "Brand Name", example = "PROVANA")
        String name,

        @Schema(description = "URL Slug", example = "provana")
        String slug,

        @Schema(description = "Brand Description")
        String description,

        @Schema(description = "Brand Logo URL")
        String logoUrl,

        @Schema(description = "Active status")
        Boolean active,

        @Schema(description = "Creation timestamp")
        Instant createdAt,

        @Schema(description = "Last update timestamp")
        Instant updatedAt
) {}
