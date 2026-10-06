package com.provana.user.dto;

import com.provana.auth.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Update user role request payload")
public record UpdateUserRoleRequest(
        @Schema(description = "New enterprise role", example = "PRODUCT_MANAGER")
        @NotNull(message = "Role is required")
        Role role
) {}
