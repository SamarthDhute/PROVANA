package com.provana.payment.controller;

import com.provana.common.response.ApiResponse;
import com.provana.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/webhooks/razorpay")
@Tag(name = "Payment Webhooks: Razorpay", description = "Asynchronous webhook endpoint for server-to-server Razorpay event notifications")
public class RazorpayWebhookController {

    private final PaymentService paymentService;

    public RazorpayWebhookController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    @Operation(summary = "Handle Razorpay Webhook Event", description = "Validates raw payload HMAC-SHA256 signature, deduplicates events, and processes payment status updates")
    public ResponseEntity<ApiResponse<String>> handleWebhook(
            @RequestBody String rawBody,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signatureHeader) {

        paymentService.handleRazorpayWebhook(rawBody, signatureHeader);
        return ResponseEntity.ok(ApiResponse.ok("Webhook processed successfully"));
    }
}
