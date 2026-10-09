package com.provana.payment.service;

import com.provana.common.exception.BadRequestException;
import com.provana.payment.config.RazorpayProperties;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class RazorpayClientWrapper {

    private static final Logger log = LoggerFactory.getLogger(RazorpayClientWrapper.class);

    private final RazorpayProperties properties;
    private RazorpayClient client;

    public RazorpayClientWrapper(RazorpayProperties properties) {
        this.properties = properties;
        initClient();
    }

    public synchronized void initClient() {
        if (properties.isConfigured()) {
            try {
                this.client = new RazorpayClient(properties.getKeyId(), properties.getKeySecret());
                log.info("Initialized RazorpayClient with Key ID: {}", maskKey(properties.getKeyId()));
            } catch (RazorpayException e) {
                log.error("Could not initialize RazorpayClient: {}", e.getMessage());
                this.client = null;
            }
        } else {
            this.client = null;
            log.warn("RazorpayClient not initialized: Valid credentials not configured in environment.");
        }
    }

    public void setClient(RazorpayClient client) {
        this.client = client;
    }

    public RazorpayClient getClient() {
        return this.client;
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

        if (client == null || !properties.isConfigured()) {
            log.error("Razorpay order creation rejected: Gateway credentials missing or unconfigured.");
            throw new BadRequestException("Razorpay payment gateway is not properly configured with valid credentials. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
        }

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
            log.info("Successfully created genuine Razorpay Order: {} (Amount: {} {})", orderId, amountMinorUnits, currency);
            return new GatewayOrderResult(orderId, amountMinorUnits, currency, status);
        } catch (RazorpayException e) {
            log.error("Razorpay API order creation failed: {}", e.getMessage());
            throw new BadRequestException("Payment gateway order creation failed: " + e.getMessage());
        }
    }

    /**
     * Fetches a Payment from Razorpay servers.
     */
    public GatewayPaymentResult fetchPayment(String paymentId) throws Exception {
        if (client == null) {
            initClient();
        }

        if (client == null || !properties.isConfigured()) {
            throw new BadRequestException("Razorpay payment gateway is not properly configured to verify payments.");
        }

        try {
            com.razorpay.Payment payment = client.payments.fetch(paymentId);
            String orderId = payment.get("order_id");
            Number amt = payment.get("amount");
            String status = payment.get("status");
            String method = payment.has("method") ? payment.get("method") : null;
            String errorDesc = payment.has("error_description") ? payment.get("error_description") : null;
            return new GatewayPaymentResult(paymentId, orderId, amt != null ? amt.longValue() : null, status, method, errorDesc);
        } catch (RazorpayException e) {
            log.error("Razorpay API fetch payment failed for {}: {}", paymentId, e.getMessage());
            throw e;
        }
    }

    private String maskKey(String key) {
        if (key == null || key.length() < 8) return "****";
        return key.substring(0, 4) + "..." + key.substring(key.length() - 4);
    }
}
