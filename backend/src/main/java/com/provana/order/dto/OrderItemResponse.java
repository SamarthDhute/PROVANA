package com.provana.order.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponse(
        UUID id,
        UUID productId,
        UUID skuId,
        String productName,
        String skuCode,
        String flavor,
        String size,
        BigDecimal unitPrice,
        Integer quantity,
        BigDecimal totalPrice
) {}
