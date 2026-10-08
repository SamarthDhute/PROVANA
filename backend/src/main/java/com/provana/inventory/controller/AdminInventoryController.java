package com.provana.inventory.controller;

import com.provana.auth.AdminSecurityService;
import com.provana.auth.Permission;
import com.provana.common.response.ApiResponse;
import com.provana.common.response.PageResponse;
import com.provana.inventory.dto.InventoryAdjustmentRequest;
import com.provana.inventory.dto.InventoryMovementResponse;
import com.provana.inventory.dto.InventoryResponse;
import com.provana.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/inventory")
@Tag(name = "Admin: Inventory & Stock Management", description = "Administrative live stock tracking, adjustments, low-stock alerts, and movement audits (ADMIN, MANAGER)")
public class AdminInventoryController {

    private final InventoryService inventoryService;
    private final AdminSecurityService securityService;

    public AdminInventoryController(InventoryService inventoryService, AdminSecurityService securityService) {
        this.inventoryService = inventoryService;
        this.securityService = securityService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('INVENTORY_READ')")
    @Operation(summary = "List live SKU inventory", description = "Requires INVENTORY_READ permission (ADMIN, MANAGER)")
    public ResponseEntity<ApiResponse<PageResponse<InventoryResponse>>> listInventory(
            @RequestParam(required = false, defaultValue = "false") Boolean lowStockOnly,
            @PageableDefault(size = 20) Pageable pageable) {

        securityService.checkPermission(Permission.INVENTORY_READ);
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.listInventory(pageable, lowStockOnly)));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyAuthority('INVENTORY_READ', 'INVENTORY_REPORT_READ')")
    @Operation(summary = "List low-stock SKUs", description = "Requires INVENTORY_REPORT_READ or INVENTORY_READ permission (ADMIN, MANAGER)")
    public ResponseEntity<ApiResponse<PageResponse<InventoryResponse>>> getLowStock(
            @PageableDefault(size = 20) Pageable pageable) {

        securityService.checkAnyPermission(Permission.INVENTORY_READ, Permission.INVENTORY_REPORT_READ);
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.listInventory(pageable, true)));
    }

    @GetMapping("/{skuId}")
    @PreAuthorize("hasAuthority('INVENTORY_READ')")
    @Operation(summary = "Get inventory details for a SKU", description = "Requires INVENTORY_READ permission (ADMIN, MANAGER)")
    public ResponseEntity<ApiResponse<InventoryResponse>> getInventoryBySkuId(@PathVariable UUID skuId) {
        securityService.checkPermission(Permission.INVENTORY_READ);
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getInventoryBySkuId(skuId)));
    }

    @PostMapping("/{skuId}/adjust")
    @PreAuthorize("hasAuthority('INVENTORY_ADJUST')")
    @Operation(summary = "Adjust SKU stock quantity", description = "Requires INVENTORY_ADJUST permission (ADMIN, MANAGER)")
    public ResponseEntity<ApiResponse<InventoryResponse>> adjustStock(
            @PathVariable UUID skuId,
            @Valid @RequestBody InventoryAdjustmentRequest request) {

        securityService.checkPermission(Permission.INVENTORY_ADJUST);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String performedBy = auth != null ? auth.getName() : "ADMIN";

        InventoryResponse response = inventoryService.adjustStock(skuId, request, performedBy);
        return ResponseEntity.ok(ApiResponse.ok(response, "Stock successfully adjusted"));
    }

    @GetMapping("/{skuId}/movements")
    @PreAuthorize("hasAuthority('INVENTORY_READ')")
    @Operation(summary = "Get audit movement history for a SKU", description = "Requires INVENTORY_READ permission (ADMIN, MANAGER)")
    public ResponseEntity<ApiResponse<PageResponse<InventoryMovementResponse>>> getMovementHistory(
            @PathVariable UUID skuId,
            @PageableDefault(size = 20) Pageable pageable) {

        securityService.checkPermission(Permission.INVENTORY_READ);
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getMovementHistory(skuId, pageable)));
    }
}
