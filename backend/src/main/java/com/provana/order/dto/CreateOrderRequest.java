package com.provana.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CreateOrderRequest(
        @NotBlank(message = "Customer name is required")
        String customerName,

        @NotBlank(message = "Customer email is required")
        String customerEmail,

        String customerPhone,

        @NotBlank(message = "Shipping address is required")
        String shippingAddress,

        @NotBlank(message = "Shipping city is required")
        String shippingCity,

        @NotBlank(message = "Shipping state is required")
        String shippingState,

        @NotBlank(message = "Shipping pincode is required")
        String shippingPincode,

        String appliedCoupon,

        String notes,

        @NotEmpty(message = "Order must contain at least one item")
        @Valid
        List<CreateOrderItemRequest> items
) {}
