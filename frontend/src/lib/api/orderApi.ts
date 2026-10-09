import { apiClient } from "./apiClient";
import { PageResponse } from "./types";

export interface OrderItemDto {
  id: string;
  productId?: string;
  skuId?: string;
  productName: string;
  skuCode: string;
  flavor?: string;
  size?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  userId?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  shippingFee: number;
  totalAmount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  appliedCoupon?: string;
  notes?: string;
  items: OrderItemDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  appliedCoupon?: string;
  notes?: string;
  items: Array<{
    skuId: string;
    quantity: number;
  }>;
}

export const orderApi = {
  createOrder: async (payload: CreateOrderPayload): Promise<OrderDto> => {
    return apiClient.post<OrderDto>("/api/v1/orders", payload);
  },

  listMyOrders: async (params?: { page?: number; size?: number }): Promise<PageResponse<OrderDto>> => {
    return apiClient.get<PageResponse<OrderDto>>("/api/v1/orders", { params: params as any });
  },

  getOrderById: async (id: string): Promise<OrderDto> => {
    return apiClient.get<OrderDto>(`/api/v1/orders/${id}`);
  },

  listAdminOrders: async (params?: { status?: string; page?: number; size?: number }): Promise<PageResponse<OrderDto>> => {
    return apiClient.get<PageResponse<OrderDto>>("/api/v1/admin/orders", { params: params as any });
  },

  updateOrderStatus: async (id: string, status: string): Promise<OrderDto> => {
    return apiClient.patch<OrderDto>(`/api/v1/admin/orders/${id}/status?status=${status}`);
  },
};
