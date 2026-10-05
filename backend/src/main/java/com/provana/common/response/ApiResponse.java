package com.provana.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.List;

/**
 * Standard Unified API Response Envelope for all PROVANA REST Endpoints.
 *
 * @param <T> Response payload data type
 */
@Schema(description = "Unified API Response wrapper")
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        @Schema(description = "Indicates if the operation completed successfully", example = "true")
        boolean success,

        @Schema(description = "Descriptive message regarding the outcome", example = "Operation completed successfully")
        String message,

        @Schema(description = "Response payload object")
        T data,

        @Schema(description = "List of validation or domain errors if unsuccessful")
        List<ValidationError> errors,

        @Schema(description = "Timestamp of the response generation (UTC ISO-8601)", example = "2026-10-05T15:00:00Z")
        Instant timestamp,

        @Schema(description = "Request URI path", example = "/api/v1/health")
        String path
) {
    public static <T> ApiResponse<T> success(T data, String message, String path) {
        return new ApiResponse<>(true, message, data, null, Instant.now(), path);
    }

    public static <T> ApiResponse<T> success(T data, String path) {
        return success(data, "Request successful", path);
    }

    public static <T> ApiResponse<T> error(String message, List<ValidationError> errors, String path) {
        return new ApiResponse<>(false, message, null, errors, Instant.now(), path);
    }

    public static <T> ApiResponse<T> error(String message, String path) {
        return error(message, null, path);
    }
}
