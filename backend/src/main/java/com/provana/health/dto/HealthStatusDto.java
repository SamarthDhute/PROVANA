package com.provana.health.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

/**
 * Diagnostic payload describing system runtime health and persistence connectivity.
 */
@Schema(description = "System Health and Environment Diagnostic Details")
public record HealthStatusDto(
        @Schema(description = "Overall platform operational health status", example = "UP")
        String status,

        @Schema(description = "Database connectivity probe result", example = "CONNECTED")
        String database,

        @Schema(description = "Platform version identifier", example = "1.0.0-PHASE0")
        String version,

        @Schema(description = "Active environment profile", example = "dev")
        String environment,

        @Schema(description = "System uptime in seconds", example = "342")
        long uptimeSeconds,

        @Schema(description = "Timestamp of the diagnostic probe check")
        Instant timestamp
) {
}
