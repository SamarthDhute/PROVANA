package com.provana.auth;

/**
 * Granular PROVANA Enterprise RBAC Permissions.
 * Categorized by business domain and architectural boundary.
 */
public enum Permission {

    // ==========================================
    // 1. CATALOGUE & GENERAL COMMERCE
    // ==========================================
    CATALOGUE_READ,
    CATALOGUE_WRITE,
    CATALOGUE_CREATE,
    CATALOGUE_UPDATE,
    CATALOGUE_DELETE,
    CATALOGUE_PUBLISH,
    CATALOGUE_MEDIA_MANAGE,

    // Category
    CATEGORY_READ,
    CATEGORY_CREATE,
    CATEGORY_UPDATE,
    CATEGORY_DELETE,

    // Subcategory
    SUBCATEGORY_READ,
    SUBCATEGORY_CREATE,
    SUBCATEGORY_UPDATE,
    SUBCATEGORY_DELETE,

    // Brand
    BRAND_READ,
    BRAND_CREATE,
    BRAND_UPDATE,
    BRAND_DELETE,

    // Product
    PRODUCT_READ,
    PRODUCT_CREATE,
    PRODUCT_UPDATE,
    PRODUCT_DELETE,
    PRODUCT_PUBLISH,

    // Variant & SKU
    PRODUCT_VARIANT_READ,
    PRODUCT_VARIANT_CREATE,
    PRODUCT_VARIANT_UPDATE,
    PRODUCT_VARIANT_DELETE,

    SKU_READ,
    SKU_CREATE,
    SKU_UPDATE,
    SKU_DELETE,

    // Media, Nutrition, FAQs
    PRODUCT_MEDIA_READ,
    PRODUCT_MEDIA_CREATE,
    PRODUCT_MEDIA_UPDATE,
    PRODUCT_MEDIA_DELETE,

    PRODUCT_NUTRITION_READ,
    PRODUCT_NUTRITION_WRITE,

    PRODUCT_FAQ_READ,
    PRODUCT_FAQ_WRITE,

    // ==========================================
    // 2. INVENTORY & STORE OPERATIONS
    // ==========================================
    INVENTORY_READ,
    INVENTORY_WRITE,
    INVENTORY_ADJUST,
    INVENTORY_TRANSFER,
    INVENTORY_REPORT_READ,

    // ==========================================
    // 3. ORDERS, PAYMENTS, SHIPMENTS, REFUNDS
    // ==========================================
    ORDER_MANAGE,
    ORDER_READ,
    ORDER_CREATE,
    ORDER_UPDATE,
    ORDER_STATUS_UPDATE,
    ORDER_CANCEL,
    ORDER_FULFILL,
    ORDER_REPORT_READ,

    PAYMENT_READ,
    PAYMENT_VERIFY,
    PAYMENT_REFUND,

    SHIPMENT_READ,
    SHIPMENT_CREATE,
    SHIPMENT_UPDATE,
    SHIPMENT_TRACK,
    SHIPMENT_FULFILL,

    RETURN_READ,
    RETURN_APPROVE,
    RETURN_REJECT,
    RETURN_PROCESS,

    REFUND_READ,
    REFUND_CREATE,
    REFUND_APPROVE,
    REFUND_PROCESS,

    // ==========================================
    // 4. CUSTOMER MANAGEMENT & SUPPORT
    // ==========================================
    CUSTOMER_READ,
    CUSTOMER_UPDATE,
    CUSTOMER_SUPPORT,

    // ==========================================
    // 5. USER / RBAC MANAGEMENT (ADMIN ONLY)
    // ==========================================
    USER_MANAGE,
    USER_READ,
    USER_CREATE,
    USER_UPDATE,
    USER_DELETE,

    ROLE_READ,
    ROLE_CREATE,
    ROLE_UPDATE,
    ROLE_DELETE,

    PERMISSION_READ,
    PERMISSION_ASSIGN,
    PERMISSION_REVOKE,

    RBAC_MANAGE,

    // ==========================================
    // 6. CMS & EDITORIAL CONTENT
    // ==========================================
    CMS_READ,
    CMS_CREATE,
    CMS_UPDATE,
    CMS_DELETE,
    CMS_REVIEW,
    CMS_APPROVE,
    CMS_PUBLISH,
    CMS_SCHEDULE,

    MEDIA_READ,
    MEDIA_UPLOAD,
    MEDIA_UPDATE,
    MEDIA_DELETE,

    // ==========================================
    // 7. MARKETING (COUPONS, DISCOUNTS, CAMPAIGNS)
    // ==========================================
    COUPON_READ,
    COUPON_CREATE,
    COUPON_UPDATE,
    COUPON_DELETE,

    DISCOUNT_READ,
    DISCOUNT_CREATE,
    DISCOUNT_UPDATE,
    DISCOUNT_DELETE,

    CAMPAIGN_READ,
    CAMPAIGN_CREATE,
    CAMPAIGN_UPDATE,
    CAMPAIGN_DELETE,
    CAMPAIGN_PUBLISH,

    // ==========================================
    // 8. REVIEWS MODERATION
    // ==========================================
    REVIEW_READ,
    REVIEW_CREATE,
    REVIEW_MODERATE,
    REVIEW_APPROVE,
    REVIEW_REJECT,
    REVIEW_DELETE,

    // ==========================================
    // 9. REPORTS & ANALYTICS
    // ==========================================
    REPORT_READ,
    REPORT_EXPORT,
    REPORT_OPERATIONAL_READ,
    REPORT_CATALOGUE_READ,
    REPORT_ORDER_READ,
    REPORT_CONTENT_READ,

    ANALYTICS_READ,
    ANALYTICS_EXPORT,

    // ==========================================
    // 10. AI TOOLS & INSIGHTS
    // ==========================================
    AI_ASSISTANT_USE,
    AI_PRODUCT_RECOMMENDATION,
    AI_CATALOGUE_INSIGHTS,
    AI_ORDER_INSIGHTS,
    AI_CONTENT_GENERATE,
    AI_ADMIN_INSIGHTS,

    // ==========================================
    // 11. SYSTEM SETTINGS & AUDIT LOGS
    // ==========================================
    SYSTEM_SETTINGS_READ,
    SYSTEM_SETTINGS_UPDATE,
    AUDIT_LOG_READ
}
