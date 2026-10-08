package com.provana.auth;

import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

/**
 * PROVANA Enterprise Role Definitions and Central Role → Permission Matrix.
 */
public enum Role {

    /**
     * ADMIN: Complete platform administrator.
     * All permissions across every module. Full ownership of users, roles, system settings, global configs, and audit logs.
     */
    ADMIN(EnumSet.allOf(Permission.class)),

    /**
     * PRODUCT_MANAGER: Complete catalogue management role.
     * Owns products, categories, subcategories, brands, variants, SKUs, media, nutrition, FAQs, and catalogue reports.
     * Explicitly excluded from user management, order operations, inventory writes, and system settings.
     */
    PRODUCT_MANAGER(EnumSet.of(
            // Catalogue & Sub-entities
            Permission.CATALOGUE_READ,
            Permission.CATALOGUE_WRITE,
            Permission.CATALOGUE_CREATE,
            Permission.CATALOGUE_UPDATE,
            Permission.CATALOGUE_DELETE,
            Permission.CATALOGUE_PUBLISH,
            Permission.CATALOGUE_MEDIA_MANAGE,

            Permission.CATEGORY_READ,
            Permission.CATEGORY_CREATE,
            Permission.CATEGORY_UPDATE,
            Permission.CATEGORY_DELETE,

            Permission.SUBCATEGORY_READ,
            Permission.SUBCATEGORY_CREATE,
            Permission.SUBCATEGORY_UPDATE,
            Permission.SUBCATEGORY_DELETE,

            Permission.BRAND_READ,
            Permission.BRAND_CREATE,
            Permission.BRAND_UPDATE,
            Permission.BRAND_DELETE,

            Permission.PRODUCT_READ,
            Permission.PRODUCT_CREATE,
            Permission.PRODUCT_UPDATE,
            Permission.PRODUCT_DELETE,
            Permission.PRODUCT_PUBLISH,

            Permission.PRODUCT_VARIANT_READ,
            Permission.PRODUCT_VARIANT_CREATE,
            Permission.PRODUCT_VARIANT_UPDATE,
            Permission.PRODUCT_VARIANT_DELETE,

            Permission.SKU_READ,
            Permission.SKU_CREATE,
            Permission.SKU_UPDATE,
            Permission.SKU_DELETE,

            Permission.PRODUCT_MEDIA_READ,
            Permission.PRODUCT_MEDIA_CREATE,
            Permission.PRODUCT_MEDIA_UPDATE,
            Permission.PRODUCT_MEDIA_DELETE,

            Permission.PRODUCT_NUTRITION_READ,
            Permission.PRODUCT_NUTRITION_WRITE,

            Permission.PRODUCT_FAQ_READ,
            Permission.PRODUCT_FAQ_WRITE,

            // Reports & AI
            Permission.REPORT_READ,
            Permission.REPORT_CATALOGUE_READ,
            Permission.AI_CATALOGUE_INSIGHTS,
            Permission.AI_PRODUCT_RECOMMENDATION
    )),

    /**
     * MANAGER (STORE MANAGER): Store Operations role.
     * Owns inventory adjustments, order processing, shipments, returns, refunds, customer support, and operational reports.
     * Explicitly excluded from catalogue modifications, user management, and system settings.
     */
    MANAGER(EnumSet.of(
            // Read-only catalogue reference
            Permission.CATALOGUE_READ,
            Permission.CATEGORY_READ,
            Permission.SUBCATEGORY_READ,
            Permission.BRAND_READ,
            Permission.PRODUCT_READ,
            Permission.PRODUCT_VARIANT_READ,
            Permission.SKU_READ,

            // Inventory operations
            Permission.INVENTORY_READ,
            Permission.INVENTORY_WRITE,
            Permission.INVENTORY_UPDATE,
            Permission.INVENTORY_ADJUST,
            Permission.INVENTORY_TRANSFER,
            Permission.INVENTORY_REPORT_READ,

            // Order operations
            Permission.ORDER_MANAGE,
            Permission.ORDER_READ,
            Permission.ORDER_UPDATE,
            Permission.ORDER_STATUS_UPDATE,
            Permission.ORDER_CANCEL,
            Permission.ORDER_FULFILL,
            Permission.ORDER_REPORT_READ,

            // Shipments, Returns, Refunds
            Permission.SHIPMENT_READ,
            Permission.SHIPMENT_CREATE,
            Permission.SHIPMENT_UPDATE,
            Permission.SHIPMENT_TRACK,
            Permission.SHIPMENT_FULFILL,

            Permission.RETURN_READ,
            Permission.RETURN_APPROVE,
            Permission.RETURN_REJECT,
            Permission.RETURN_PROCESS,
            Permission.RETURN_UPDATE,

            Permission.REFUND_READ,
            Permission.REFUND_PROCESS,

            // Operational Customer Support & Reports
            Permission.CUSTOMER_READ,
            Permission.CUSTOMER_SUPPORT,
            Permission.REPORT_READ,
            Permission.REPORT_OPERATIONAL_READ,
            Permission.REPORT_ORDER_READ,
            Permission.ANALYTICS_READ,
            Permission.AI_ORDER_INSIGHTS
    )),

