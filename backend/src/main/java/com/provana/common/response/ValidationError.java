package com.provana.common.response;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Standard representation of a single field validation failure.
 */
@Schema(description = "Details of a validation error on a specific field")
public record ValidationError(
        @Schema(description = "The target field that failed validation", example = "email")
        String field,

        @Schema(description = "Human-readable description of why the field is invalid", example = "Email must be a valid email address")
        String message
) {
}
