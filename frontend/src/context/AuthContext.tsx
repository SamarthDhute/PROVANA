"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, UserRole, AuthResponse, ROLE_PRESETS } from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  selectedRoleForModal: UserRole;
  openAuthModal: (role?: UserRole) => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: UserRole;
  }) => Promise<{ success: boolean; message: string }>;
  quickLogin: (role: UserRole) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedRoleForModal, setSelectedRoleForModal] = useState<UserRole>("ADMIN");

  // Hydrate user and token on initial client mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("provana_auth_token");
      const storedUser = localStorage.getItem("provana_user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        // Background check token validity with backend /api/v1/auth/me
        fetch(`${API_BASE_URL}/api/v1/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        })
          .then((res) => {
            if (res.ok) {
              return res.json();
            } else {
              throw new Error("Token expired");
            }
          })
          .then((data) => {
            if (data?.data) {
              setUser(data.data);
              localStorage.setItem("provana_user", JSON.stringify(data.data));
            }
          })
          .catch(() => {
            // Silently retain cached session or clear if expired
          });
      }
    } catch (err) {
      console.warn("Could not restore auth state from localStorage:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openAuthModal = useCallback((role: UserRole = "ADMIN") => {
    setSelectedRoleForModal(role);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data?.message || "Invalid email or password",
        };
      }

      const authData: AuthResponse = data.data;
      setToken(authData.token);
      setUser(authData.user);

      localStorage.setItem("provana_auth_token", authData.token);
      localStorage.setItem("provana_user", JSON.stringify(authData.user));

      return {
        success: true,
        message: `Welcome back, ${authData.user.firstName}! Logged in as ${authData.user.role}.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Failed to connect to authentication server",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: UserRole;
  }): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: payload.email.trim(),
          password: payload.password,
          firstName: payload.firstName.trim(),
          lastName: payload.lastName.trim(),
          phone: payload.phone?.trim() || "",
          role: payload.role || "CUSTOMER",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data?.message || "Registration failed",
        };
      }

      const authData: AuthResponse = data.data;
      setToken(authData.token);
      setUser(authData.user);

      localStorage.setItem("provana_auth_token", authData.token);
      localStorage.setItem("provana_user", JSON.stringify(authData.user));

      return {
        success: true,
        message: `Account created! Welcome, ${authData.user.firstName}!`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Connection error during registration",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (role: UserRole): Promise<{ success: boolean; message: string }> => {
    const preset = ROLE_PRESETS.find((p) => p.role === role);
    if (!preset) {
      return { success: false, message: `Unknown role: ${role}` };
    }
    const result = await login(preset.email, preset.password);
    if (result.success) {
      setIsAuthModalOpen(false);
    }
    return result;
  };

  const logout = () => {
    try {
      if (token) {
        fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {});
      }
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("provana_auth_token");
      localStorage.removeItem("provana_user");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        isAuthModalOpen,
        selectedRoleForModal,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        quickLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
