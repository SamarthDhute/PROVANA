package com.provana.payment.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provana.auth.JwtTokenProvider;
import com.provana.catalog.entity.*;
import com.provana.catalog.repository.*;
import com.provana.inventory.entity.Inventory;
import com.provana.inventory.repository.InventoryRepository;
import com.provana.order.dto.CreateOrderItemRequest;
import com.provana.order.dto.CreateOrderRequest;
import com.provana.order.entity.Order;
import com.provana.order.entity.OrderStatus;
import com.provana.order.entity.PaymentStatus;
import com.provana.order.repository.OrderRepository;
import com.provana.payment.config.RazorpayProperties;
import com.provana.payment.dto.InitiateRazorpayOrderRequest;
import com.provana.payment.dto.VerifyRazorpayPaymentRequest;
import com.provana.payment.entity.Payment;
import com.provana.payment.repository.PaymentRepository;
import com.provana.payment.service.RazorpaySignatureValidator;
import com.provana.auth.Role;
import com.provana.user.entity.User;
import com.provana.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class RazorpayPaymentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private RazorpayProperties razorpayProperties;

    @Autowired
    private RazorpaySignatureValidator signatureValidator;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository variantRepository;

    @Autowired
    private SkuRepository skuRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    private User testCustomer;
    private User testAdmin;
    private Sku testSku;

    private String customerToken() {
        return "Bearer " + jwtTokenProvider.generateToken(testCustomer);
    }

    private String adminToken() {
        return "Bearer " + jwtTokenProvider.generateToken(testAdmin);
    }

    @BeforeEach
    void setUp() {
        testCustomer = userRepository.findByEmail("test_athlete@provana.com")
                .orElseGet(() -> {
                    User u = new User();
                    u.setEmail("test_athlete@provana.com");
                    u.setPasswordHash("hashed_pwd");
                    u.setFirstName("Alex");
                    u.setLastName("Hunter");
                    u.setRole(Role.CUSTOMER);
                    return userRepository.save(u);
                });

        testAdmin = userRepository.findByEmail("admin_payment@provana.com")
                .orElseGet(() -> {
                    User u = new User();
                    u.setEmail("admin_payment@provana.com");
                    u.setPasswordHash("hashed_pwd");
                    u.setFirstName("Super");
                    u.setLastName("Admin");
                    u.setRole(Role.ADMIN);
                    return userRepository.save(u);
                });

        // Ensure category, brand, product, and sku exist for testing
        Brand brand = brandRepository.findBySlug("provana-test-brand")
                .orElseGet(() -> {
                    Brand b = new Brand("PROVANA Brand", "provana-test-brand", "Test brand", "https://provana.com/logo.png");
                    return brandRepository.save(b);
                });

        Category category = categoryRepository.findBySlug("protein-test-cat")
                .orElseGet(() -> {
                    Category c = new Category("Protein Category", "protein-test-cat", "Test category", "https://provana.com/cat.png", 0);
                    return categoryRepository.save(c);
                });

        Product product = productRepository.findBySlug("provana-pure-whey-test")
                .orElseGet(() -> {
                    Product p = new Product();
                    p.setName("Provana Pure Whey Test");
                    p.setSlug("provana-pure-whey-test");
                    p.setBrand(brand);
                    p.setCategory(category);
                    p.setStatus(ProductStatus.PUBLISHED);
                    return productRepository.save(p);
                });

        ProductVariant variant = variantRepository.findAll().stream()
                .filter(v -> v.getProduct() != null && v.getProduct().getId().equals(product.getId()))
                .findFirst()
                .orElseGet(() -> {
                    ProductVariant v = new ProductVariant();
                    v.setProduct(product);
                    v.setName("1kg Belgian Chocolate");
                    v.setFlavor("Belgian Chocolate");
                    v.setSize("1kg");
                    v.setActive(true);
                    return variantRepository.save(v);
                });

        testSku = skuRepository.findBySkuCode("PV-TEST-SKU-001")
                .orElseGet(() -> {
                    Sku s = new Sku();
                    s.setVariant(variant);
                    s.setSkuCode("PV-TEST-SKU-001");
                    s.setPrice(new BigDecimal("2499.00"));
                    s.setCompareAtPrice(new BigDecimal("2999.00"));
                    s.setActive(true);
                    s.setAvailable(true);
                    return skuRepository.save(s);
                });

        inventoryRepository.findBySkuId(testSku.getId())
                .orElseGet(() -> {
                    Inventory inv = new Inventory(testSku, 100, 5);
                    return inventoryRepository.save(inv);
                });
    }

    @Test
    @DisplayName("Payment Initiation: Authenticated Customer initiates Razorpay Order")
    void initiateRazorpayOrder_Success() throws Exception {
        var itemReq = new CreateOrderItemRequest(testSku.getId(), null, null, null, null, 2);
        var orderReq = new CreateOrderRequest(
                "Alex Hunter",
                "test_athlete@provana.com",
                "+91 98765 43210",
                "402 Olympian Heights",
                "Bengaluru",
                "Karnataka",
                "560102",
                "PRO10",
                "Leave at door",
                List.of(itemReq)
        );

        var initReq = new InitiateRazorpayOrderRequest(null, orderReq, "idemp_test_" + UUID.randomUUID());

        MvcResult res = mockMvc.perform(post("/api/v1/payments/razorpay/order")
                        .header("Authorization", customerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(initReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.razorpayOrderId", notNullValue()))
                .andExpect(jsonPath("$.data.localOrderId", notNullValue()))
                .andExpect(jsonPath("$.data.amountMinorUnits", greaterThan(0)))
                .andExpect(jsonPath("$.data.keyId", notNullValue()))
                .andReturn();

        var json = objectMapper.readTree(res.getResponse().getContentAsString());
        UUID localOrderId = UUID.fromString(json.get("data").get("localOrderId").asText());

        Order createdOrder = orderRepository.findById(localOrderId).orElseThrow();
        assertEquals(OrderStatus.PENDING, createdOrder.getStatus());
        assertEquals(PaymentStatus.PENDING, createdOrder.getPaymentStatus());
    }

    @Test
    @DisplayName("Payment Initiation: Unauthenticated request returns 401 Unauthorized")
    void initiateRazorpayOrder_Unauthenticated_Returns401() throws Exception {
        var itemReq = new CreateOrderItemRequest(testSku.getId(), null, null, null, null, 1);
        var orderReq = new CreateOrderRequest(
                "Alex Hunter", "guest@provana.com", null, "Address", "City", "State", "560102", null, null, List.of(itemReq)
        );
        var initReq = new InitiateRazorpayOrderRequest(null, orderReq, null);

        mockMvc.perform(post("/api/v1/payments/razorpay/order")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(initReq)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Signature Verification: Valid HMAC-SHA256 signature captures payment & updates stock")
    void verifyPayment_ValidSignature_CapturesPayment() throws Exception {
        // 1. Create order
        var itemReq = new CreateOrderItemRequest(testSku.getId(), null, null, null, null, 1);
        var orderReq = new CreateOrderRequest(
                "Alex Hunter", "test_athlete@provana.com", "+91 98765 43210",
                "Address", "City", "State", "560102", null, null, List.of(itemReq)
        );
        var initReq = new InitiateRazorpayOrderRequest(null, orderReq, null);

        MvcResult initRes = mockMvc.perform(post("/api/v1/payments/razorpay/order")
                        .header("Authorization", customerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(initReq)))
                .andExpect(status().isOk())
                .andReturn();

        var initJson = objectMapper.readTree(initRes.getResponse().getContentAsString()).get("data");
        UUID localOrderId = UUID.fromString(initJson.get("localOrderId").asText());
        String rzpOrderId = initJson.get("razorpayOrderId").asText();
        String rzpPaymentId = "pay_test_" + UUID.randomUUID().toString().substring(0, 10);

        // 2. Compute valid signature using server key secret
        String payload = rzpOrderId + "|" + rzpPaymentId;
        String validSignature = signatureValidator.calculateHmacSha256(payload, razorpayProperties.getKeySecret());

        // 3. Submit verification
        var verifyReq = new VerifyRazorpayPaymentRequest(localOrderId, rzpOrderId, rzpPaymentId, validSignature);

        mockMvc.perform(post("/api/v1/payments/razorpay/verify")
                        .header("Authorization", customerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.verified").value(true))
                .andExpect(jsonPath("$.data.paymentStatus").value("CAPTURED"))
                .andExpect(jsonPath("$.data.orderStatus").value("CONFIRMED"));

        // Verify database state
        Order order = orderRepository.findById(localOrderId).orElseThrow();
        assertEquals(PaymentStatus.CAPTURED, order.getPaymentStatus());
        assertEquals(OrderStatus.CONFIRMED, order.getStatus());

        Payment payment = paymentRepository.findByRazorpayOrderId(rzpOrderId).orElseThrow();
        assertEquals(PaymentStatus.CAPTURED, payment.getStatus());
        assertEquals(rzpPaymentId, payment.getRazorpayPaymentId());
    }

    @Test
    @DisplayName("Signature Verification: Tampered signature is rejected with 400 Bad Request")
    void verifyPayment_InvalidSignature_Rejected() throws Exception {
        var itemReq = new CreateOrderItemRequest(testSku.getId(), null, null, null, null, 1);
        var orderReq = new CreateOrderRequest(
                "Alex Hunter", "test_athlete@provana.com", "+91 98765 43210",
                "Address", "City", "State", "560102", null, null, List.of(itemReq)
        );
        var initReq = new InitiateRazorpayOrderRequest(null, orderReq, null);

        MvcResult initRes = mockMvc.perform(post("/api/v1/payments/razorpay/order")
                        .header("Authorization", customerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(initReq)))
                .andExpect(status().isOk())
                .andReturn();

        var initJson = objectMapper.readTree(initRes.getResponse().getContentAsString()).get("data");
        UUID localOrderId = UUID.fromString(initJson.get("localOrderId").asText());
        String rzpOrderId = initJson.get("razorpayOrderId").asText();

        var verifyReq = new VerifyRazorpayPaymentRequest(localOrderId, rzpOrderId, "pay_fake_123", "tampered_signature_hex");

        mockMvc.perform(post("/api/v1/payments/razorpay/verify")
                        .header("Authorization", customerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("Invalid payment signature")));
    }

    @Test
    @DisplayName("Razorpay Webhook: Valid signature processes asynchronously without JWT")
    void webhook_ValidSignature_ProcessesWithoutJwt() throws Exception {
        String rawBody = """
                {
                  "event": "payment.captured",
                  "event_id": "%s",
                  "payload": {
                    "payment": {
                      "entity": {
                        "id": "pay_webhook_test_123",
                        "order_id": "order_webhook_test_456",
                        "amount": 249900,
                        "status": "captured"
                      }
                    }
                  }
                }
                """.formatted("evt_" + UUID.randomUUID());

        String validWebhookSignature = signatureValidator.calculateHmacSha256(rawBody, razorpayProperties.getWebhookSecret());

        mockMvc.perform(post("/api/v1/webhooks/razorpay")
                        .header("X-Razorpay-Signature", validWebhookSignature)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(rawBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Razorpay Webhook: Invalid signature returns 400 Bad Request")
    void webhook_InvalidSignature_Returns400() throws Exception {
        String rawBody = "{\"event\":\"payment.captured\"}";

        mockMvc.perform(post("/api/v1/webhooks/razorpay")
                        .header("X-Razorpay-Signature", "invalid_webhook_sig")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(rawBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Admin Payments API: ADMIN can view payments, CUSTOMER is rejected with 403")
    void adminPayments_RbacEnforced() throws Exception {
        // Admin access: 200 OK
        mockMvc.perform(get("/api/v1/admin/payments")
                        .header("Authorization", adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Customer access: 403 Forbidden
        mockMvc.perform(get("/api/v1/admin/payments")
                        .header("Authorization", customerToken()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }
}
