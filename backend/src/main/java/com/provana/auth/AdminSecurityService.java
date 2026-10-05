package com.provana.auth;

import com.provana.common.exception.ForbiddenException;
import com.provana.common.exception.UnauthorizedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Service to verify authentication and granular permissions for administrative catalogue APIs.
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
        if (auth.getAuthorities() != null) {
            for (var authority : auth.getAuthorities()) {
                String authName = authority.getAuthority();
                if (authName.startsWith("ROLE_")) {
                    effectiveRole = authName.substring(5);
                    break;
                }
            }
        }

        if (effectiveRole == null || effectiveRole.trim().isEmpty()) {
            throw new UnauthorizedException("Authentication required: No role assigned in authenticated security context");
        }

        try {
            Role role = Role.valueOf(effectiveRole.trim().toUpperCase());
            if (role == Role.CUSTOMER) {
                throw new ForbiddenException("Access denied: Customers are strictly forbidden from accessing admin catalogue endpoints");
            }
            return role;
        } catch (IllegalArgumentException e) {
            throw new ForbiddenException("Access denied: Unrecognized administrative role '" + effectiveRole + "'");
        }
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

    /**
     * Backward-compatible overload. The roleHeader argument is strictly ignored.
     * All security decisions are sourced from the authenticated SecurityContext.
     */
    public void checkPermission(String roleHeader, Permission requiredPermission) {
        checkPermission(requiredPermission);
    }
}
