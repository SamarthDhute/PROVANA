package com.provana.catalog.controller;

import com.provana.auth.JwtTokenProvider;
import com.provana.auth.Role;
import com.provana.catalog.entity.ProductVariant;
import com.provana.catalog.entity.Sku;
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

    @Autowired
    private com.provana.catalog.repository.ProductRepository productRepository;

    @Autowired
    private com.provana.catalog.repository.ProductVariantRepository productVariantRepository;

    @Autowired
    private com.provana.catalog.repository.SkuRepository skuRepository;

    @Autowired
    private com.provana.catalog.repository.ProductMediaRepository productMediaRepository;

    @Autowired
    private com.provana.catalog.repository.ProductNutritionRepository productNutritionRepository;

    @org.junit.jupiter.api.BeforeEach
    void setUpFixtures() {
        productRepository.findBySlug("provana-100-pure-whey-isolate").ifPresent(p -> {
            var vars = productVariantRepository.findByProductIdOrderBySortOrderAsc(p.getId());
            if (vars.isEmpty()) {
                ProductVariant variant = new ProductVariant();
                variant.setProduct(p);
                variant.setName("Rich Double Chocolate - 2kg");
                variant.setFlavor("Rich Double Chocolate");
                variant.setSize("2kg");
                variant.setActive(true);
                variant.setSortOrder(1);
                productVariantRepository.save(variant);

                com.provana.catalog.entity.Sku sku = new com.provana.catalog.entity.Sku();
                sku.setVariant(variant);
                sku.setSkuCode("PROV-WHEY-CHO-2KG");
                sku.setPrice(new java.math.BigDecimal("3499.00"));
                sku.setCompareAtPrice(new java.math.BigDecimal("4299.00"));
                sku.setAvailable(true);
                sku.setActive(true);
                skuRepository.save(sku);
            }

            var mediaList = productMediaRepository.findByProductIdOrderBySortOrderAsc(p.getId());
            if (mediaList.isEmpty()) {
                com.provana.catalog.entity.ProductMedia media = new com.provana.catalog.entity.ProductMedia();
                media.setProduct(p);
                media.setUrl("/assets/product-catalog/whey_isolated.png");
                media.setMediaType("IMAGE");
                media.setIsPrimary(true);
                media.setSortOrder(1);
                media.setActive(true);
                productMediaRepository.save(media);
            }

            var nutritionOpt = productNutritionRepository.findByProductId(p.getId());
            if (nutritionOpt.isEmpty()) {
                com.provana.catalog.entity.ProductNutrition nutrition = new com.provana.catalog.entity.ProductNutrition();
                nutrition.setProduct(p);
                nutrition.setServingSize("30g");
                nutrition.setServingsPerContainer(66);
                nutrition.setCalories(110);
                nutrition.setProteinG(new java.math.BigDecimal("27.00"));
                nutrition.setCarbsG(new java.math.BigDecimal("1.00"));
                nutrition.setFatG(new java.math.BigDecimal("0.50"));
                productNutritionRepository.save(nutrition);
            }
        });
    }

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
