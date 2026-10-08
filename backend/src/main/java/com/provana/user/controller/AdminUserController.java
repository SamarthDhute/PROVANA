package com.provana.user.controller;

import com.provana.auth.AdminSecurityService;
import com.provana.auth.Permission;
import com.provana.common.exception.ResourceNotFoundException;
import com.provana.common.response.ApiResponse;
import com.provana.user.dto.UpdateUserRoleRequest;
import com.provana.user.dto.UserResponse;
import com.provana.user.entity.User;
import com.provana.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/users")
@Tag(name = "Admin: User & RBAC Management", description = "Administrative User and RBAC management APIs (ADMIN ONLY)")
public class AdminUserController {

    private final UserRepository userRepository;
    private final AdminSecurityService securityService;

    public AdminUserController(UserRepository userRepository, AdminSecurityService securityService) {
        this.userRepository = userRepository;
        this.securityService = securityService;
    }

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('USER_READ')")
    @Operation(summary = "List all platform users", description = "Requires USER_READ permission (ADMIN ONLY)")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        securityService.checkPermission(Permission.USER_READ);
        List<UserResponse> responses = userRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();

        return ResponseEntity.ok(ApiResponse.ok(responses));
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('USER_READ')")
    @Operation(summary = "Get user by ID", description = "Requires USER_READ permission (ADMIN ONLY)")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable UUID id) {
        securityService.checkPermission(Permission.USER_READ);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        return ResponseEntity.ok(ApiResponse.ok(mapToResponse(user)));
    }

    @PatchMapping("/{id}/role")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('ROLE_UPDATE')")
    @Operation(summary = "Update user role", description = "Requires ROLE_UPDATE permission (ADMIN ONLY)")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRoleRequest request) {

        securityService.checkPermission(Permission.ROLE_UPDATE);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setRole(request.role());
        User saved = userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.ok(mapToResponse(saved), "User role updated to " + request.role()));
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('USER_DELETE')")
    @Operation(summary = "Deactivate user", description = "Requires USER_DELETE permission (ADMIN ONLY)")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable UUID id) {
        securityService.checkPermission(Permission.USER_DELETE);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setActive(false);
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.ok(null, "User deactivated successfully"));
    }

    private UserResponse mapToResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getRole(),
                user.getActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
