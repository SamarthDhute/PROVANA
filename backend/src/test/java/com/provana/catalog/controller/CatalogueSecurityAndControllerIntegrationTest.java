package com.provana.catalog.controller;

import com.provana.auth.JwtTokenProvider;
import com.provana.auth.Role;
import com.provana.catalog.entity.*;
import com.provana.catalog.repository.*;
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
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private SkuRepository skuRepository;

    @Autowired
    private ProductMediaRepository productMediaRepository;

    @Autowired
    private ProductNutritionRepository productNutritionRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @org.junit.jupiter.api.BeforeEach
    void setUpFixtures() {
        Product p = productRepository.findBySlug("provana-100-pure-whey-isolate").orElseGet(() -> {
            Brand brand = brandRepository.findBySlug("provana-brand").orElseGet(() ->
                    brandRepository.save(new Brand("Provana", "provana-brand", "Provana brand", "https://provana.com/logo.png"))
            );
            Category category = categoryRepository.findBySlug("protein").orElseGet(() ->
                    categoryRepository.save(new Category("Protein", "protein", "Protein category", "https://provana.com/cat.png", 0))
            );
            Product newProd = new Product();
            newProd.setName("Provana 100% Pure Whey Isolate");
            newProd.setSlug("provana-100-pure-whey-isolate");
            newProd.setBrand(brand);
            newProd.setCategory(category);
            newProd.setStatus(ProductStatus.PUBLISHED);
            return productRepository.save(newProd);
        });

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

            Sku sku = new Sku();
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
            ProductMedia media = new ProductMedia();
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
            ProductNutrition nutrition = new ProductNutrition();
            nutrition.setProduct(p);
            nutrition.setServingSize("30g");
            nutrition.setServingsPerContainer(66);
            nutrition.setCalories(110);
            nutrition.setProteinG(new java.math.BigDecimal("27.00"));
            nutrition.setCarbsG(new java.math.BigDecimal("1.00"));
            nutrition.setFatG(new java.math.BigDecimal("0.50"));
            productNutritionRepository.save(nutrition);
        }
    }

    private String createBearerToken(String email, Role role) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(email);
        user.setRole(role);
        return "Bearer " + jwtTokenProvider.generateToken(user);
    }

    @Test
    @DisplayName("Public customer endpoint /api/v1/categories should return 200 and list categories")
    void getCategories_PublicAccess_Returns200() throws Exception {
        mockMvc.perform(get("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("Public customer endpoint /api/v1/brands should return 200 and list brands")
    void getBrands_PublicAccess_Returns200() throws Exception {
        mockMvc.perform(get("/api/v1/brands")
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
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Admin endpoint with CUSTOMER role returns 403 Forbidden")
    void adminEndpoint_WithCustomerRole_Returns403() throws Exception {
        String token = createBearerToken("user@provana.com", Role.CUSTOMER);
        mockMvc.perform(get("/api/v1/admin/categories")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin endpoint with ADMIN role returns 200 OK")
    void adminEndpoint_WithAdminRole_Returns200() throws Exception {
        String token = createBearerToken("admin@provana.com", Role.ADMIN);
        mockMvc.perform(get("/api/v1/admin/categories")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Admin endpoint with PRODUCT_MANAGER role returns 200 OK for categories")
    void adminEndpoint_WithProductManagerRole_Returns200() throws Exception {
        String token = createBearerToken("pm@provana.com", Role.PRODUCT_MANAGER);
        mockMvc.perform(get("/api/v1/admin/categories")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Admin endpoint with CONTENT_MANAGER role returns 200 OK for categories")
    void adminEndpoint_WithContentManagerRole_Returns200() throws Exception {
        String token = createBearerToken("content@provana.com", Role.CONTENT_MANAGER);
        mockMvc.perform(get("/api/v1/admin/categories")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Admin endpoint with ORDER_MANAGER role returns 403 Forbidden for categories")
    void adminEndpoint_WithOrderManagerRole_Returns403() throws Exception {
        String token = createBearerToken("orders@provana.com", Role.ORDER_MANAGER);
        mockMvc.perform(get("/api/v1/admin/categories")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}
