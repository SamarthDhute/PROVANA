package com.provana.auth;

import com.provana.common.exception.ForbiddenException;
import com.provana.common.exception.UnauthorizedException;
import org.springframework.stereotype.Service;

/**
 * Service to verify authentication and granular permissions for administrative catalogue APIs.
 */
@Service
public class AdminSecurityService {

    public Role verifyRole(String roleHeader) {
        String effectiveRole = roleHeader;

        if (effectiveRole == null || effectiveRole.trim().isEmpty()) {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getAuthorities() != null
                    && !(auth instanceof org.springframework.security.authentication.AnonymousAuthenticationToken)
                    && !"anonymousUser".equals(auth.getPrincipal())) {
                for (var authority : auth.getAuthorities()) {
                    String authName = authority.getAuthority();
                    if (authName.startsWith("ROLE_")) {
                        effectiveRole = authName.substring(5);
                        break;
                    }
                }
            }
        }

        if (effectiveRole == null || effectiveRole.trim().isEmpty()) {
            throw new UnauthorizedException("Authentication required: Administrative credentials must be supplied via 'X-Admin-Role' or JWT Bearer token");
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

    public void checkPermission(String roleHeader, Permission requiredPermission) {
        Role role = verifyRole(roleHeader);
        if (!role.hasPermission(requiredPermission)) {
            throw new ForbiddenException(String.format(
                    "Access denied: Role '%s' lacks required permission '%s'",
                    role.name(),
                    requiredPermission.name()
            ));
        }
    }
}
