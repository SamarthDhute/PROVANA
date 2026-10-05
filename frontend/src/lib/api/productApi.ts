import { apiClient } from "./apiClient";
import { PageResponse } from "./types";

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  goalTag: string;
  badge: string;
  highlight: string;
  minimalDesc: string;
  status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED";
  startingPrice: number;
  compareAtPrice: number;
  primaryImageUrl: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  attributes: Record<string, string>;
  sortOrder: number;
  active: boolean;
  skus: ProductSku[];
}

export interface ProductSku {
  id: string;
  variantId: string;
  skuCode: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  available: boolean;
  active: boolean;
}

export interface ProductMedia {
  id: string;
  mediaType: "IMAGE" | "VIDEO";
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
  variantId?: string;
}

export interface ProductNutrition {
  id: string;
  servingSize: string;
  servingsPerContainer: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
  metricsJson?: string;
}

export interface ProductFaq {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  active: boolean;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  brand: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string };
  subcategory: { id: string; name: string; slug: string };
  goalTag: string;
  badge: string;
  highlight: string;
  description?: string;
  minimalDesc?: string;
  benefits?: string;
  usageInstructions?: string;
  ingredients?: string;
  allergens?: string;
  status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED";
  metaTitle?: string;
  metaDescription?: string;
  variants: ProductVariant[];
  media: ProductMedia[];
  nutrition?: ProductNutrition;
  faqs: ProductFaq[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilterParams {
  category?: string;
  subcategory?: string;
  brand?: string;
  goal?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export const productApi = {
  listProducts: async (params?: ProductFilterParams): Promise<PageResponse<ProductSummary>> => {
    return apiClient.get<PageResponse<ProductSummary>>("/api/v1/products", { params: params as any });
  },

  getProductBySlug: async (slug: string): Promise<ProductDetail> => {
    return apiClient.get<ProductDetail>(`/api/v1/products/${slug}`);
  },

  getProductVariants: async (slug: string): Promise<ProductVariant[]> => {
    return apiClient.get<ProductVariant[]>(`/api/v1/products/${slug}/variants`);
  },

  getProductMedia: async (slug: string): Promise<ProductMedia[]> => {
    return apiClient.get<ProductMedia[]>(`/api/v1/products/${slug}/media`);
  },

  getProductNutrition: async (slug: string): Promise<ProductNutrition> => {
    return apiClient.get<ProductNutrition>(`/api/v1/products/${slug}/nutrition`);
  },

  getProductFaqs: async (slug: string): Promise<ProductFaq[]> => {
    return apiClient.get<ProductFaq[]>(`/api/v1/products/${slug}/faqs`);
  },
};

import { Product } from "@/types";

export function mapBackendProductSummaryToProduct(summary: ProductSummary): Product {
  const discountPercent =
    summary.compareAtPrice && summary.compareAtPrice > summary.startingPrice
      ? Math.round(((summary.compareAtPrice - summary.startingPrice) / summary.compareAtPrice) * 100)
      : 0;

  return {
    id: summary.id,
    slug: summary.slug,
    name: summary.name,
    category: summary.categoryName || "General",
    goal: summary.goalTag || "Build Lean Muscle",
    badge: summary.badge || "",
    highlight: summary.highlight || "",
    price: summary.startingPrice || 0,
    mrp: summary.compareAtPrice || summary.startingPrice || 0,
    discount: discountPercent > 0 ? `${discountPercent}% OFF` : "",
    rating: summary.rating || 4.8,
    reviewCount: summary.reviewCount || 100,
    img: summary.primaryImageUrl || "/assets/product-catalog/whey_isolated.png",
    minimalDesc: summary.minimalDesc || "",
    flavors: ["Standard"],
    sizes: ["Standard"],
    nutritionFacts: {
      servingSize: "1 Scoop",
      servingsPerContainer: 30,
      calories: 120,
      protein: "24g",
      carbs: "2g",
      fat: "1g",
    },
    claims: [],
    nutrition: [],
    ingredients: "",
    allergens: "",
    howToUse: "",
    inStock: true,
  };
}

export function mapBackendProductDetailToProduct(detail: ProductDetail): Product {
  const flavors = detail.variants
    ?.map((v) => v.name)
    .filter(Boolean) || ["Standard"];

  const sizes = detail.variants
    ?.flatMap((v) => v.skus?.map((s) => s.skuCode))
    .filter(Boolean) || ["Standard"];

  const startingPrice = detail.variants?.[0]?.skus?.[0]?.price || 0;
  const compareAtPrice = detail.variants?.[0]?.skus?.[0]?.compareAtPrice || startingPrice;
  const discountPercent =
    compareAtPrice > startingPrice
      ? Math.round(((compareAtPrice - startingPrice) / compareAtPrice) * 100)
      : 0;

  const primaryImage =
    detail.media?.find((m) => m.isPrimary)?.url ||
    detail.media?.[0]?.url ||
    "/assets/product-catalog/whey_isolated.png";

  let metricsParsed: { metric: string; value: string }[] = [];
  if (detail.nutrition?.metricsJson) {
    try {
      metricsParsed = JSON.parse(detail.nutrition.metricsJson);
    } catch {
      metricsParsed = [];
    }
  }

  return {
    id: detail.id,
    slug: detail.slug,
    name: detail.name,
    category: detail.category?.name || "General",
    goal: detail.goalTag || "Build Lean Muscle",
    badge: detail.badge || "",
    highlight: detail.highlight || "",
    price: startingPrice,
    mrp: compareAtPrice,
    discount: discountPercent > 0 ? `${discountPercent}% OFF` : "",
    rating: 4.9,
    reviewCount: 128,
    img: primaryImage,
    minimalDesc: detail.minimalDesc || detail.description || "",
    flavors: flavors.length > 0 ? flavors : ["Standard"],
    sizes: sizes.length > 0 ? sizes : ["Standard"],
    nutritionFacts: {
      servingSize: detail.nutrition?.servingSize || "1 Scoop",
      servingsPerContainer: detail.nutrition?.servingsPerContainer || 30,
      calories: detail.nutrition?.calories || 120,
      protein: `${detail.nutrition?.proteinG || 0}g`,
      carbs: `${detail.nutrition?.carbsG || 0}g`,
      fat: `${detail.nutrition?.fatG || 0}g`,
    },
    claims: detail.benefits
      ? detail.benefits.split(";").map((s) => s.trim()).filter(Boolean)
      : [],
    nutrition: metricsParsed.length > 0 ? metricsParsed : [
      { metric: "Protein per scoop", value: `${detail.nutrition?.proteinG || 0} g` },
      { metric: "Carbohydrates", value: `${detail.nutrition?.carbsG || 0} g` },
      { metric: "Fat", value: `${detail.nutrition?.fatG || 0} g` },
    ],
    ingredients: detail.ingredients || "",
    allergens: detail.allergens || "",
    howToUse: detail.usageInstructions || "",
    inStock: true,
  };
}