    /**
     * CONTENT_MANAGER: CMS and editorial content role.
     * Owns homepage layout, hero banners, campaign content, landing pages, blogs, and media library.
     * Explicitly excluded from catalogue modifications, orders, inventory, user management, and system settings.
     */
    CONTENT_MANAGER(EnumSet.of(
            // Read-only catalogue reference
            Permission.CATALOGUE_READ,
            Permission.PRODUCT_READ,
            Permission.CATEGORY_READ,
            Permission.BRAND_READ,

            // CMS & Editorial
            Permission.CMS_READ,
            Permission.CMS_CREATE,
            Permission.CMS_UPDATE,
            Permission.CMS_DELETE,
            Permission.CMS_REVIEW,
            Permission.CMS_APPROVE,
            Permission.CMS_PUBLISH,
            Permission.CMS_SCHEDULE,

            // Media Library
            Permission.MEDIA_READ,
            Permission.MEDIA_UPLOAD,
            Permission.MEDIA_UPDATE,
            Permission.MEDIA_DELETE,

            // Content Reports & AI Generation
            Permission.REPORT_READ,
            Permission.REPORT_CONTENT_READ,
            Permission.AI_CONTENT_GENERATE
    )),

    /**
     * ORDER_MANAGER: Order operations and fulfilment specialist.
     * Owns order processing, shipment packing/tracking, and return/refund processing.
     * Explicitly excluded from catalogue modifications, CMS, user management, and system settings.
     */
    ORDER_MANAGER(EnumSet.of(
            // Read-only catalogue reference
            Permission.CATALOGUE_READ,
            Permission.PRODUCT_READ,

            // Order Fulfilment
            Permission.ORDER_MANAGE,
            Permission.ORDER_READ,
            Permission.ORDER_UPDATE,
            Permission.ORDER_STATUS_UPDATE,
            Permission.ORDER_CANCEL,
            Permission.ORDER_FULFILL,
            Permission.ORDER_REPORT_READ,

            // Shipments
            Permission.SHIPMENT_READ,
            Permission.SHIPMENT_CREATE,
            Permission.SHIPMENT_UPDATE,
            Permission.SHIPMENT_TRACK,
            Permission.SHIPMENT_FULFILL,

            // Returns & Refunds
            Permission.RETURN_READ,
            Permission.RETURN_APPROVE,
            Permission.RETURN_REJECT,
            Permission.RETURN_PROCESS,
            Permission.RETURN_UPDATE,
            Permission.REFUND_READ,
            Permission.REFUND_PROCESS,

            // Customer Support & Reports
            Permission.CUSTOMER_READ,
            Permission.CUSTOMER_SUPPORT,
            Permission.REPORT_READ,
            Permission.REPORT_ORDER_READ,
            Permission.AI_ORDER_INSIGHTS
    )),

    /**
     * CUSTOMER: Storefront customer.
     * Browses catalogue, reviews products, uses AI assistant, and manages own cart/wishlist/orders.
     * Strictly 0 administrative permissions.
     */
    CUSTOMER(EnumSet.of(
            Permission.CATALOGUE_READ,
            Permission.CATEGORY_READ,
            Permission.SUBCATEGORY_READ,
            Permission.BRAND_READ,
            Permission.PRODUCT_READ,
            Permission.PRODUCT_VARIANT_READ,
            Permission.SKU_READ,
            Permission.PRODUCT_MEDIA_READ,
            Permission.PRODUCT_NUTRITION_READ,
            Permission.PRODUCT_FAQ_READ,
            Permission.ORDER_CREATE,
            Permission.ORDER_READ,
            Permission.REVIEW_CREATE,
            Permission.REVIEW_READ,
            Permission.AI_ASSISTANT_USE,
            Permission.AI_PRODUCT_RECOMMENDATION
    ));

    private final Set<Permission> permissions;

    Role(Set<Permission> permissions) {
        this.permissions = Collections.unmodifiableSet(permissions);
    }

    public Set<Permission> getPermissions() {
        return permissions;
    }

    public boolean hasPermission(Permission permission) {
        return permissions.contains(permission);
    }

    public boolean hasAnyPermission(Permission... perms) {
        for (Permission p : perms) {
            if (permissions.contains(p)) {
                return true;
            }
        }
        return false;
    }
}
