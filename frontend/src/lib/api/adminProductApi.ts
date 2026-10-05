import { apiClient } from "./apiClient";
import { PageResponse } from "./types";
import {
  ProductSummary,
  ProductDetail,
  ProductVariant,
  ProductSku,
  ProductMedia,
  ProductNutrition,
  ProductFaq,
} from "./productApi";

export interface CreateProductRequest {
  name: string;
  slug: string;
  brandId: string;
  categoryId: string;
  subcategoryId?: string;
  goalTag?: string;
  badge?: string;
  highlight?: string;
  minimalDesc?: string;
  description?: string;
  benefits?: string;
  usageInstructions?: string;
  ingredients?: string;
  allergens?: string;
  status?: "DRAFT" | "PUBLISHED" | "UNPUBLISHED";
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateProductRequest {
  name: string;
  slug?: string;
  brandId?: string;
  categoryId?: string;
  subcategoryId?: string;
  goalTag?: string;
  badge?: string;
  highlight?: string;
  minimalDesc?: string;
  description?: string;
  benefits?: string;
  usageInstructions?: string;
  ingredients?: string;
  allergens?: string;
  status?: "DRAFT" | "PUBLISHED" | "UNPUBLISHED";
  metaTitle?: string;
  metaDescription?: string;
}

export interface VariantRequest {
  productId?: string;
  name: string;
  flavor?: string;
  size?: string;
  attributesJson?: string;
  active?: boolean;
  sortOrder?: number;
}

export interface SkuRequest {
  variantId: string;
  skuCode: string;
  price: number;
  compareAtPrice?: number;
  currency?: string;
  available?: boolean;
  active?: boolean;
}

export interface ProductMediaRequest {
  productId?: string;
  variantId?: string;
  mediaType: "IMAGE" | "VIDEO";
  url: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
  active?: boolean;
}

export interface NutritionRequest {
  servingSize?: string;
  servingsPerContainer?: number;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
  metricsJson?: string;
}

export interface ProductFaqRequest {
  productId?: string;
  question: string;
  answer: string;
  sortOrder?: number;
  active?: boolean;
}

export interface AdminProductFilterParams {
  status?: "DRAFT" | "PUBLISHED" | "UNPUBLISHED";
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const adminProductApi = {
  // Product Lifecycle
  listAdminProducts: async (
    params?: AdminProductFilterParams
  ): Promise<PageResponse<ProductSummary>> => {
    return apiClient.get<PageResponse<ProductSummary>>("/api/v1/admin/products", {
      params: params as any,
    });
  },

  getAdminProductById: async (id: string): Promise<ProductDetail> => {
    return apiClient.get<ProductDetail>(`/api/v1/admin/products/${id}`);
  },

  createProduct: async (data: CreateProductRequest): Promise<ProductDetail> => {
    return apiClient.post<ProductDetail>("/api/v1/admin/products", data);
  },

  updateProduct: async (
    id: string,
    data: UpdateProductRequest
  ): Promise<ProductDetail> => {
    return apiClient.put<ProductDetail>(`/api/v1/admin/products/${id}`, data);
  },

  updateProductStatus: async (
    id: string,
    status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED"
  ): Promise<ProductDetail> => {
    return apiClient.patch<ProductDetail>(
      `/api/v1/admin/products/${id}/status`,
      undefined,
      { params: { status } }
    );
  },

  deleteProduct: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/api/v1/admin/products/${id}`);
  },

  // Variant Management
  addVariant: async (
    productId: string,
    data: VariantRequest
  ): Promise<ProductVariant> => {
    return apiClient.post<ProductVariant>(
      `/api/v1/admin/products/${productId}/variants`,
      { ...data, productId }
    );
  },

  updateVariant: async (
    variantId: string,
    data: VariantRequest
  ): Promise<ProductVariant> => {
    return apiClient.put<ProductVariant>(
      `/api/v1/admin/products/variants/${variantId}`,
      data
    );
  },

  deleteVariant: async (variantId: string): Promise<void> => {
    return apiClient.delete<void>(
      `/api/v1/admin/products/variants/${variantId}`
    );
  },

  // SKU Management
  createSku: async (data: SkuRequest): Promise<ProductSku> => {
    return apiClient.post<ProductSku>("/api/v1/admin/products/skus", data);
  },

  updateSku: async (skuId: string, data: SkuRequest): Promise<ProductSku> => {
    return apiClient.put<ProductSku>(
      `/api/v1/admin/products/skus/${skuId}`,
      data
    );
  },

  deleteSku: async (skuId: string): Promise<void> => {
    return apiClient.delete<void>(`/api/v1/admin/products/skus/${skuId}`);
  },

  // Media Management
  addMedia: async (
    productId: string,
    data: ProductMediaRequest
  ): Promise<ProductMedia> => {
    return apiClient.post<ProductMedia>(
      `/api/v1/admin/products/${productId}/media`,
      { ...data, productId }
    );
  },

  deleteMedia: async (mediaId: string): Promise<void> => {
    return apiClient.delete<void>(`/api/v1/admin/products/media/${mediaId}`);
  },

  // Nutrition Management
  saveNutrition: async (
    productId: string,
    data: NutritionRequest
  ): Promise<ProductNutrition> => {
    return apiClient.put<ProductNutrition>(
      `/api/v1/admin/products/${productId}/nutrition`,
      data
    );
  },

  // FAQ Management
  addFaq: async (
    productId: string,
    data: ProductFaqRequest
  ): Promise<ProductFaq> => {
    return apiClient.post<ProductFaq>(
      `/api/v1/admin/products/${productId}/faqs`,
      { ...data, productId }
    );
  },

  deleteFaq: async (faqId: string): Promise<void> => {
    return apiClient.delete<void>(`/api/v1/admin/products/faqs/${faqId}`);
  },
};
