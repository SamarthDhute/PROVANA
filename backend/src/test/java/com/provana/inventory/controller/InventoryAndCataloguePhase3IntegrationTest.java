package com.provana.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provana.auth.JwtTokenProvider;
import com.provana.auth.Role;
import com.provana.catalog.entity.Product;
import com.provana.catalog.entity.ProductVariant;
import com.provana.catalog.entity.Sku;
import com.provana.catalog.repository.ProductRepository;
import com.provana.catalog.repository.ProductVariantRepository;
import com.provana.catalog.repository.SkuRepository;
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
    private InventoryRepository inventoryRepository;

    private Sku testSku;

    @BeforeEach
    void setUp() {
        testSku = skuRepository.findBySkuCode("PROV-WPI-CHOC-2KG").orElseGet(() -> {
            Product p = productRepository.findBySlug("provana-100-pure-whey-isolate")
                    .orElseThrow();

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
                        .header("Authorization", createBearerToken("admin@provana.com", Role.ADMIN))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("MANAGER: Can access /api/v1/admin/inventory (200 OK)")
    void manager_CanListInventory() throws Exception {
        mockMvc.perform(get("/api/v1/admin/inventory")
                        .header("Authorization", createBearerToken("manager@provana.com", Role.MANAGER))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("MANAGER: Can perform stock adjustment (200 OK)")
    void manager_CanAdjustStock() throws Exception {
        InventoryAdjustmentRequest request = new InventoryAdjustmentRequest(
                15,
                MovementType.STOCK_RECEIVED,
                "Restock from supplier batch",
                "PURCHASE_ORDER",
                "PO-2026-99"
        );

        mockMvc.perform(post("/api/v1/admin/inventory/" + testSku.getId() + "/adjust")
                        .header("Authorization", createBearerToken("manager@provana.com", Role.MANAGER))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.skuCode").value(testSku.getSkuCode()));
    }

    @Test
    @DisplayName("MANAGER: Negative stock adjustment beyond available quantity is rejected (400 Bad Request)")
    void manager_RejectNegativeStock() throws Exception {
        InventoryAdjustmentRequest request = new InventoryAdjustmentRequest(
                -999999, // Exceeds available
                MovementType.MANUAL_ADJUSTMENT,
                "Excess deduction",
                null,
                null
        );

        mockMvc.perform(post("/api/v1/admin/inventory/" + testSku.getId() + "/adjust")
                        .header("Authorization", createBearerToken("manager@provana.com", Role.MANAGER))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("cannot be negative")));
    }

    @Test
    @DisplayName("PRODUCT_MANAGER: Cannot adjust inventory (403 Forbidden)")
    void productManager_CannotAdjustInventory() throws Exception {
        InventoryAdjustmentRequest request = new InventoryAdjustmentRequest(
                10,
                MovementType.STOCK_RECEIVED,
                "Unauthorized PM adjustment",
                null,
                null
        );

        mockMvc.perform(post("/api/v1/admin/inventory/" + testSku.getId() + "/adjust")
                        .header("Authorization", createBearerToken("pm@provana.com", Role.PRODUCT_MANAGER))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("CUSTOMER: Cannot access admin inventory APIs (403 Forbidden)")
    void customer_CannotAccessInventory() throws Exception {
        mockMvc.perform(get("/api/v1/admin/inventory")
                        .header("Authorization", createBearerToken("customer@provana.com", Role.CUSTOMER))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("MANAGER: Cannot write or create products in catalogue (403 Forbidden)")
    void manager_CannotCreateProduct() throws Exception {
        String validProductJson = """
                {
                  "name": "Manager Forbidden Product",
                  "slug": "manager-forbidden-product",
                  "brandId": "11111111-1111-1111-1111-111111111111",
                  "categoryId": "22222222-2222-2222-2222-222222222001",
                  "status": "DRAFT"
                }
                """;

        mockMvc.perform(post("/api/v1/admin/products")
                        .header("Authorization", createBearerToken("manager@provana.com", Role.MANAGER))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validProductJson))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("PUBLIC: Customer can browse published products (200 OK)")
    void publicCustomer_CanBrowseProducts() throws Exception {
        mockMvc.perform(get("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))));
    }
}
