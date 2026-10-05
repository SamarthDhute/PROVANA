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
        if (roleHeader == null || roleHeader.trim().isEmpty()) {
            throw new UnauthorizedException("Authentication required: Administrative credentials must be supplied via 'X-Admin-Role'");
        }

        try {
            Role role = Role.valueOf(roleHeader.trim().toUpperCase());
            if (role == Role.CUSTOMER) {
                throw new ForbiddenException("Access denied: Customers are strictly forbidden from accessing admin catalogue endpoints");
            }
            return role;
        } catch (IllegalArgumentException e) {
            throw new ForbiddenException("Access denied: Unrecognized administrative role '" + roleHeader + "'");
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
