package com.provana.payment.dto;

import com.provana.order.dto.CreateOrderRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record InitiateRazorpayOrderRequest(
        UUID orderId,

        @Valid
        CreateOrderRequest orderData,

        String idempotencyKey
) {}
