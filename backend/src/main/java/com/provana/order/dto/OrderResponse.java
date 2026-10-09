package com.provana.order.dto;

import com.provana.order.entity.OrderStatus;
import com.provana.order.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        String orderNumber,
        UUID userId,
        String customerEmail,
        String customerName,
        String customerPhone,
        String shippingAddress,
        String shippingCity,
        String shippingState,
        String shippingPincode,
        BigDecimal subtotalAmount,
        BigDecimal discountAmount,
        BigDecimal taxAmount,
        BigDecimal shippingFee,
        BigDecimal totalAmount,
        String currency,
        OrderStatus status,
        PaymentStatus paymentStatus,
        String appliedCoupon,
        String notes,
        List<OrderItemResponse> items,
        Instant createdAt,
        Instant updatedAt
) {}
