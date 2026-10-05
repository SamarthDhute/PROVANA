package com.provana.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "User authentication login request")
public record LoginRequest(
        @Schema(description = "Account email", example = "admin@provana.com")
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid email format")
        String email,

        @Schema(description = "Account password", example = "Admin@123")
        @NotBlank(message = "Password is required")
        String password
) {}
