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

export interface CategoryPayload {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
  active?: boolean;
}

export interface SubcategoryPayload {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
  active?: boolean;
}

export interface BrandPayload {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  active?: boolean;
}

export const categoryApi = {
  // Public Category APIs
  listCategories: async (): Promise<Category[]> => {
    return apiClient.get<Category[]>("/api/v1/categories");
  },

  getCategoryBySlug: async (slug: string): Promise<Category> => {
    return apiClient.get<Category>(`/api/v1/categories/${slug}`);
  },

  // Public Subcategory APIs
  listSubcategories: async (): Promise<Subcategory[]> => {
    return apiClient.get<Subcategory[]>("/api/v1/subcategories");
  },

  getSubcategoryBySlug: async (slug: string): Promise<Subcategory> => {
    return apiClient.get<Subcategory>(`/api/v1/subcategories/${slug}`);
  },

  // Public Brand APIs
  listBrands: async (): Promise<Brand[]> => {
    return apiClient.get<Brand[]>("/api/v1/brands");
  },

  getBrandBySlug: async (slug: string): Promise<Brand> => {
    return apiClient.get<Brand>(`/api/v1/brands/${slug}`);
  },

  // Admin Category APIs
  adminListCategories: async (): Promise<Category[]> => {
    return apiClient.get<Category[]>("/api/v1/admin/categories");
  },

  adminGetCategory: async (id: string): Promise<Category> => {
    return apiClient.get<Category>(`/api/v1/admin/categories/${id}`);
  },

  adminCreateCategory: async (payload: CategoryPayload): Promise<Category> => {
    return apiClient.post<Category>("/api/v1/admin/categories", payload);
  },

  adminUpdateCategory: async (id: string, payload: CategoryPayload): Promise<Category> => {
    return apiClient.put<Category>(`/api/v1/admin/categories/${id}`, payload);
  },

  adminDeleteCategory: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/api/v1/admin/categories/${id}`);
  },

  // Admin Subcategory APIs
  adminListSubcategories: async (): Promise<Subcategory[]> => {
    return apiClient.get<Subcategory[]>("/api/v1/admin/subcategories");
  },

  adminGetSubcategory: async (id: string): Promise<Subcategory> => {
    return apiClient.get<Subcategory>(`/api/v1/admin/subcategories/${id}`);
  },

  adminCreateSubcategory: async (payload: SubcategoryPayload): Promise<Subcategory> => {
    return apiClient.post<Subcategory>("/api/v1/admin/subcategories", payload);
  },

  adminUpdateSubcategory: async (id: string, payload: SubcategoryPayload): Promise<Subcategory> => {
    return apiClient.put<Subcategory>(`/api/v1/admin/subcategories/${id}`, payload);
  },

  adminDeleteSubcategory: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/api/v1/admin/subcategories/${id}`);
  },

  // Admin Brand APIs
  adminListBrands: async (): Promise<Brand[]> => {
    return apiClient.get<Brand[]>("/api/v1/admin/brands");
  },

  adminGetBrand: async (id: string): Promise<Brand> => {
    return apiClient.get<Brand>(`/api/v1/admin/brands/${id}`);
  },

  adminCreateBrand: async (payload: BrandPayload): Promise<Brand> => {
    return apiClient.post<Brand>("/api/v1/admin/brands", payload);
  },

  adminUpdateBrand: async (id: string, payload: BrandPayload): Promise<Brand> => {
    return apiClient.put<Brand>(`/api/v1/admin/brands/${id}`, payload);
  },

  adminDeleteBrand: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/api/v1/admin/brands/${id}`);
  },
};
