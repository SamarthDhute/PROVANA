import { apiClient } from "./apiClient";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  active: boolean;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  active: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  active: boolean;
}

export const categoryApi = {
  listCategories: async (): Promise<Category[]> => {
    return apiClient.get<Category[]>("/api/v1/categories");
  },

  getCategoryBySlug: async (slug: string): Promise<Category> => {
    return apiClient.get<Category>(`/api/v1/categories/${slug}`);
  },

  listSubcategories: async (): Promise<Subcategory[]> => {
    return apiClient.get<Subcategory[]>("/api/v1/subcategories");
  },

  getSubcategoryBySlug: async (slug: string): Promise<Subcategory> => {
    return apiClient.get<Subcategory>(`/api/v1/subcategories/${slug}`);
  },

  listBrands: async (): Promise<Brand[]> => {
    return apiClient.get<Brand[]>("/api/v1/brands");
  },

  getBrandBySlug: async (slug: string): Promise<Brand> => {
    return apiClient.get<Brand>(`/api/v1/brands/${slug}`);
  },
};
