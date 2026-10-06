package com.provana.user.dto;

import com.provana.auth.Role;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(description = "User summary response for administrative RBAC")
public record UserResponse(
        @Schema(description = "User unique ID")
        UUID id,

        @Schema(description = "User email address")
        String email,

        @Schema(description = "First name")
        String firstName,

        @Schema(description = "Last name")
        String lastName,

        @Schema(description = "Phone number")
        String phone,

        @Schema(description = "Assigned enterprise role")
        Role role,

        @Schema(description = "Active status")
        Boolean active,

        @Schema(description = "Account creation timestamp")
        Instant createdAt,

        @Schema(description = "Account last updated timestamp")
        Instant updatedAt
) {}
