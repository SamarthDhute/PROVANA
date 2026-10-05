import { apiClient } from "./apiClient";
import { User, AuthResponse } from "@/types/auth";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<any>("/api/v1/auth/login", payload);
    const token = res.accessToken || res.token;
    return {
      token,
      tokenType: res.tokenType || "Bearer",
      user: res.user,
    };
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<any>("/api/v1/auth/register", payload);
    const token = res.accessToken || res.token;
    return {
      token,
      tokenType: res.tokenType || "Bearer",
      user: res.user,
    };
  },

  getMe: async (): Promise<User> => {
    return apiClient.get<User>("/api/v1/auth/me");
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/api/v1/auth/logout");
    } catch {
      // Best-effort server notification
    }
  },
};
