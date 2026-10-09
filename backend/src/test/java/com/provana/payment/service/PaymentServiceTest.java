package com.provana.payment.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.provana.common.exception.BadRequestException;
import com.provana.inventory.service.InventoryService;
import com.provana.order.entity.Order;
import com.provana.order.entity.OrderStatus;
import com.provana.order.entity.PaymentStatus;
import com.provana.order.repository.OrderRepository;
import com.provana.order.service.OrderService;
import com.provana.payment.config.RazorpayProperties;
import com.provana.payment.dto.InitiateRazorpayOrderRequest;
import com.provana.payment.dto.VerifyRazorpayPaymentRequest;
import com.provana.payment.entity.Payment;
import com.provana.payment.repository.PaymentRepository;
import com.provana.payment.repository.PaymentWebhookEventRepository;
import com.provana.auth.Role;
import com.provana.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentWebhookEventRepository webhookEventRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderService orderService;

    @Mock
    private InventoryService inventoryService;

    @Mock
    private RazorpayProperties razorpayProperties;

    @Mock
    private RazorpayClientWrapper razorpayClientWrapper;

    @Mock
    private RazorpaySignatureValidator signatureValidator;

    private ObjectMapper objectMapper;
    private PaymentService paymentService;

    private User testUser;
    private Order testOrder;
    private Payment testPayment;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        paymentService = new PaymentService(
                paymentRepository,
                webhookEventRepository,
                orderRepository,
                orderService,
                inventoryService,
                razorpayProperties,
                razorpayClientWrapper,
                signatureValidator,
                objectMapper
        );

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("athlete@provana.com");
        testUser.setRole(Role.CUSTOMER);

        testOrder = new Order();
        testOrder.setId(UUID.randomUUID());
        testOrder.setOrderNumber("PV-20261009-12345");
        testOrder.setUser(testUser);
        testOrder.setTotalAmount(new BigDecimal("2499.00"));
        testOrder.setCurrency("INR");
        testOrder.setStatus(OrderStatus.PENDING);
        testOrder.setPaymentStatus(PaymentStatus.PENDING);

        testPayment = new Payment();
        testPayment.setId(UUID.randomUUID());
        testPayment.setOrder(testOrder);
        testPayment.setRazorpayOrderId("order_test_123456");
        testPayment.setAmount(new BigDecimal("2499.00"));
        testPayment.setAmountMinorUnits(249900L);
        testPayment.setStatus(PaymentStatus.CREATED);
    }

    @Test
    @DisplayName("Initiate Razorpay Order: Success with existing Order ID")
    void initiateRazorpayOrder_Success() throws Exception {
        when(orderRepository.findById(testOrder.getId())).thenReturn(Optional.of(testOrder));
        when(razorpayProperties.getKeyId()).thenReturn("rzp_test_mockkey");
        when(razorpayClientWrapper.createRazorpayOrder(eq(249900L), eq("INR"), anyString(), any()))
                .thenReturn(new RazorpayClientWrapper.GatewayOrderResult("order_test_123456", 249900L, "INR", "created"));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var request = new InitiateRazorpayOrderRequest(testOrder.getId(), null, "idemp_key_1");
        var response = paymentService.initiateRazorpayOrder(request, testUser);

        assertNotNull(response);
        assertEquals("order_test_123456", response.razorpayOrderId());
        assertEquals(249900L, response.amountMinorUnits());
        assertEquals(new BigDecimal("2499.00"), response.amount());
        assertEquals("rzp_test_mockkey", response.keyId());

        verify(paymentRepository).save(any(Payment.class));
    }

    @Test
    @DisplayName("Verify Razorpay Payment: Valid Signature Captures Payment and Confirms Order")
    void verifyRazorpayPayment_ValidSignature_CapturesPayment() throws Exception {
        when(orderRepository.findById(testOrder.getId())).thenReturn(Optional.of(testOrder));
        when(paymentRepository.findByRazorpayOrderId("order_test_123456")).thenReturn(Optional.of(testPayment));
        when(razorpayProperties.getKeySecret()).thenReturn("mock_secret");
        when(signatureValidator.verifyPaymentSignature("order_test_123456", "pay_test_789", "valid_sig", "mock_secret"))
                .thenReturn(true);
        when(razorpayClientWrapper.fetchPayment("pay_test_789"))
                .thenReturn(new RazorpayClientWrapper.GatewayPaymentResult("pay_test_789", "order_test_123456", 249900L, "captured", "upi", null));

        var verifyReq = new VerifyRazorpayPaymentRequest(testOrder.getId(), "order_test_123456", "pay_test_789", "valid_sig");
        var result = paymentService.verifyRazorpayPayment(verifyReq, testUser);

        assertTrue(result.verified());
        assertEquals(PaymentStatus.CAPTURED, testPayment.getStatus());
        assertEquals("pay_test_789", testPayment.getRazorpayPaymentId());
        assertEquals(OrderStatus.CONFIRMED, testOrder.getStatus());
        assertEquals(PaymentStatus.CAPTURED, testOrder.getPaymentStatus());

        verify(paymentRepository).save(testPayment);
        verify(orderRepository).save(testOrder);
    }

    @Test
    @DisplayName("Verify Razorpay Payment: Invalid Signature Rejects Payment and Throws Exception")
    void verifyRazorpayPayment_InvalidSignature_ThrowsBadRequest() {
        when(orderRepository.findById(testOrder.getId())).thenReturn(Optional.of(testOrder));
        when(paymentRepository.findByRazorpayOrderId("order_test_123456")).thenReturn(Optional.of(testPayment));
        when(razorpayProperties.getKeySecret()).thenReturn("mock_secret");
        when(signatureValidator.verifyPaymentSignature("order_test_123456", "pay_test_tampered", "bad_sig", "mock_secret"))
                .thenReturn(false);

        var verifyReq = new VerifyRazorpayPaymentRequest(testOrder.getId(), "order_test_123456", "pay_test_tampered", "bad_sig");

        assertThrows(BadRequestException.class, () -> paymentService.verifyRazorpayPayment(verifyReq, testUser));
        assertEquals(PaymentStatus.FAILED, testPayment.getStatus());
        verify(paymentRepository).save(testPayment);
    }

    @Test
    @DisplayName("Webhook: Valid payment.captured event processes and deduplicates")
    void handleRazorpayWebhook_PaymentCaptured_Success() {
        String rawWebhookBody = """
                {
                  "event": "payment.captured",
                  "event_id": "evt_1234567890",
                  "payload": {
                    "payment": {
                      "entity": {
                        "id": "pay_test_webhook_1",
                        "order_id": "order_test_123456",
                        "amount": 249900,
                        "status": "captured",
                        "method": "upi"
                      }
                    }
                  }
                }
                """;

        when(razorpayProperties.getWebhookSecret()).thenReturn("webhook_secret");
        when(signatureValidator.verifyWebhookSignature(rawWebhookBody, "valid_webhook_sig", "webhook_secret"))
                .thenReturn(true);
        when(webhookEventRepository.existsByEventId("evt_1234567890")).thenReturn(false);
        when(paymentRepository.findByRazorpayOrderId("order_test_123456")).thenReturn(Optional.of(testPayment));

        paymentService.handleRazorpayWebhook(rawWebhookBody, "valid_webhook_sig");

        verify(webhookEventRepository).save(any());
        assertEquals(PaymentStatus.CAPTURED, testPayment.getStatus());
        assertEquals("pay_test_webhook_1", testPayment.getRazorpayPaymentId());
        assertEquals(OrderStatus.CONFIRMED, testOrder.getStatus());
    }

    @Test
    @DisplayName("Webhook: Duplicate event is safely ignored")
    void handleRazorpayWebhook_DuplicateEvent_Ignored() {
        String rawWebhookBody = """
                {
                  "event": "payment.captured",
                  "event_id": "evt_duplicate_1",
                  "payload": {}
                }
                """;

        when(razorpayProperties.getWebhookSecret()).thenReturn("webhook_secret");
        when(signatureValidator.verifyWebhookSignature(rawWebhookBody, "sig", "webhook_secret"))
                .thenReturn(true);
        when(webhookEventRepository.existsByEventId("evt_duplicate_1")).thenReturn(true);

        paymentService.handleRazorpayWebhook(rawWebhookBody, "sig");

        verify(webhookEventRepository, never()).save(any());
        verify(paymentRepository, never()).findByRazorpayOrderId(anyString());
    }

    @Test
    @DisplayName("Webhook: Invalid signature throws BadRequestException")
    void handleRazorpayWebhook_InvalidSignature_ThrowsBadRequest() {
        String rawWebhookBody = "{\"event\":\"payment.captured\"}";

        when(razorpayProperties.getWebhookSecret()).thenReturn("webhook_secret");
        when(signatureValidator.verifyWebhookSignature(rawWebhookBody, "tampered_sig", "webhook_secret"))
                .thenReturn(false);

        assertThrows(BadRequestException.class, () -> paymentService.handleRazorpayWebhook(rawWebhookBody, "tampered_sig"));
    }
}
