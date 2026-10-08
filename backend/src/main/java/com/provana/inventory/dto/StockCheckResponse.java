package com.provana.inventory.dto;

import java.util.UUID;

public record StockCheckResponse(
        UUID skuId,
        String skuCode,
        boolean inStock,
        Integer availableQuantity,
        Integer sellableQuantity
) {
}
