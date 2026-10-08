package com.provana.auth;

import com.provana.common.exception.ForbiddenException;
import com.provana.user.entity.User;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RbacMatrixIntegrationTest {

    private AdminSecurityService securityService;

    @BeforeEach
    void setUp() {
        securityService = new AdminSecurityService();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(Role role, String email) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(email);
        user.setRole(role);
        user.setFirstName("Test");
        user.setLastName(role.name());
        user.setActive(true);

        List<SimpleGrantedAuthority> authorities = role.getPermissions().stream()
                .map(p -> new SimpleGrantedAuthority(p.name()))
                .collect(Collectors.toList());
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role.name()));

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(user, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    // ==========================================
    // 1. ADMIN ROLE TESTS
    // ==========================================
    @Test
    @DisplayName("ADMIN has full permissions across all domains")
    void admin_HasAllPermissions() {
        authenticateAs(Role.ADMIN, "admin@provana.com");

        assertThat(Role.ADMIN.hasPermission(Permission.CATALOGUE_CREATE)).isTrue();
        assertThat(Role.ADMIN.hasPermission(Permission.CATALOGUE_DELETE)).isTrue();
        assertThat(Role.ADMIN.hasPermission(Permission.INVENTORY_ADJUST)).isTrue();
        assertThat(Role.ADMIN.hasPermission(Permission.ORDER_STATUS_UPDATE)).isTrue();
        assertThat(Role.ADMIN.hasPermission(Permission.USER_CREATE)).isTrue();
        assertThat(Role.ADMIN.hasPermission(Permission.USER_DELETE)).isTrue();
        assertThat(Role.ADMIN.hasPermission(Permission.ROLE_UPDATE)).isTrue();
        assertThat(Role.ADMIN.hasPermission(Permission.SYSTEM_SETTINGS_UPDATE)).isTrue();
        assertThat(Role.ADMIN.hasPermission(Permission.CMS_PUBLISH)).isTrue();
        assertThat(Role.ADMIN.hasPermission(Permission.AUDIT_LOG_READ)).isTrue();

        assertThatCode(() -> securityService.checkPermission(Permission.USER_CREATE))
                .doesNotThrowAnyException();
        assertThatCode(() -> securityService.checkPermission(Permission.PRODUCT_CREATE))
                .doesNotThrowAnyException();
        assertThatCode(() -> securityService.checkPermission(Permission.INVENTORY_ADJUST))
                .doesNotThrowAnyException();
    }

    // ==========================================
    // 2. PRODUCT_MANAGER ROLE TESTS
    // ==========================================
    @Test
    @DisplayName("PRODUCT_MANAGER can manage catalogue but cannot manage users, inventory adjustments, or system settings")
    void productManager_Permissions() {
        authenticateAs(Role.PRODUCT_MANAGER, "pm@provana.com");

        // Allowed
        assertThat(Role.PRODUCT_MANAGER.hasPermission(Permission.PRODUCT_CREATE)).isTrue();
        assertThat(Role.PRODUCT_MANAGER.hasPermission(Permission.PRODUCT_UPDATE)).isTrue();
        assertThat(Role.PRODUCT_MANAGER.hasPermission(Permission.PRODUCT_DELETE)).isTrue();
        assertThat(Role.PRODUCT_MANAGER.hasPermission(Permission.CATEGORY_CREATE)).isTrue();
        assertThat(Role.PRODUCT_MANAGER.hasPermission(Permission.BRAND_CREATE)).isTrue();
        assertThat(Role.PRODUCT_MANAGER.hasPermission(Permission.PRODUCT_VARIANT_CREATE)).isTrue();
        assertThat(Role.PRODUCT_MANAGER.hasPermission(Permission.PRODUCT_MEDIA_CREATE)).isTrue();
        assertThat(Role.PRODUCT_MANAGER.hasPermission(Permission.REPORT_CATALOGUE_READ)).isTrue();

        // Forbidden
        assertThat(Role.PRODUCT_MANAGER.hasPermission(Permission.USER_CREATE)).isFalse();
        assertThat(Role.PRODUCT_MANAGER.hasPermission(Permission.USER_DELETE)).isFalse();
        assertThat(Role.PRODUCT_MANAGER.hasPermission(Permission.ROLE_UPDATE)).isFalse();
        assertThat(Role.PRODUCT_MANAGER.hasPermission(Permission.INVENTORY_ADJUST)).isFalse();
        assertThat(Role.PRODUCT_MANAGER.hasPermission(Permission.ORDER_STATUS_UPDATE)).isFalse();
        assertThat(Role.PRODUCT_MANAGER.hasPermission(Permission.SYSTEM_SETTINGS_UPDATE)).isFalse();
        assertThat(Role.PRODUCT_MANAGER.hasPermission(Permission.CMS_PUBLISH)).isFalse();

        assertThatCode(() -> securityService.checkPermission(Permission.PRODUCT_CREATE))
                .doesNotThrowAnyException();

        assertThatThrownBy(() -> securityService.checkPermission(Permission.USER_CREATE))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("USER_CREATE");

        assertThatThrownBy(() -> securityService.checkPermission(Permission.SYSTEM_SETTINGS_UPDATE))
                .isInstanceOf(ForbiddenException.class);
    }

    // ==========================================
    // 3. MANAGER (STORE OPERATIONS) ROLE TESTS
    // ==========================================
    @Test
    @DisplayName("MANAGER can manage store operations (inventory, orders, shipments) but CANNOT write catalogue or manage users")
    void manager_Permissions() {
        authenticateAs(Role.MANAGER, "manager@provana.com");

        // Allowed operations
        assertThat(Role.MANAGER.hasPermission(Permission.INVENTORY_READ)).isTrue();
        assertThat(Role.MANAGER.hasPermission(Permission.INVENTORY_WRITE)).isTrue();
        assertThat(Role.MANAGER.hasPermission(Permission.INVENTORY_UPDATE)).isTrue();
        assertThat(Role.MANAGER.hasPermission(Permission.INVENTORY_ADJUST)).isTrue();
        assertThat(Role.MANAGER.hasPermission(Permission.ORDER_STATUS_UPDATE)).isTrue();
        assertThat(Role.MANAGER.hasPermission(Permission.SHIPMENT_FULFILL)).isTrue();
        assertThat(Role.MANAGER.hasPermission(Permission.RETURN_PROCESS)).isTrue();
        assertThat(Role.MANAGER.hasPermission(Permission.RETURN_UPDATE)).isTrue();
        assertThat(Role.MANAGER.hasPermission(Permission.REPORT_READ)).isTrue();
        assertThat(Role.MANAGER.hasPermission(Permission.REPORT_OPERATIONAL_READ)).isTrue();
        assertThat(Role.MANAGER.hasPermission(Permission.ANALYTICS_READ)).isTrue();
        assertThat(Role.MANAGER.hasPermission(Permission.CATALOGUE_READ)).isTrue();

        // Strictly forbidden
        assertThat(Role.MANAGER.hasPermission(Permission.PRODUCT_CREATE)).isFalse();
        assertThat(Role.MANAGER.hasPermission(Permission.PRODUCT_UPDATE)).isFalse();
        assertThat(Role.MANAGER.hasPermission(Permission.PRODUCT_DELETE)).isFalse();
        assertThat(Role.MANAGER.hasPermission(Permission.CATEGORY_CREATE)).isFalse();
        assertThat(Role.MANAGER.hasPermission(Permission.USER_CREATE)).isFalse();
        assertThat(Role.MANAGER.hasPermission(Permission.USER_DELETE)).isFalse();
        assertThat(Role.MANAGER.hasPermission(Permission.ROLE_UPDATE)).isFalse();
        assertThat(Role.MANAGER.hasPermission(Permission.PERMISSION_MANAGE)).isFalse();
        assertThat(Role.MANAGER.hasPermission(Permission.SYSTEM_SETTINGS_UPDATE)).isFalse();
        assertThat(Role.MANAGER.hasPermission(Permission.CMS_PUBLISH)).isFalse();

        assertThatCode(() -> securityService.checkPermission(Permission.INVENTORY_ADJUST))
                .doesNotThrowAnyException();

        assertThatThrownBy(() -> securityService.checkPermission(Permission.PRODUCT_CREATE))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("PRODUCT_CREATE");

        assertThatThrownBy(() -> securityService.checkPermission(Permission.USER_CREATE))
                .isInstanceOf(ForbiddenException.class);
    }

    // ==========================================
    // 4. CONTENT_MANAGER ROLE TESTS
    // ==========================================
    @Test
    @DisplayName("CONTENT_MANAGER can manage CMS and media but cannot manage catalogue, orders, or users")
    void contentManager_Permissions() {
        authenticateAs(Role.CONTENT_MANAGER, "content@provana.com");

        // Allowed
        assertThat(Role.CONTENT_MANAGER.hasPermission(Permission.CMS_CREATE)).isTrue();
        assertThat(Role.CONTENT_MANAGER.hasPermission(Permission.CMS_UPDATE)).isTrue();
        assertThat(Role.CONTENT_MANAGER.hasPermission(Permission.CMS_PUBLISH)).isTrue();
        assertThat(Role.CONTENT_MANAGER.hasPermission(Permission.MEDIA_UPLOAD)).isTrue();
        assertThat(Role.CONTENT_MANAGER.hasPermission(Permission.REPORT_CONTENT_READ)).isTrue();

        // Forbidden
        assertThat(Role.CONTENT_MANAGER.hasPermission(Permission.PRODUCT_CREATE)).isFalse();
        assertThat(Role.CONTENT_MANAGER.hasPermission(Permission.INVENTORY_ADJUST)).isFalse();
        assertThat(Role.CONTENT_MANAGER.hasPermission(Permission.ORDER_STATUS_UPDATE)).isFalse();
        assertThat(Role.CONTENT_MANAGER.hasPermission(Permission.USER_CREATE)).isFalse();
        assertThat(Role.CONTENT_MANAGER.hasPermission(Permission.SYSTEM_SETTINGS_UPDATE)).isFalse();

        assertThatCode(() -> securityService.checkPermission(Permission.CMS_PUBLISH))
                .doesNotThrowAnyException();

        assertThatThrownBy(() -> securityService.checkPermission(Permission.PRODUCT_CREATE))
                .isInstanceOf(ForbiddenException.class);
    }

    // ==========================================
    // 5. ORDER_MANAGER ROLE TESTS
    // ==========================================
    @Test
    @DisplayName("ORDER_MANAGER can manage orders and shipments but cannot write catalogue, CMS, or users")
    void orderManager_Permissions() {
        authenticateAs(Role.ORDER_MANAGER, "order@provana.com");

        // Allowed
        assertThat(Role.ORDER_MANAGER.hasPermission(Permission.ORDER_READ)).isTrue();
        assertThat(Role.ORDER_MANAGER.hasPermission(Permission.ORDER_STATUS_UPDATE)).isTrue();
        assertThat(Role.ORDER_MANAGER.hasPermission(Permission.SHIPMENT_TRACK)).isTrue();
        assertThat(Role.ORDER_MANAGER.hasPermission(Permission.RETURN_PROCESS)).isTrue();

        // Forbidden
        assertThat(Role.ORDER_MANAGER.hasPermission(Permission.PRODUCT_CREATE)).isFalse();
        assertThat(Role.ORDER_MANAGER.hasPermission(Permission.CMS_PUBLISH)).isFalse();
        assertThat(Role.ORDER_MANAGER.hasPermission(Permission.USER_CREATE)).isFalse();
        assertThat(Role.ORDER_MANAGER.hasPermission(Permission.SYSTEM_SETTINGS_UPDATE)).isFalse();

        assertThatCode(() -> securityService.checkPermission(Permission.ORDER_STATUS_UPDATE))
                .doesNotThrowAnyException();

        assertThatThrownBy(() -> securityService.checkPermission(Permission.PRODUCT_CREATE))
                .isInstanceOf(ForbiddenException.class);
    }

    // ==========================================
    // 6. CUSTOMER ROLE TESTS
    // ==========================================
    @Test
    @DisplayName("CUSTOMER has 0 administrative write permissions and cannot access admin modules")
    void customer_Permissions() {
        authenticateAs(Role.CUSTOMER, "customer@provana.com");

        // Allowed
        assertThat(Role.CUSTOMER.hasPermission(Permission.CATALOGUE_READ)).isTrue();
        assertThat(Role.CUSTOMER.hasPermission(Permission.ORDER_CREATE)).isTrue();
        assertThat(Role.CUSTOMER.hasPermission(Permission.REVIEW_CREATE)).isTrue();

        // Forbidden
        assertThat(Role.CUSTOMER.hasPermission(Permission.PRODUCT_CREATE)).isFalse();
        assertThat(Role.CUSTOMER.hasPermission(Permission.PRODUCT_DELETE)).isFalse();
        assertThat(Role.CUSTOMER.hasPermission(Permission.INVENTORY_ADJUST)).isFalse();
        assertThat(Role.CUSTOMER.hasPermission(Permission.USER_CREATE)).isFalse();
        assertThat(Role.CUSTOMER.hasPermission(Permission.ROLE_UPDATE)).isFalse();
        assertThat(Role.CUSTOMER.hasPermission(Permission.SYSTEM_SETTINGS_UPDATE)).isFalse();

        assertThatThrownBy(() -> securityService.verifyRole("ADMIN"))
                .isInstanceOf(ForbiddenException.class);

        assertThatThrownBy(() -> securityService.checkPermission(Permission.PRODUCT_CREATE))
                .isInstanceOf(ForbiddenException.class);
    }

    // ==========================================
    // 7. DATA OWNERSHIP TESTS
    // ==========================================
    @Test
    @DisplayName("Enforces data ownership: customer cannot access another customer's data unless ADMIN")
    void dataOwnership_Enforcement() {
        UUID customerA = UUID.randomUUID();
        UUID customerB = UUID.randomUUID();

        // Customer A accessing own data -> OK
        authenticateAs(Role.CUSTOMER, "customerA@provana.com");
        assertThatCode(() -> securityService.checkOwnershipOrAdmin(customerA, customerA))
                .doesNotThrowAnyException();

        // Customer B accessing Customer A's data without ADMIN -> Throws ForbiddenException
        authenticateAs(Role.CUSTOMER, "customerB@provana.com");
        assertThatThrownBy(() -> securityService.checkOwnershipOrAdmin(customerA, customerB))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("You do not have permission to access");

        // Authenticate as ADMIN -> Can access any customer data
        authenticateAs(Role.ADMIN, "admin@provana.com");
        assertThatCode(() -> securityService.checkOwnershipOrAdmin(customerA, customerB))
                .doesNotThrowAnyException();
    }
}
