package com.provana.auth;

import com.provana.auth.dto.AuthResponse;
import com.provana.auth.dto.LoginRequest;
import com.provana.auth.dto.RegisterRequest;
import com.provana.auth.dto.UserSummaryDto;
import com.provana.common.exception.UnauthorizedException;
import com.provana.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication & User Access", description = "Endpoints for customer registration, role-based login, and session profile")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register customer account", description = "Creates a new customer account with hashed password and returns JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response, "Account registered successfully"));
    }

    @PostMapping("/login")
    @Operation(summary = "User / Admin login", description = "Verifies email and password credentials, returning JWT token with role claims")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Authentication successful"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated profile", description = "Returns profile details, assigned role, and permissions of currently authenticated user")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new UnauthorizedException("Authentication required: Please provide a valid Bearer token");
        }

        String email = auth.getName();
        UserSummaryDto user = authService.getCurrentUser(email);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Stateless logout acknowledgment")
    public ResponseEntity<ApiResponse<Void>> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(ApiResponse.ok(null, "Logged out successfully"));
    }
}
