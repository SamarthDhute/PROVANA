package com.provana.catalog.controller;

import com.provana.auth.JwtTokenProvider;
import com.provana.auth.Role;
import com.provana.user.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class CatalogueSecurityAndControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String createBearerToken(String email, Role role) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(email);
        user.setRole(role);
        return "Bearer " + jwtTokenProvider.generateToken(user);
    }

    @Test
    @DisplayName("Public customer endpoint /api/v1/categories should return 200 without authentication")
    void getCategories_PublicAccess_Returns200() throws Exception {
        mockMvc.perform(get("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("Public customer endpoint /api/v1/products should return 200 and only published products")
    void getProducts_PublicAccess_Returns200() throws Exception {
        mockMvc.perform(get("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("Customer querying single product PDP by slug returns full detail")
    void getProductBySlug_PublicAccess_ReturnsPDP() throws Exception {
        mockMvc.perform(get("/api/v1/products/provana-100-pure-whey-isolate")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.slug").value("provana-100-pure-whey-isolate"))
                .andExpect(jsonPath("$.data.variants", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.media", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.nutrition.proteinG").value(27.0));
    }

    @Test
    @DisplayName("Admin endpoint without credentials returns 401 Unauthorized")
    void adminEndpoint_WithoutAuth_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/categories")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("Authentication required")));
    }

    @Test
    @DisplayName("Fake X-Admin-Role header without valid JWT cannot grant access (Returns 401)")
    void adminEndpoint_FakeHeaderWithoutJwt_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/categories")
                        .header("X-Admin-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("Authentication required")));
    }

    @Test
    @DisplayName("Admin endpoint accessed with valid CUSTOMER JWT returns 403 Forbidden")
    void adminEndpoint_CustomerRole_Returns403() throws Exception {
        mockMvc.perform(get("/api/v1/admin/categories")
                        .header("Authorization", createBearerToken("customer@provana.com", Role.CUSTOMER))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("Access denied")));
    }

    @Test
    @DisplayName("ORDER_MANAGER role attempting catalogue write returns 403 Forbidden")
    void adminProductCreation_OrderManagerRole_Returns403() throws Exception {
        String newProductJson = """
                {
                  "name": "Unauthorized Test Product",
                  "slug": "unauthorized-test-product",
                  "brandId": "11111111-1111-1111-1111-111111111111",
                  "categoryId": "22222222-2222-2222-2222-222222222001",
                  "status": "DRAFT"
                }
                """;

        mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", createBearerToken("manager@provana.com", Role.MANAGER))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(newProductJson))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("lacks required permission 'CATALOGUE_WRITE'")));
    }

    @Test
    @DisplayName("PRODUCT_MANAGER role with valid JWT can access catalogue management endpoints")
    void adminEndpoint_ProductManagerRole_Returns200() throws Exception {
        mockMvc.perform(get("/api/v1/admin/categories")
                        .header("Authorization", createBearerToken("pm@provana.com", Role.PRODUCT_MANAGER))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("ADMIN role with valid JWT accessing /api/v1/admin/categories returns 200 OK")
    void adminEndpoint_AdminRole_Returns200() throws Exception {
        mockMvc.perform(get("/api/v1/admin/categories")
                        .header("Authorization", createBearerToken("admin@provana.com", Role.ADMIN))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }
}
