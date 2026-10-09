package com.provana.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provana.auth.JwtTokenProvider;
import com.provana.auth.Role;
import com.provana.catalog.entity.*;
import com.provana.catalog.repository.*;
import com.provana.inventory.dto.InventoryAdjustmentRequest;
import com.provana.inventory.entity.Inventory;
import com.provana.inventory.entity.MovementType;
import com.provana.inventory.repository.InventoryRepository;
import com.provana.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class InventoryAndCataloguePhase3IntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private SkuRepository skuRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository variantRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    private Sku testSku;

    @BeforeEach
    void setUp() {
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

        testSku = skuRepository.findBySkuCode("PROV-WPI-CHOC-2KG").orElseGet(() -> {
            var variants = variantRepository.findByProductIdOrderBySortOrderAsc(p.getId());
            ProductVariant variant;
            if (variants.isEmpty()) {
                variant = new ProductVariant();
                variant.setProduct(p);
                variant.setName("Rich Double Chocolate - 2kg");
                variant.setFlavor("Rich Double Chocolate");
                variant.setSize("2kg");
                variant.setActive(true);
                variant = variantRepository.save(variant);
            } else {
                variant = variants.get(0);
            }

            Sku sku = new Sku();
            sku.setVariant(variant);
            sku.setSkuCode("PROV-WPI-CHOC-2KG");
            sku.setPrice(new BigDecimal("3499.00"));
            sku.setAvailable(true);
            sku.setActive(true);
            return skuRepository.save(sku);
        });

        if (!inventoryRepository.existsBySkuId(testSku.getId())) {
            Inventory inv = new Inventory(testSku, 50, 10);
            inventoryRepository.save(inv);
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
    @DisplayName("ADMIN: Can access /api/v1/admin/inventory (200 OK)")
    void admin_CanListInventory() throws Exception {
        mockMvc.perform(get("/api/v1/admin/inventory")
                        .header("Authorization", createBearerToken("admin@provana.com", Role.ADMIN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @DisplayName("MANAGER: Can access /api/v1/admin/inventory (200 OK)")
    void manager_CanListInventory() throws Exception {
        mockMvc.perform(get("/api/v1/admin/inventory")
                        .header("Authorization", createBearerToken("manager@provana.com", Role.MANAGER)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("ORDER_MANAGER: Forbidden from accessing /api/v1/admin/inventory (403 Forbidden)")
    void orderManager_ForbiddenFromInventory() throws Exception {
        mockMvc.perform(get("/api/v1/admin/inventory")
                        .header("Authorization", createBearerToken("order@provana.com", Role.ORDER_MANAGER)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PRODUCT_MANAGER: Forbidden from accessing /api/v1/admin/inventory (403 Forbidden)")
    void productManager_ForbiddenFromInventory() throws Exception {
        mockMvc.perform(get("/api/v1/admin/inventory")
                        .header("Authorization", createBearerToken("pm@provana.com", Role.PRODUCT_MANAGER)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CUSTOMER: Forbidden from accessing /api/v1/admin/inventory (403 Forbidden)")
    void customer_ForbiddenFromInventory() throws Exception {
        mockMvc.perform(get("/api/v1/admin/inventory")
                        .header("Authorization", createBearerToken("customer@provana.com", Role.CUSTOMER)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Anonymous: Unauthorized on /api/v1/admin/inventory (401 Unauthorized)")
    void anonymous_UnauthorizedOnInventory() throws Exception {
        mockMvc.perform(get("/api/v1/admin/inventory"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Public Stock Check: Anonymous user can check stock for SKU (200 OK)")
    void public_StockCheck_Returns200() throws Exception {
        mockMvc.perform(get("/api/v1/catalog/skus/" + testSku.getId() + "/stock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.inStock").value(true))
                .andExpect(jsonPath("$.data.skuCode").value("PROV-WPI-CHOC-2KG"));
    }

    @Test
    @DisplayName("Admin Stock Adjustment: Manual stock increase records movement audit (200 OK)")
    void admin_CanAdjustStock() throws Exception {
        InventoryAdjustmentRequest req = new InventoryAdjustmentRequest(
                10,
                MovementType.STOCK_RECEIVED,
                "Restock batch from warehouse",
                "PO-10023",
                null
        );

        mockMvc.perform(post("/api/v1/admin/inventory/" + testSku.getId() + "/adjust")
                        .header("Authorization", createBearerToken("admin@provana.com", Role.ADMIN))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.availableQuantity").isNumber());
    }
}
