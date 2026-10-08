import { apiRequest } from "./apiClient";
import { PageResponse } from "./types";

export interface InventoryItem {
  id: string;
  skuId: string;
  skuCode: string;
  productName: string;
  variantName: string;
  availableQuantity: number;
  reservedQuantity: number;
  sellableQuantity: number;
  soldQuantity: number;
  lowStockThreshold: number;
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "DISCONTINUED";
  isLowStock: boolean;
  isOutOfStock: boolean;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  skuId: string;
  skuCode: string;
  movementType: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  referenceType?: string;
  referenceId?: string;
  performedBy: string;
  createdAt: string;
}

export interface InventoryAdjustmentPayload {
  adjustmentQuantity: number;
  movementType?: string;
  reason: string;
  referenceType?: string;
  referenceId?: string;
}

export const inventoryApi = {
  getInventoryList: (params?: { lowStockOnly?: boolean; page?: number; size?: number }) =>
    apiRequest<PageResponse<InventoryItem>>("/api/v1/admin/inventory", { params }),

  getLowStockItems: (params?: { page?: number; size?: number }) =>
    apiRequest<PageResponse<InventoryItem>>("/api/v1/admin/inventory/low-stock", { params }),

  getInventoryBySkuId: (skuId: string) =>
    apiRequest<InventoryItem>(`/api/v1/admin/inventory/${skuId}`),

  adjustStock: (skuId: string, payload: InventoryAdjustmentPayload) =>
    apiRequest<InventoryItem>(`/api/v1/admin/inventory/${skuId}/adjust`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMovementHistory: (skuId: string, params?: { page?: number; size?: number }) =>
    apiRequest<PageResponse<InventoryMovement>>(`/api/v1/admin/inventory/${skuId}/movements`, { params }),
};
