package com.provana.payment.dto;

import com.provana.order.entity.PaymentStatus;
import com.provana.payment.entity.PaymentGateway;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentDetailResponse(
        UUID id,
        UUID orderId,
        String orderNumber,
        PaymentGateway gateway,
        String razorpayOrderId,
        String razorpayPaymentId,
        BigDecimal amount,
        Long amountMinorUnits,
        String currency,
        PaymentStatus status,
        String paymentMethod,
        String failureCode,
        String failureDescription,
        String idempotencyKey,
        Instant capturedAt,
        Instant createdAt,
        Instant updatedAt
) {}
