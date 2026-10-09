package com.provana.payment.service;

import com.provana.payment.config.RazorpayProperties;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class RazorpayClientWrapper {

    private static final Logger log = LoggerFactory.getLogger(RazorpayClientWrapper.class);

    private final RazorpayProperties properties;
    private RazorpayClient client;

    public RazorpayClientWrapper(RazorpayProperties properties) {
        this.properties = properties;
        initClient();
    }

    private synchronized void initClient() {
        if (properties.isEnabled() && properties.getKeyId() != null && properties.getKeySecret() != null) {
            try {
                this.client = new RazorpayClient(properties.getKeyId(), properties.getKeySecret());
                log.info("Initialized RazorpayClient with Key ID: {}", maskKey(properties.getKeyId()));
            } catch (RazorpayException e) {
                log.warn("Could not initialize RazorpayClient (development/test mode active): {}", e.getMessage());
            }
        }
    }

    public record GatewayOrderResult(String orderId, Long amountMinorUnits, String currency, String status) {}
    public record GatewayPaymentResult(String paymentId, String orderId, Long amountMinorUnits, String status, String method, String errorDescription) {}

    /**
     * Creates an Order on Razorpay servers.
     */
    public GatewayOrderResult createRazorpayOrder(Long amountMinorUnits, String currency, String receipt, JSONObject notes) throws Exception {
        if (client == null) {
            initClient();
        }

        if (client != null && properties.isEnabled() && !properties.getKeyId().contains("mock")) {
            try {
                JSONObject orderRequest = new JSONObject();
                orderRequest.put("amount", amountMinorUnits);
                orderRequest.put("currency", currency);
                orderRequest.put("receipt", receipt);
                orderRequest.put("payment_capture", 1); // Auto-capture payment on authorization
                if (notes != null) {
                    orderRequest.put("notes", notes);
                }

                com.razorpay.Order order = client.orders.create(orderRequest);
                String orderId = order.get("id");
                String status = order.get("status");
                return new GatewayOrderResult(orderId, amountMinorUnits, currency, status);
            } catch (RazorpayException e) {
                log.error("Razorpay API order creation failed: {}", e.getMessage());
                throw e;
            }
        } else {
            // Local test mode simulation
            String simulatedOrderId = "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
            log.info("Test Mode / Mock Razorpay: Created simulated order ID {}", simulatedOrderId);
            return new GatewayOrderResult(simulatedOrderId, amountMinorUnits, currency, "created");
        }
    }

    /**
     * Fetches a Payment from Razorpay servers.
     */
    public GatewayPaymentResult fetchPayment(String paymentId) throws Exception {
        if (client == null) {
            initClient();
        }

        if (client != null && properties.isEnabled() && !properties.getKeyId().contains("mock")) {
            try {
                com.razorpay.Payment payment = client.payments.fetch(paymentId);
                String orderId = payment.get("order_id");
                Number amt = payment.get("amount");
                String status = payment.get("status");
                String method = payment.has("method") ? payment.get("method") : null;
                String errorDesc = payment.has("error_description") ? payment.get("error_description") : null;
                return new GatewayPaymentResult(paymentId, orderId, amt.longValue(), status, method, errorDesc);
            } catch (RazorpayException e) {
                log.error("Razorpay API fetch payment failed: {}", e.getMessage());
                throw e;
            }
        } else {
            // Test Mode simulation
            return new GatewayPaymentResult(paymentId, null, null, "captured", "upi", null);
        }
    }

    private String maskKey(String key) {
        if (key == null || key.length() < 8) return "****";
        return key.substring(0, 4) + "..." + key.substring(key.length() - 4);
    }
}
