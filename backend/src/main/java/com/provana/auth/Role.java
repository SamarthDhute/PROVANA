package com.provana.auth;

import java.util.Collections;
import java.util.Set;

/**
 * PROVANA Platform User Roles.
 */
public enum Role {
    ADMIN(Set.of(
            Permission.CATALOGUE_READ,
            Permission.CATALOGUE_WRITE,
            Permission.CATALOGUE_DELETE,
            Permission.ORDER_MANAGE,
            Permission.USER_MANAGE
    )),
    PRODUCT_MANAGER(Set.of(
            Permission.CATALOGUE_READ,
            Permission.CATALOGUE_WRITE,
            Permission.CATALOGUE_DELETE
    )),
    MANAGER(Set.of(
            Permission.CATALOGUE_READ,
            Permission.ORDER_MANAGE
    )),
    CONTENT_MANAGER(Set.of(
            Permission.CATALOGUE_READ,
            Permission.CATALOGUE_WRITE
    )),
    ORDER_MANAGER(Set.of(
            Permission.ORDER_MANAGE
    )),
    CUSTOMER(Collections.emptySet());

    private final Set<Permission> permissions;

    Role(Set<Permission> permissions) {
        this.permissions = permissions;
    }

    public Set<Permission> getPermissions() {
        return permissions;
    }

    public boolean hasPermission(Permission permission) {
        return permissions.contains(permission);
    }
}
