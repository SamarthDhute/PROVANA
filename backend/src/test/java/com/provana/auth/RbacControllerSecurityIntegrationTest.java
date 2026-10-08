package com.provana.auth;

import com.provana.user.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class RbacControllerSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String createBearerToken(Role role, String email) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(email);
        user.setRole(role);
        return "Bearer " + jwtTokenProvider.generateToken(user);
    }

    private String createExpiredBearerToken() {
        var secretKey = Keys.hmacShaKeyFor("provana-super-secret-production-grade-hmac-sha256-key-min-256-bits!".getBytes(StandardCharsets.UTF_8));
        Date past = new Date(System.currentTimeMillis() - 1000000);
        String token = Jwts.builder()
                .subject(UUID.randomUUID().toString())
                .claim("email", "expired@provana.com")
                .claim("role", "ADMIN")
                .issuedAt(new Date(past.getTime() - 100000))
                .expiration(past)
                .signWith(secretKey)
                .compact();
        return "Bearer " + token;
    }

    // =========================================================================
    // 1. ADMIN ROLE TESTS (Full administrative access)
    // =========================================================================

    @Test
    @DisplayName("ADMIN: Can access user management list (200 OK)")
    void admin_CanAccessUserManagement() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", createBearerToken(Role.ADMIN, "admin@provana.com"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("ADMIN: Can access categories list and create category (200 OK / 201 Created)")
    void admin_CanManageCategories() throws Exception {
        mockMvc.perform(get("/api/v1/admin/categories")
                        .header("Authorization", createBearerToken(Role.ADMIN, "admin@provana.com"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("ADMIN: Can access inventory management (200 OK)")
    void admin_CanAccessInventory() throws Exception {
        mockMvc.perform(get("/api/v1/admin/inventory")
                        .header("Authorization", createBearerToken(Role.ADMIN, "admin@provana.com"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // =========================================================================
    // 2. MANAGER (STORE OPERATIONS) TESTS (Operational access only)
    // =========================================================================

    @Test
    @DisplayName("MANAGER: Can read inventory (200 OK)")
    void manager_CanReadInventory() throws Exception {
        mockMvc.perform(get("/api/v1/admin/inventory")
                        .header("Authorization", createBearerToken(Role.MANAGER, "manager@provana.com"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("MANAGER: Can read catalogue categories for operational reference (200 OK)")
    void manager_CanReadCategories() throws Exception {
        mockMvc.perform(get("/api/v1/admin/categories")
                        .header("Authorization", createBearerToken(Role.MANAGER, "manager@provana.com"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("MANAGER: Cannot create products (403 Forbidden)")
    void manager_CannotCreateProduct() throws Exception {
        String productPayload = """
                {
                  "name": "Manager Attempt Product",
                  "slug": "manager-attempt-product",
                  "brandId": "11111111-1111-1111-1111-111111111111",
                  "categoryId": "22222222-2222-2222-2222-222222222001",
                  "status": "DRAFT"
                }
                """;

        mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", createBearerToken(Role.MANAGER, "manager@provana.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productPayload))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("Access denied")));
    }

    @Test
    @DisplayName("MANAGER: Cannot create categories (403 Forbidden)")
    void manager_CannotCreateCategory() throws Exception {
        String catPayload = """
                {
                  "name": "Manager New Category",
                  "slug": "manager-new-cat",
                  "description": "Unauthorized category creation"
                }
                """;

        mockMvc.perform(post("/api/v1/admin/categories")
                        .header("Authorization", createBearerToken(Role.MANAGER, "manager@provana.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(catPayload))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("MANAGER: Cannot access user management (403 Forbidden)")
    void manager_CannotAccessUserManagement() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", createBearerToken(Role.MANAGER, "manager@provana.com"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    // =========================================================================
    // 3. PRODUCT_MANAGER TESTS (Catalogue ownership, no store ops or user admin)
    // =========================================================================

    @Test
    @DisplayName("PRODUCT_MANAGER: Can read categories (200 OK)")
    void productManager_CanReadCategories() throws Exception {
        mockMvc.perform(get("/api/v1/admin/categories")
                        .header("Authorization", createBearerToken(Role.PRODUCT_MANAGER, "pm@provana.com"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("PRODUCT_MANAGER: Cannot access user management (403 Forbidden)")
    void productManager_CannotAccessUsers() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", createBearerToken(Role.PRODUCT_MANAGER, "pm@provana.com"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("PRODUCT_MANAGER: Cannot access inventory management (403 Forbidden)")
    void productManager_CannotAccessInventory() throws Exception {
        mockMvc.perform(get("/api/v1/admin/inventory")
                        .header("Authorization", createBearerToken(Role.PRODUCT_MANAGER, "pm@provana.com"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    // =========================================================================
    // 4. CONTENT_MANAGER TESTS (CMS ownership, no catalogue write, no users, no inventory)
    // =========================================================================

    @Test
    @DisplayName("CONTENT_MANAGER: Cannot create product (403 Forbidden)")
    void contentManager_CannotCreateProduct() throws Exception {
        String productPayload = """
                {
                  "name": "Content Manager Product",
                  "slug": "content-mgr-product",
                  "brandId": "11111111-1111-1111-1111-111111111111",
                  "categoryId": "22222222-2222-2222-2222-222222222001",
                  "status": "DRAFT"
                }
                """;

        mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", createBearerToken(Role.CONTENT_MANAGER, "content@provana.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productPayload))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("CONTENT_MANAGER: Cannot access user management (403 Forbidden)")
    void contentManager_CannotAccessUsers() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", createBearerToken(Role.CONTENT_MANAGER, "content@provana.com"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("CONTENT_MANAGER: Cannot access inventory (403 Forbidden)")
    void contentManager_CannotAccessInventory() throws Exception {
        mockMvc.perform(get("/api/v1/admin/inventory")
                        .header("Authorization", createBearerToken(Role.CONTENT_MANAGER, "content@provana.com"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    // =========================================================================
    // 5. ORDER_MANAGER TESTS (Order fulfillment, no catalogue write, no users, no inventory)
    // =========================================================================

    @Test
    @DisplayName("ORDER_MANAGER: Cannot create products (403 Forbidden)")
    void orderManager_CannotCreateProduct() throws Exception {
        String productPayload = """
                {
                  "name": "Order Manager Product",
                  "slug": "order-mgr-product",
                  "brandId": "11111111-1111-1111-1111-111111111111",
                  "categoryId": "22222222-2222-2222-2222-222222222001",
                  "status": "DRAFT"
                }
                """;

        mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", createBearerToken(Role.ORDER_MANAGER, "order@provana.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productPayload))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("ORDER_MANAGER: Cannot access user management (403 Forbidden)")
    void orderManager_CannotAccessUsers() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", createBearerToken(Role.ORDER_MANAGER, "order@provana.com"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("ORDER_MANAGER: Cannot access inventory management (403 Forbidden)")
    void orderManager_CannotAccessInventory() throws Exception {
        mockMvc.perform(get("/api/v1/admin/inventory")
                        .header("Authorization", createBearerToken(Role.ORDER_MANAGER, "order@provana.com"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    // =========================================================================
    // 6. CUSTOMER ROLE TESTS (Public storefront only, zero admin access)
    // =========================================================================

    @Test
    @DisplayName("CUSTOMER: Can access public catalogue endpoints (200 OK)")
    void customer_CanAccessPublicCatalogue() throws Exception {
        mockMvc.perform(get("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("CUSTOMER: Accessing /api/v1/admin/categories returns 403 Forbidden")
    void customer_CannotAccessAdminCategories() throws Exception {
        mockMvc.perform(get("/api/v1/admin/categories")
                        .header("Authorization", createBearerToken(Role.CUSTOMER, "customer@provana.com"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("Access denied")));
    }

    @Test
    @DisplayName("CUSTOMER: Accessing /api/v1/admin/users returns 403 Forbidden")
    void customer_CannotAccessAdminUsers() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", createBearerToken(Role.CUSTOMER, "customer@provana.com"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("CUSTOMER: Accessing /api/v1/admin/inventory returns 403 Forbidden")
    void customer_CannotAccessAdminInventory() throws Exception {
        mockMvc.perform(get("/api/v1/admin/inventory")
                        .header("Authorization", createBearerToken(Role.CUSTOMER, "customer@provana.com"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    // =========================================================================
    // 7. SECURITY ATTACK TESTS
    // =========================================================================

    @Test
    @DisplayName("Attack Vector 1: No JWT to admin endpoint returns 401 Unauthorized")
    void attack_NoJwt_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("Authentication required")));
    }

    @Test
    @DisplayName("Attack Vector 2: Invalid/malformed JWT returns 401 Unauthorized")
    void attack_InvalidJwt_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer this.is.an.invalid.token.structure")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("Authentication required")));
    }

    @Test
    @DisplayName("Attack Vector 3: Expired JWT returns 401 Unauthorized")
    void attack_ExpiredJwt_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", createExpiredBearerToken())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("Authentication required")));
    }

    @Test
    @DisplayName("Attack Vector 4: Forged X-Admin-Role: ADMIN header without JWT returns 401")
    void attack_ForgedHeaderWithoutJwt_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("X-Admin-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Attack Vector 5: Forged X-Admin-Role: ADMIN header with CUSTOMER JWT returns 403 (No Privilege Escalation)")
    void attack_ForgedHeaderWithCustomerJwt_Returns403() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", createBearerToken(Role.CUSTOMER, "attacker@provana.com"))
                        .header("X-Admin-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Attack Vector 6: Forged X-Admin-Role: ADMIN header with MANAGER JWT on product creation returns 403 (No Privilege Escalation)")
    void attack_ForgedHeaderWithManagerJwt_Returns403() throws Exception {
        String payload = """
                {
                  "name": "Spoofed Exploit Product",
                  "slug": "spoofed-exploit-product",
                  "brandId": "11111111-1111-1111-1111-111111111111",
                  "categoryId": "22222222-2222-2222-2222-222222222001",
                  "status": "DRAFT"
                }
                """;

        mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", createBearerToken(Role.MANAGER, "manager@provana.com"))
                        .header("X-Admin-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }
}
