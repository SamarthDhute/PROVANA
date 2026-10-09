package com.provana.order.controller;

import com.provana.common.exception.BadRequestException;
import com.provana.common.response.ApiResponse;
import com.provana.common.response.PageResponse;
import com.provana.order.dto.CreateOrderRequest;
import com.provana.order.dto.OrderResponse;
import com.provana.order.entity.Order;
import com.provana.order.service.OrderService;
import com.provana.user.entity.User;
import com.provana.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@Tag(name = "Customer Orders", description = "Endpoints for creating and viewing customer orders")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public OrderController(OrderService orderService, UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    private User resolveCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    @PostMapping
    @Operation(summary = "Create customer order", description = "Validates items, checks inventory, and creates pending order")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody CreateOrderRequest request) {

        User currentUser = resolveCurrentUser();
        Order order = orderService.createOrderEntity(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(orderService.mapToResponse(order)));
    }

    @GetMapping
    @Operation(summary = "List customer's orders", description = "Returns paginated list of authenticated customer's order history")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> listMyOrders(
            @PageableDefault(size = 20) Pageable pageable) {

        User currentUser = resolveCurrentUser();
        if (currentUser == null) {
            throw new BadRequestException("Authentication required to view order history");
        }

        PageResponse<OrderResponse> response = orderService.listUserOrders(currentUser.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details", description = "Returns customer order details by order ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable UUID id) {

        User currentUser = resolveCurrentUser();
        Order order = orderService.getOrderEntityById(id);
        if (currentUser != null && order.getUser() != null && !order.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Unauthorized access to requested order");
        }

        return ResponseEntity.ok(ApiResponse.ok(orderService.mapToResponse(order)));
    }
}
