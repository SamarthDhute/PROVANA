package com.provana.order.controller;

import com.provana.common.response.ApiResponse;
import com.provana.common.response.PageResponse;
import com.provana.order.dto.OrderResponse;
import com.provana.order.entity.OrderStatus;
import com.provana.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/orders")
@Tag(name = "Admin Operations: Orders", description = "Administrative order management and status update controls")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'ORDER_MANAGER')")
    @Operation(summary = "List all orders", description = "Returns paginated list of all customer orders with status filters")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> listOrders(
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 20) Pageable pageable) {

        PageResponse<OrderResponse> response = orderService.listAdminOrders(status, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'ORDER_MANAGER')")
    @Operation(summary = "Get order by ID", description = "Returns detailed order record")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable UUID id) {
        OrderResponse response = orderService.getOrderResponseById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'ORDER_MANAGER')")
    @Operation(summary = "Update order fulfillment status", description = "Updates order status (e.g. PROCESSING, SHIPPED, DELIVERED, CANCELLED)")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable UUID id,
            @RequestParam OrderStatus status) {

        OrderResponse response = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
