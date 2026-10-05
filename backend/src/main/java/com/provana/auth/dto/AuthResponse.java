package com.provana.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Authentication successful response payload with JWT token")
public record AuthResponse(
        @Schema(description = "JWT Bearer access token")
        String accessToken,

        @Schema(description = "Token type", example = "Bearer")
        String tokenType,

        @Schema(description = "Token validity duration in milliseconds", example = "86400000")
        long expiresInMs,

        @Schema(description = "Authenticated user profile details")
        UserSummaryDto user
) {}
