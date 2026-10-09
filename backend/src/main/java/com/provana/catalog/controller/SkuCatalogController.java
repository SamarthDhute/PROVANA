package com.provana.catalog.controller;

import com.provana.common.response.ApiResponse;
import com.provana.inventory.dto.StockCheckResponse;
import com.provana.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog/skus")
@Tag(name = "Customer Catalogue: SKUs", description = "Public endpoints for SKU stock checks")
public class SkuCatalogController {

    private final InventoryService inventoryService;

    public SkuCatalogController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/{skuId}/stock")
    @Operation(summary = "Check SKU live stock availability", description = "Public real-time sellable inventory check")
    public ResponseEntity<ApiResponse<StockCheckResponse>> checkStock(@PathVariable UUID skuId) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.checkStock(skuId)));
    }
}
