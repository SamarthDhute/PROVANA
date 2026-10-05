package com.provana.auth.dto;

import com.provana.auth.Permission;
import com.provana.auth.Role;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.Set;
import java.util.UUID;

@Schema(description = "Authenticated user profile summary")
public record UserSummaryDto(
        @Schema(description = "User ID")
        UUID id,

        @Schema(description = "Email", example = "admin@provana.com")
        String email,

        @Schema(description = "First name", example = "Admin")
        String firstName,

        @Schema(description = "Last name", example = "Provana")
        String lastName,

        @Schema(description = "Phone", example = "+919876543210")
        String phone,

        @Schema(description = "Assigned platform role", example = "ADMIN")
        Role role,

        @Schema(description = "Granted granular permissions")
        Set<Permission> permissions
) {}
