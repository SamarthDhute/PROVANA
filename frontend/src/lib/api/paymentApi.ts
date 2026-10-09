import { apiClient } from "./apiClient";
import { PageResponse } from "./types";

export interface InitiateRazorpayOrderRequest {
  orderId?: string;
  orderData?: {
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
  };
  idempotencyKey?: string;
}

export interface RazorpayOrderResponse {
  keyId: string;
  razorpayOrderId: string;
  amountMinorUnits: number;
  amount: number;
  currency: string;
  name: string;
  description: string;
  localOrderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
}

export interface VerifyRazorpayPaymentRequest {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentVerificationResponse {
  verified: boolean;
  message: string;
  paymentId: string;
  orderId: string;
  orderNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  capturedAt?: string;
}

export interface PaymentDetail {
  id: string;
  orderId: string;
  orderNumber: string;
  gateway: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  amountMinorUnits: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  failureCode?: string;
  failureDescription?: string;
  idempotencyKey?: string;
  capturedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const paymentApi = {
  initiateRazorpayOrder: async (payload: InitiateRazorpayOrderRequest): Promise<RazorpayOrderResponse> => {
    return apiClient.post<RazorpayOrderResponse>("/api/v1/payments/razorpay/order", payload);
  },

  verifyRazorpayPayment: async (payload: VerifyRazorpayPaymentRequest): Promise<PaymentVerificationResponse> => {
    return apiClient.post<PaymentVerificationResponse>("/api/v1/payments/razorpay/verify", payload);
  },

  listAdminPayments: async (params?: { status?: string; page?: number; size?: number }): Promise<PageResponse<PaymentDetail>> => {
    return apiClient.get<PageResponse<PaymentDetail>>("/api/v1/admin/payments", { params: params as any });
  },

  getPaymentById: async (id: string): Promise<PaymentDetail> => {
    return apiClient.get<PaymentDetail>(`/api/v1/admin/payments/${id}`);
  },
};
