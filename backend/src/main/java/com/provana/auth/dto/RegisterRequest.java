package com.provana.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "User registration request payload")
public record RegisterRequest(
        @Schema(description = "User email address", example = "athlete@provana.com")
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid email format")
        String email,

        @Schema(description = "Account password (min 8 characters)", example = "Athlete@123")
        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters long")
        String password,

        @Schema(description = "First name", example = "Aarav")
        @NotBlank(message = "First name is required")
        String firstName,

        @Schema(description = "Last name", example = "Sharma")
        String lastName,

        @Schema(description = "Phone number", example = "+919876543210")
        String phone
) {}
