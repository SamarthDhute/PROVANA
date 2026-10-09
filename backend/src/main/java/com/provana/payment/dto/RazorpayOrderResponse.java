package com.provana.payment.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record RazorpayOrderResponse(
        String keyId,
        String razorpayOrderId,
        Long amountMinorUnits,
        BigDecimal amount,
        String currency,
        String name,
        String description,
        UUID localOrderId,
        String orderNumber,
        String customerName,
        String customerEmail,
        String customerPhone,
        String notes
) {}
