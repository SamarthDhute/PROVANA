package com.provana.payment.controller;

import com.provana.common.response.ApiResponse;
import com.provana.common.response.PageResponse;
import com.provana.order.entity.PaymentStatus;
import com.provana.payment.dto.PaymentDetailResponse;
import com.provana.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/payments")
@Tag(name = "Admin Operations: Payments", description = "Administrative oversight of transactions, gateway references, and capture states")
public class AdminPaymentController {

    private final PaymentService paymentService;

    public AdminPaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'ORDER_MANAGER')")
    @Operation(summary = "List all payments", description = "Returns paginated list of gateway transactions with status filters")
    public ResponseEntity<ApiResponse<PageResponse<PaymentDetailResponse>>> listPayments(
            @RequestParam(required = false) PaymentStatus status,
            @PageableDefault(size = 20) Pageable pageable) {

        PageResponse<PaymentDetailResponse> response = paymentService.listAdminPayments(status, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'ORDER_MANAGER')")
    @Operation(summary = "Get payment details by ID", description = "Returns detailed payment and gateway records")
    public ResponseEntity<ApiResponse<PaymentDetailResponse>> getPaymentById(@PathVariable UUID id) {
        PaymentDetailResponse response = paymentService.getPaymentById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
