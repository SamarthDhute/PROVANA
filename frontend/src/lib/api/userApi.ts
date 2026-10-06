import { apiClient } from "./apiClient";
import { UserRole } from "@/types/auth";

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  active: boolean;
  createdAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const adminUserApi = {
  listUsers: async (page = 0, size = 50): Promise<PageResponse<UserResponse>> => {
    return apiClient.get<PageResponse<UserResponse>>(`/api/v1/admin/users?page=${page}&size=${size}`);
  },

  updateUserRole: async (userId: string, role: UserRole): Promise<UserResponse> => {
    return apiClient.put<UserResponse>(`/api/v1/admin/users/${userId}/role`, { role });
  },

  deactivateUser: async (userId: string): Promise<void> => {
    return apiClient.delete<void>(`/api/v1/admin/users/${userId}`);
  },
};
