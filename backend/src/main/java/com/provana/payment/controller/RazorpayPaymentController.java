package com.provana.payment.controller;

import com.provana.common.response.ApiResponse;
import com.provana.payment.dto.*;
import com.provana.payment.service.PaymentService;
import com.provana.user.entity.User;
import com.provana.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments/razorpay")
@Tag(name = "Customer Payments: Razorpay", description = "Endpoints for initiating and verifying Razorpay Standard Checkout payments")
public class RazorpayPaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    public RazorpayPaymentController(PaymentService paymentService, UserRepository userRepository) {
        this.paymentService = paymentService;
        this.userRepository = userRepository;
    }

    private User resolveCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    @PostMapping("/order")
    @Operation(summary = "Initiate Razorpay order", description = "Validates items, stock, calculates authoritative payable amount, and creates Razorpay order")
    public ResponseEntity<ApiResponse<RazorpayOrderResponse>> initiateRazorpayOrder(
            @Valid @RequestBody InitiateRazorpayOrderRequest request) {

        User currentUser = resolveCurrentUser();
        RazorpayOrderResponse response = paymentService.initiateRazorpayOrder(request, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify Razorpay payment signature", description = "Verifies HMAC-SHA256 signature, validates payment status, captures payment, and fulfills order")
    public ResponseEntity<ApiResponse<PaymentVerificationResponse>> verifyRazorpayPayment(
            @Valid @RequestBody VerifyRazorpayPaymentRequest request) {

        User currentUser = resolveCurrentUser();
        PaymentVerificationResponse response = paymentService.verifyRazorpayPayment(request, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
