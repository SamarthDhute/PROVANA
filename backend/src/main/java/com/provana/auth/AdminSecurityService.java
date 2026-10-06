package com.provana.auth;

import com.provana.common.exception.ForbiddenException;
import com.provana.common.exception.UnauthorizedException;
import com.provana.user.entity.User;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Service to verify authentication and granular permissions for administrative APIs.
 * Authorization is strictly anchored to the authenticated JWT SecurityContext.
 * Client-provided role headers (e.g. X-Admin-Role) are completely ignored.
 */
@Service
public class AdminSecurityService {

    public Role verifyRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()
                || auth instanceof AnonymousAuthenticationToken
                || "anonymousUser".equals(auth.getPrincipal())) {
            throw new UnauthorizedException("Authentication required: Administrative credentials must be supplied via a valid JWT Bearer token");
        }

        String effectiveRole = null;
        if (auth.getPrincipal() instanceof User user && user.getRole() != null) {
            effectiveRole = user.getRole().name();
        } else if (auth.getAuthorities() != null) {
            for (var authority : auth.getAuthorities()) {
                String authName = authority.getAuthority();
                if (authName.startsWith("ROLE_")) {
                    String candidate = authName.substring(5);
                    try {
                        Role r = Role.valueOf(candidate.trim().toUpperCase());
                        effectiveRole = r.name();
                        break;
                    } catch (IllegalArgumentException ignored) {
                        // Authority was a permission name prefixed with ROLE_, not a valid Role
                    }
                }
            }
        }

        if (effectiveRole == null || effectiveRole.trim().isEmpty()) {
            throw new UnauthorizedException("Authentication required: No role assigned in authenticated security context");
        }

        try {
            Role role = Role.valueOf(effectiveRole.trim().toUpperCase());
            if (role == Role.CUSTOMER) {
                throw new ForbiddenException("Access denied: Customers are strictly forbidden from accessing administrative endpoints");
            }
            return role;
        } catch (IllegalArgumentException e) {
            throw new ForbiddenException("Access denied: Unrecognized administrative role '" + effectiveRole + "'");
        }
    }

    public Role verifyRole(String roleHeader) {
        return verifyRole();
    }

    public void checkPermission(Permission requiredPermission) {
        Role role = verifyRole();
        if (!role.hasPermission(requiredPermission)) {
            throw new ForbiddenException(String.format(
                    "Access denied: Role '%s' lacks required permission '%s'",
                    role.name(),
                    requiredPermission.name()
            ));
        }
    }

    public void checkAnyPermission(Permission... requiredPermissions) {
        Role role = verifyRole();
        if (!role.hasAnyPermission(requiredPermissions)) {
            throw new ForbiddenException(String.format(
                    "Access denied: Role '%s' lacks required permissions for this operation",
                    role.name()
            ));
        }
    }

    /**
     * Backward-compatible overload. The roleHeader argument is strictly ignored.
     * All security decisions are sourced from the authenticated SecurityContext.
     */
    public void checkPermission(String roleHeader, Permission requiredPermission) {
        checkPermission(requiredPermission);
    }

    /**
     * Backward-compatible overload for multiple permissions.
     */
    public void checkAnyPermission(String roleHeader, Permission... requiredPermissions) {
        checkAnyPermission(requiredPermissions);
    }

    /**
     * Verifies resource ownership or elevated administrator privileges.
     *
     * @param ownerId The UUID of the customer/user who owns the resource.
     * @param currentUserId The UUID of the authenticated user performing the action.
     */
    public void checkOwnershipOrAdmin(UUID ownerId, UUID currentUserId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new UnauthorizedException("Authentication required");
        }

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_MANAGER") || a.getAuthority().equals("ROLE_ORDER_MANAGER"));

        if (!isAdmin && (ownerId == null || !ownerId.equals(currentUserId))) {
            throw new ForbiddenException("Access denied: You do not have permission to access or modify another customer's resource");
        }
    }
}
