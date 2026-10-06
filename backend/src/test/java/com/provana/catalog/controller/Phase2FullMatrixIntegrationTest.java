package com.provana.catalog.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provana.auth.JwtTokenProvider;
import com.provana.auth.Role;
import com.provana.catalog.dto.*;
import com.provana.catalog.entity.ProductStatus;
import com.provana.user.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Phase 2 — Product Catalogue 62-Point Verification Integration Test Suite
 * Fully database-backed, testing real REST endpoints, Spring Security, RBAC,
 * validations, foreign key integrity, publication status, and customer discovery.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class Phase2FullMatrixIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private com.provana.catalog.repository.CategoryRepository categoryRepository;

    @Autowired
    private com.provana.catalog.repository.SubcategoryRepository subcategoryRepository;

    @Autowired
    private com.provana.catalog.repository.BrandRepository brandRepository;

    @Autowired
    private com.provana.catalog.repository.ProductRepository productRepository;

    @Autowired
    private com.provana.catalog.repository.ProductVariantRepository productVariantRepository;

    @Autowired
    private com.provana.catalog.repository.SkuRepository skuRepository;

    @Autowired
    private com.provana.catalog.repository.ProductMediaRepository productMediaRepository;

    @Autowired
    private com.provana.catalog.repository.ProductFaqRepository productFaqRepository;

    @Autowired
    private com.provana.catalog.repository.ProductNutritionRepository productNutritionRepository;

    private static boolean cleaned = false;

    private void deleteProductAndChildren(UUID productId) {
        if (productId == null) return;
        var variants = productVariantRepository.findByProductIdOrderBySortOrderAsc(productId);
        for (var v : variants) {
            skuRepository.findByVariantId(v.getId()).forEach(skuRepository::delete);
            productVariantRepository.delete(v);
        }
        productMediaRepository.findByProductIdOrderBySortOrderAsc(productId).forEach(productMediaRepository::delete);
        productFaqRepository.findByProductIdOrderBySortOrderAsc(productId).forEach(productFaqRepository::delete);
        productNutritionRepository.findByProductId(productId).ifPresent(productNutritionRepository::delete);
        productRepository.findById(productId).ifPresent(productRepository::delete);
    }

    @org.junit.jupiter.api.BeforeEach
    void cleanBeforeFirstRun() {
        if (!cleaned) {
            try {
                productRepository.findBySlug("matrix-test-product").ifPresent(p -> deleteProductAndChildren(p.getId()));
                productRepository.findBySlug("matrix-test-product-custom").ifPresent(p -> deleteProductAndChildren(p.getId()));

                categoryRepository.findBySlug("matrix-test-category").ifPresent(c -> {
                    productRepository.findAll().stream()
                            .filter(p -> p.getCategory() != null && c.getId().equals(p.getCategory().getId()))
                            .forEach(p -> deleteProductAndChildren(p.getId()));
                    subcategoryRepository.findAll().stream()
                            .filter(s -> s.getCategory() != null && c.getId().equals(s.getCategory().getId()))
                            .forEach(subcategoryRepository::delete);
                    categoryRepository.delete(c);
                });

                brandRepository.findBySlug("matrix-brand").ifPresent(b -> {
                    productRepository.findAll().stream()
                            .filter(p -> p.getBrand() != null && b.getId().equals(p.getBrand().getId()))
                            .forEach(p -> deleteProductAndChildren(p.getId()));
                    brandRepository.delete(b);
                });
                brandRepository.findBySlug("matrix-test-brand").ifPresent(b -> {
                    productRepository.findAll().stream()
                            .filter(p -> p.getBrand() != null && b.getId().equals(p.getBrand().getId()))
                            .forEach(p -> deleteProductAndChildren(p.getId()));
                    brandRepository.delete(b);
                });
            } catch (Exception e) {
                // Ignore and proceed
            }
            cleaned = true;
        }
    }

    // Static test context IDs preserved across ordered test steps
    private static UUID testCategoryId;
    private static UUID testSubcategoryId;
    private static UUID testBrandId;
    private static UUID testProductId;
    private static UUID testVariantId;
    private static UUID testSkuId;
    private static UUID testMediaId;
    private static UUID testFaqId;

    private String adminToken() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("admin-test@provana.com");
        user.setRole(Role.ADMIN);
        return "Bearer " + jwtTokenProvider.generateToken(user);
    }

    private String productManagerToken() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("pm-test@provana.com");
        user.setRole(Role.PRODUCT_MANAGER);
        return "Bearer " + jwtTokenProvider.generateToken(user);
    }

    private String customerToken() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("customer-test@provana.com");
        user.setRole(Role.CUSTOMER);
        return "Bearer " + jwtTokenProvider.generateToken(user);
    }

    // =========================================================================
    // 1. CATEGORY MATRIX (1 - 5)
    // =========================================================================

    @Test
    @Order(1)
    @DisplayName("1. Create category")
    void test01_createCategory() throws Exception {
        CategoryRequest req = new CategoryRequest(
                "Matrix Test Category",
                "matrix-test-category",
                "Category created for matrix verification",
                "/assets/cat.png",
                true,
                99
        );

        MvcResult result = mockMvc.perform(post("/api/v1/admin/categories")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.slug").value("matrix-test-category"))
                .andReturn();

        var json = objectMapper.readTree(result.getResponse().getContentAsString());
        testCategoryId = UUID.fromString(json.get("data").get("id").asText());
    }

    @Test
    @Order(2)
    @DisplayName("2. Get category")
    void test02_getCategory() throws Exception {
        mockMvc.perform(get("/api/v1/admin/categories/" + testCategoryId)
                        .header("Authorization", adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Matrix Test Category"));
    }

    @Test
    @Order(3)
    @DisplayName("3. Update category")
    void test03_updateCategory() throws Exception {
        CategoryRequest req = new CategoryRequest(
                "Matrix Test Category Updated",
                "matrix-test-category",
                "Updated description",
                "/assets/cat-updated.png",
                true,
                100
        );

        mockMvc.perform(put("/api/v1/admin/categories/" + testCategoryId)
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Matrix Test Category Updated"));
    }

    @Test
    @Order(4)
    @DisplayName("4. Delete/deactivate category")
    void test04_deleteOrDeactivateCategory() throws Exception {
        CategoryRequest req = new CategoryRequest(
                "Temp Category To Delete",
                "temp-cat-to-delete",
                "Temp",
                null,
                true,
                1
        );

        MvcResult res = mockMvc.perform(post("/api/v1/admin/categories")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        UUID tempCatId = UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString()).get("data").get("id").asText());

        mockMvc.perform(delete("/api/v1/admin/categories/" + tempCatId)
                        .header("Authorization", adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(5)
    @DisplayName("5. Duplicate category/slug validation")
    void test05_duplicateCategorySlugValidation() throws Exception {
        CategoryRequest req = new CategoryRequest(
                "Duplicate Category Name",
                "matrix-test-category",
                "Duplicate slug test",
                null,
                true,
                1
        );

        mockMvc.perform(post("/api/v1/admin/categories")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    // =========================================================================
    // 2. SUBCATEGORY MATRIX (6 - 9)
    // =========================================================================

    @Test
    @Order(6)
    @DisplayName("6. Create subcategory")
    void test06_createSubcategory() throws Exception {
        SubcategoryRequest req = new SubcategoryRequest(
                testCategoryId,
                "Matrix Subcategory",
                "matrix-subcategory",
                "Test subcategory for matrix",
                true,
                1
        );

        MvcResult result = mockMvc.perform(post("/api/v1/admin/subcategories")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.slug").value("matrix-subcategory"))
                .andReturn();

        var json = objectMapper.readTree(result.getResponse().getContentAsString());
        testSubcategoryId = UUID.fromString(json.get("data").get("id").asText());
    }

    @Test
    @Order(7)
    @DisplayName("7. Associate with category")
    void test07_associateSubcategoryWithCategory() throws Exception {
        mockMvc.perform(get("/api/v1/admin/subcategories/" + testSubcategoryId)
                        .header("Authorization", adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.categoryId").value(testCategoryId.toString()));
    }

    @Test
    @Order(8)
    @DisplayName("8. Update subcategory")
    void test08_updateSubcategory() throws Exception {
        SubcategoryRequest req = new SubcategoryRequest(
                testCategoryId,
                "Matrix Subcategory Updated",
                "matrix-subcategory",
                "Updated subcategory description",
                true,
                2
        );

        mockMvc.perform(put("/api/v1/admin/subcategories/" + testSubcategoryId)
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Matrix Subcategory Updated"));
    }

    @Test
    @Order(9)
    @DisplayName("9. Invalid category rejection")
    void test09_invalidCategoryRejectionForSubcategory() throws Exception {
        SubcategoryRequest req = new SubcategoryRequest(
                UUID.randomUUID(),
                "Invalid Cat Sub",
                "invalid-cat-sub",
                "Description",
                true,
                1
        );

        mockMvc.perform(post("/api/v1/admin/subcategories")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    // =========================================================================
    // 3. BRAND MATRIX (10 - 13)
    // =========================================================================

    @Test
    @Order(10)
    @DisplayName("10. Create brand")
    void test10_createBrand() throws Exception {
        BrandRequest req = new BrandRequest(
                "Matrix Brand",
                "matrix-brand",
                "Test brand description",
                "/assets/brand.png",
                true
        );

        MvcResult result = mockMvc.perform(post("/api/v1/admin/brands")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.slug").value("matrix-brand"))
                .andReturn();

        var json = objectMapper.readTree(result.getResponse().getContentAsString());
        testBrandId = UUID.fromString(json.get("data").get("id").asText());
    }

    @Test
    @Order(11)
    @DisplayName("11. Get brand")
    void test11_getBrand() throws Exception {
        mockMvc.perform(get("/api/v1/admin/brands/" + testBrandId)
                        .header("Authorization", adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Matrix Brand"));
    }

    @Test
    @Order(12)
    @DisplayName("12. Update brand")
    void test12_updateBrand() throws Exception {
        BrandRequest req = new BrandRequest(
                "Matrix Brand Updated",
                "matrix-brand",
                "Updated brand description",
                "/assets/brand-up.png",
                true
        );

        mockMvc.perform(put("/api/v1/admin/brands/" + testBrandId)
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Matrix Brand Updated"));
    }

    @Test
    @Order(13)
    @DisplayName("13. Duplicate brand validation")
    void test13_duplicateBrandValidation() throws Exception {
        BrandRequest req = new BrandRequest(
                "Duplicate Matrix Brand",
                "matrix-brand",
                "Desc",
                null,
                true
        );

        mockMvc.perform(post("/api/v1/admin/brands")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    // =========================================================================
    // 4. PRODUCT MATRIX (14 - 23)
    // =========================================================================

    @Test
    @Order(14)
    @DisplayName("14. Create product")
    void test14_createProduct() throws Exception {
        CreateProductRequest req = new CreateProductRequest(
                "Matrix Test Product",
                "matrix-test-product",
                testBrandId,
                testCategoryId,
                testSubcategoryId,
                "Performance",
                "NEW ARRIVAL",
                "High Performance Formula",
                "Detailed product description",
                "Quick summary for cards",
                "Muscle recovery; Strength",
                "Take 1 scoop daily with water",
                "Pure Whey, Stevia, Natural Cocoa",
                "Milk, Dairy",
                ProductStatus.DRAFT,
                "Matrix Product Meta Title",
                "Matrix Product Meta Description"
        );

        MvcResult result = mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.slug").value("matrix-test-product"))
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andReturn();

        var json = objectMapper.readTree(result.getResponse().getContentAsString());
        testProductId = UUID.fromString(json.get("data").get("id").asText());
    }

    @Test
    @Order(15)
    @DisplayName("15. Get product")
    void test15_getProduct() throws Exception {
        mockMvc.perform(get("/api/v1/admin/products/" + testProductId)
                        .header("Authorization", adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Matrix Test Product"));
    }

    @Test
    @Order(16)
    @DisplayName("16. Update product")
    void test16_updateProduct() throws Exception {
        UpdateProductRequest req = new UpdateProductRequest(
                "Matrix Test Product Updated",
                "matrix-test-product",
                testBrandId,
                testCategoryId,
                testSubcategoryId,
                "Performance",
                "HOT",
                "High Performance Formula Updated",
                "Updated full description",
                "Updated minimal summary",
                "Rapid Absorption; Lean Gains",
                "Take 1 scoop post-workout",
                "Pure Whey Isolate 100%",
                "Milk",
                ProductStatus.DRAFT,
                "Updated Meta Title",
                "Updated Meta Description"
        );

        mockMvc.perform(put("/api/v1/admin/products/" + testProductId)
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Matrix Test Product Updated"));
    }

    @Test
    @Order(17)
    @DisplayName("17. Delete/deactivate product")
    void test17_deleteProduct() throws Exception {
        CreateProductRequest req = new CreateProductRequest(
                "Temp Product To Delete",
                "temp-product-to-delete",
                testBrandId,
                testCategoryId,
                testSubcategoryId,
                null, null, null, null, null, null, null, null, null,
                ProductStatus.DRAFT, null, null
        );

        MvcResult res = mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        UUID tempProdId = UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString()).get("data").get("id").asText());

        mockMvc.perform(delete("/api/v1/admin/products/" + tempProdId)
                        .header("Authorization", adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(18)
    @DisplayName("18. Publish product")
    void test18_publishProduct() throws Exception {
        mockMvc.perform(patch("/api/v1/admin/products/" + testProductId + "/status")
                        .param("status", "PUBLISHED")
                        .header("Authorization", adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("PUBLISHED"));
    }

    @Test
    @Order(19)
    @DisplayName("19. Unpublish product")
    void test19_unpublishProduct() throws Exception {
        mockMvc.perform(patch("/api/v1/admin/products/" + testProductId + "/status")
                        .param("status", "UNPUBLISHED")
                        .header("Authorization", adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("UNPUBLISHED"));

        // Set back to PUBLISHED for customer discovery tests
        mockMvc.perform(patch("/api/v1/admin/products/" + testProductId + "/status")
                        .param("status", "PUBLISHED")
                        .header("Authorization", adminToken()))
                .andExpect(status().isOk());
    }

    @Test
    @Order(20)
    @DisplayName("20. Duplicate slug rejection")
    void test20_duplicateProductSlugRejection() throws Exception {
        CreateProductRequest req = new CreateProductRequest(
                "Duplicate Slug Product",
                "matrix-test-product",
                testBrandId,
                testCategoryId,
                testSubcategoryId,
                null, null, null, null, null, null, null, null, null,
                ProductStatus.DRAFT, null, null
        );

        mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @Order(21)
    @DisplayName("21. Invalid category rejection")
    void test21_invalidCategoryRejection() throws Exception {
        CreateProductRequest req = new CreateProductRequest(
                "Invalid Cat Product",
                "invalid-cat-prod",
                testBrandId,
                UUID.randomUUID(),
                testSubcategoryId,
                null, null, null, null, null, null, null, null, null,
                ProductStatus.DRAFT, null, null
        );

        mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @Order(22)
    @DisplayName("22. Invalid subcategory rejection")
    void test22_invalidSubcategoryRejection() throws Exception {
        CreateProductRequest req = new CreateProductRequest(
                "Invalid Subcat Product",
                "invalid-subcat-prod",
                testBrandId,
                testCategoryId,
                UUID.randomUUID(),
                null, null, null, null, null, null, null, null, null,
                ProductStatus.DRAFT, null, null
        );

        mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @Order(23)
    @DisplayName("23. Invalid brand rejection")
    void test23_invalidBrandRejection() throws Exception {
        CreateProductRequest req = new CreateProductRequest(
                "Invalid Brand Product",
                "invalid-brand-prod",
                UUID.randomUUID(),
                testCategoryId,
                testSubcategoryId,
                null, null, null, null, null, null, null, null, null,
                ProductStatus.DRAFT, null, null
        );

        mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    // =========================================================================
    // 5. VARIANT MATRIX (24 - 27)
    // =========================================================================

    @Test
    @Order(24)
    @DisplayName("24. Create variant")
    void test24_createVariant() throws Exception {
        VariantRequest req = new VariantRequest(
                testProductId,
                "Swiss Chocolate 2kg",
                "Swiss Chocolate",
                "2kg",
                "{\"flavor\":\"Swiss Chocolate\",\"weight\":\"2kg\"}",
                true,
                1
        );

        MvcResult result = mockMvc.perform(post("/api/v1/admin/products/" + testProductId + "/variants")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Swiss Chocolate 2kg"))
                .andReturn();

        var json = objectMapper.readTree(result.getResponse().getContentAsString());
        testVariantId = UUID.fromString(json.get("data").get("id").asText());
    }

    @Test
    @Order(25)
    @DisplayName("25. Update variant")
    void test25_updateVariant() throws Exception {
        VariantRequest req = new VariantRequest(
                testProductId,
                "Swiss Chocolate 2kg Premium",
                "Swiss Chocolate",
                "2kg",
                "{\"flavor\":\"Swiss Chocolate\",\"weight\":\"2kg\"}",
                true,
                1
        );

        mockMvc.perform(put("/api/v1/admin/products/variants/" + testVariantId)
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Swiss Chocolate 2kg Premium"));
    }

    @Test
    @Order(26)
    @DisplayName("26. Delete variant")
    void test26_deleteVariant() throws Exception {
        VariantRequest req = new VariantRequest(
                testProductId,
                "Temp Variant",
                "Vanilla",
                "1kg",
                null,
                true,
                2
        );

        MvcResult res = mockMvc.perform(post("/api/v1/admin/products/" + testProductId + "/variants")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        UUID tempVarId = UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString()).get("data").get("id").asText());

        mockMvc.perform(delete("/api/v1/admin/products/variants/" + tempVarId)
                        .header("Authorization", adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(27)
    @DisplayName("27. Invalid product relationship for variant")
    void test27_invalidProductRelationshipForVariant() throws Exception {
        UUID fakeProdId = UUID.randomUUID();
        VariantRequest req = new VariantRequest(fakeProdId, "Orphan Variant", null, null, null, true, 1);

        mockMvc.perform(post("/api/v1/admin/products/" + fakeProdId + "/variants")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    // =========================================================================
    // 6. SKU MATRIX (28 - 33)
    // =========================================================================

    @Test
    @Order(28)
    @DisplayName("28. Create SKU")
    void test28_createSku() throws Exception {
        SkuRequest req = new SkuRequest(
                testVariantId,
                "PROV-MAT-CHOC-2KG",
                new BigDecimal("2999.00"),
                new BigDecimal("3499.00"),
                "INR",
                true,
                true
        );

        MvcResult result = mockMvc.perform(post("/api/v1/admin/products/skus")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.skuCode").value("PROV-MAT-CHOC-2KG"))
                .andReturn();

        var json = objectMapper.readTree(result.getResponse().getContentAsString());
        testSkuId = UUID.fromString(json.get("data").get("id").asText());
    }

    @Test
    @Order(29)
    @DisplayName("29. Update SKU")
    void test29_updateSku() throws Exception {
        SkuRequest req = new SkuRequest(
                testVariantId,
                "PROV-MAT-CHOC-2KG",
                new BigDecimal("2899.00"),
                new BigDecimal("3499.00"),
                "INR",
                true,
                true
        );

        mockMvc.perform(put("/api/v1/admin/products/skus/" + testSkuId)
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.price").value(2899.00));
    }

    @Test
    @Order(30)
    @DisplayName("30. Delete SKU")
    void test30_deleteSku() throws Exception {
        SkuRequest req = new SkuRequest(
                testVariantId,
                "TEMP-SKU-TO-DELETE",
                new BigDecimal("999.00"),
                null,
                "INR",
                true,
                true
        );

        MvcResult res = mockMvc.perform(post("/api/v1/admin/products/skus")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        UUID tempSkuId = UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString()).get("data").get("id").asText());

        mockMvc.perform(delete("/api/v1/admin/products/skus/" + tempSkuId)
                        .header("Authorization", adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(31)
    @DisplayName("31. Duplicate SKU rejection")
    void test31_duplicateSkuRejection() throws Exception {
        SkuRequest req = new SkuRequest(
                testVariantId,
                "PROV-MAT-CHOC-2KG",
                new BigDecimal("1999.00"),
                null,
                "INR",
                true,
                true
        );

        mockMvc.perform(post("/api/v1/admin/products/skus")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @Order(32)
    @DisplayName("32. Invalid variant rejection for SKU")
    void test32_invalidVariantRejectionForSku() throws Exception {
        SkuRequest req = new SkuRequest(
                UUID.randomUUID(),
                "ORPHAN-SKU-CODE",
                new BigDecimal("1999.00"),
                null,
                "INR",
                true,
                true
        );

        mockMvc.perform(post("/api/v1/admin/products/skus")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @Order(33)
    @DisplayName("33. Invalid price rejection for SKU")
    void test33_invalidPriceRejection() throws Exception {
        SkuRequest req = new SkuRequest(
                testVariantId,
                "INVALID-PRICE-SKU",
                new BigDecimal("-50.00"),
                null,
                "INR",
                true,
                true
        );

        mockMvc.perform(post("/api/v1/admin/products/skus")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    // =========================================================================
    // 7. MEDIA MATRIX (34 - 37)
    // =========================================================================

    @Test
    @Order(34)
    @DisplayName("34. Add media")
    void test34_addMedia() throws Exception {
        ProductMediaRequest req = new ProductMediaRequest(
                testProductId,
                testVariantId,
                "IMAGE",
                "/assets/product-catalog/whey_isolated.png",
                "Product hero image",
                true,
                1,
                true
        );

        MvcResult result = mockMvc.perform(post("/api/v1/admin/products/" + testProductId + "/media")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.url").value("/assets/product-catalog/whey_isolated.png"))
                .andReturn();

        var json = objectMapper.readTree(result.getResponse().getContentAsString());
        testMediaId = UUID.fromString(json.get("data").get("id").asText());
    }

    @Test
    @Order(35)
    @DisplayName("35. Retrieve media")
    void test35_retrieveMedia() throws Exception {
        mockMvc.perform(get("/api/v1/products/matrix-test-product/media"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @Order(36)
    @DisplayName("36. Delete media")
    void test36_deleteMedia() throws Exception {
        ProductMediaRequest req = new ProductMediaRequest(
                testProductId,
                null,
                "IMAGE",
                "/assets/temp.png",
                "Temp",
                false,
                2,
                true
        );

        MvcResult res = mockMvc.perform(post("/api/v1/admin/products/" + testProductId + "/media")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        UUID tempMediaId = UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString()).get("data").get("id").asText());

        mockMvc.perform(delete("/api/v1/admin/products/media/" + tempMediaId)
                        .header("Authorization", adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(37)
    @DisplayName("37. Invalid product/media relationship")
    void test37_invalidProductMediaRelationship() throws Exception {
        UUID fakeProdId = UUID.randomUUID();
        ProductMediaRequest req = new ProductMediaRequest(
                fakeProdId,
                null,
                "IMAGE",
                "/assets/orphan.png",
                "Orphan",
                true,
                1,
                true
        );

        mockMvc.perform(post("/api/v1/admin/products/" + fakeProdId + "/media")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    // =========================================================================
    // 8. NUTRITION MATRIX (38 - 40)
    // =========================================================================

    @Test
    @Order(38)
    @DisplayName("38. Create/update nutrition")
    void test38_createOrUpdateNutrition() throws Exception {
        NutritionRequest req = new NutritionRequest(
                "1 Scoop (30g)",
                66,
                118,
                new BigDecimal("27.0"),
                new BigDecimal("1.5"),
                new BigDecimal("0.5"),
                new BigDecimal("0.0"),
                new BigDecimal("0.0"),
                new BigDecimal("55.0"),
                "[{\"metric\":\"Protein per scoop\",\"value\":\"27 g\"},{\"metric\":\"BCAA\",\"value\":\"5.5 g\"}]"
        );

        mockMvc.perform(put("/api/v1/admin/products/" + testProductId + "/nutrition")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.proteinG").value(27.0));
    }

    @Test
    @Order(39)
    @DisplayName("39. Retrieve nutrition")
    void test39_retrieveNutrition() throws Exception {
        mockMvc.perform(get("/api/v1/products/matrix-test-product/nutrition"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.proteinG").value(27.0));
    }

    @Test
    @Order(40)
    @DisplayName("40. Invalid product rejection for nutrition")
    void test40_invalidProductRejectionForNutrition() throws Exception {
        NutritionRequest req = new NutritionRequest("1 Scoop", 30, 100, new BigDecimal("20.0"), new BigDecimal("2.0"), new BigDecimal("1.0"), null, null, null, null);

        mockMvc.perform(put("/api/v1/admin/products/" + UUID.randomUUID() + "/nutrition")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    // =========================================================================
    // 9. FAQ MATRIX (41 - 44)
    // =========================================================================

    @Test
    @Order(41)
    @DisplayName("41. Create FAQ")
    void test41_createFaq() throws Exception {
        ProductFaqRequest req = new ProductFaqRequest(
                testProductId,
                "How do I use this isolate for optimal results?",
                "Mix 1 scoop with 250ml cold water within 30 minutes post workout.",
                1,
                true
        );

        MvcResult result = mockMvc.perform(post("/api/v1/admin/products/" + testProductId + "/faqs")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.question").value("How do I use this isolate for optimal results?"))
                .andReturn();

        var json = objectMapper.readTree(result.getResponse().getContentAsString());
        testFaqId = UUID.fromString(json.get("data").get("id").asText());
    }

    @Test
    @Order(42)
    @DisplayName("42. Retrieve FAQ")
    void test42_retrieveFaq() throws Exception {
        mockMvc.perform(get("/api/v1/products/matrix-test-product/faqs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @Order(43)
    @DisplayName("43. Delete FAQ")
    void test43_deleteFaq() throws Exception {
        ProductFaqRequest req = new ProductFaqRequest(testProductId, "Temp Q", "Temp A", 2, true);

        MvcResult res = mockMvc.perform(post("/api/v1/admin/products/" + testProductId + "/faqs")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        UUID tempFaqId = UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString()).get("data").get("id").asText());

        mockMvc.perform(delete("/api/v1/admin/products/faqs/" + tempFaqId)
                        .header("Authorization", adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(44)
    @DisplayName("44. Invalid product rejection for FAQ")
    void test44_invalidProductRejectionForFaq() throws Exception {
        UUID fakeProdId = UUID.randomUUID();
        ProductFaqRequest req = new ProductFaqRequest(fakeProdId, "Question?", "Answer.", 1, true);

        mockMvc.perform(post("/api/v1/admin/products/" + fakeProdId + "/faqs")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    // =========================================================================
    // 10. CUSTOMER CATALOGUE MATRIX (45 - 53)
    // =========================================================================

    @Test
    @Order(45)
    @DisplayName("45. List published products")
    void test45_listPublishedProducts() throws Exception {
        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @Order(46)
    @DisplayName("46. Verify unpublished product is hidden")
    void test46_verifyUnpublishedProductIsHidden() throws Exception {
        CreateProductRequest req = new CreateProductRequest(
                "Hidden Draft Product",
                "hidden-draft-product",
                testBrandId,
                testCategoryId,
                testSubcategoryId,
                null, null, null, null, null, null, null, null, null,
                ProductStatus.DRAFT, null, null
        );

        mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        // Ensure public PDP returns 404 for draft
        mockMvc.perform(get("/api/v1/products/hidden-draft-product"))
                .andExpect(status().isNotFound());
    }

    @Test
    @Order(47)
    @DisplayName("47. Product detail (PDP)")
    void test47_productDetailPdp() throws Exception {
        mockMvc.perform(get("/api/v1/products/matrix-test-product"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.slug").value("matrix-test-product"))
                .andExpect(jsonPath("$.data.brand.name").value("Matrix Brand Updated"))
                .andExpect(jsonPath("$.data.category.name").value("Matrix Test Category Updated"))
                .andExpect(jsonPath("$.data.variants", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.nutrition.proteinG").value(27.0))
                .andExpect(jsonPath("$.data.faqs", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @Order(48)
    @DisplayName("48. Search")
    void test48_search() throws Exception {
        mockMvc.perform(get("/api/v1/products").param("search", "Matrix Test Product"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.content[0].name", containsString("Matrix Test Product")));
    }

    @Test
    @Order(49)
    @DisplayName("49. Category filter")
    void test49_categoryFilter() throws Exception {
        mockMvc.perform(get("/api/v1/products").param("category", "matrix-test-category"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @Order(50)
    @DisplayName("50. Subcategory filter")
    void test50_subcategoryFilter() throws Exception {
        mockMvc.perform(get("/api/v1/products").param("subcategory", "matrix-subcategory"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @Order(51)
    @DisplayName("51. Brand filter")
    void test51_brandFilter() throws Exception {
        mockMvc.perform(get("/api/v1/products").param("brand", "matrix-brand"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @Order(52)
    @DisplayName("52. Pagination")
    void test52_pagination() throws Exception {
        mockMvc.perform(get("/api/v1/products").param("page", "0").param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.page").value(0))
                .andExpect(jsonPath("$.data.size").value(5))
                .andExpect(jsonPath("$.data.totalElements", greaterThanOrEqualTo(1)));
    }

    @Test
    @Order(53)
    @DisplayName("53. Sorting")
    void test53_sorting() throws Exception {
        mockMvc.perform(get("/api/v1/products").param("sort", "name,asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))));
    }

    // =========================================================================
    // 11. SECURITY MATRIX (54 - 58)
    // =========================================================================

    @Test
    @Order(54)
    @DisplayName("54. No JWT → 401")
    void test54_noJwtReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/products"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @Order(55)
    @DisplayName("55. CUSTOMER → 403")
    void test55_customerRoleReturns403() throws Exception {
        mockMvc.perform(get("/api/v1/admin/products")
                        .header("Authorization", customerToken()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @Order(56)
    @DisplayName("56. PRODUCT_MANAGER → allowed")
    void test56_productManagerRoleAllowed() throws Exception {
        mockMvc.perform(get("/api/v1/admin/products")
                        .header("Authorization", productManagerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(57)
    @DisplayName("57. ADMIN → allowed")
    void test57_adminRoleAllowed() throws Exception {
        mockMvc.perform(get("/api/v1/admin/products")
                        .header("Authorization", adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(58)
    @DisplayName("58. Forged X-Admin-Role → denied (401)")
    void test58_forgedAdminHeaderDenied() throws Exception {
        mockMvc.perform(get("/api/v1/admin/products")
                        .header("X-Admin-Role", "ADMIN"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    // =========================================================================
    // 12. ERROR HANDLING MATRIX (59 - 62)
    // =========================================================================

    @Test
    @Order(59)
    @DisplayName("59. Invalid request → 400")
    void test59_invalidRequestReturns400() throws Exception {
        mockMvc.perform(post("/api/v1/admin/categories")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @Order(60)
    @DisplayName("60. Missing resource → 404")
    void test60_missingResourceReturns404() throws Exception {
        mockMvc.perform(get("/api/v1/admin/products/" + UUID.randomUUID())
                        .header("Authorization", adminToken()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @Order(61)
    @DisplayName("61. Duplicate resource → 409")
    void test61_duplicateResourceReturns409() throws Exception {
        BrandRequest duplicateReq = new BrandRequest("Matrix Brand Updated", "matrix-brand", "Desc", null, true);

        mockMvc.perform(post("/api/v1/admin/brands")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @Order(62)
    @DisplayName("62. Validation error → proper validation response")
    void test62_validationErrorProperResponse() throws Exception {
        CategoryRequest invalidSlugReq = new CategoryRequest(
                "Invalid Slug Category",
                "INVALID SLUG WITH SPACES & CAPS",
                "Desc",
                null,
                true,
                1
        );

        mockMvc.perform(post("/api/v1/admin/categories")
                        .header("Authorization", adminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidSlugReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("Validation failed")));
    }
}
