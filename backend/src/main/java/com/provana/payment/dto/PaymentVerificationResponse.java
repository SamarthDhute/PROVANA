package com.provana.payment.dto;

import com.provana.order.entity.OrderStatus;
import com.provana.order.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentVerificationResponse(
        boolean verified,
        String message,
        UUID paymentId,
        UUID orderId,
        String orderNumber,
        String razorpayOrderId,
        String razorpayPaymentId,
        BigDecimal amount,
        String currency,
        PaymentStatus paymentStatus,
        OrderStatus orderStatus,
        Instant capturedAt
) {}
