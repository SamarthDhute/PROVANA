"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, UserRole, AuthResponse, ROLE_PRESETS } from "@/types/auth";
import { authApi } from "@/lib/api/authApi";
import { Permission, can as checkCan, hasAnyPermission } from "@/lib/permissions";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  selectedRoleForModal: UserRole;
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
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
        authApi
          .getMe()
          .then((currentUser) => {
            if (currentUser) {
              setUser(currentUser);
              localStorage.setItem("provana_user", JSON.stringify(currentUser));
            }
          })
          .catch((err) => {
            console.warn("Session expired or invalid, resetting auth state:", err);
            setUser(null);
            setToken(null);
            try {
              localStorage.removeItem("provana_auth_token");
              localStorage.removeItem("provana_user");
            } catch {}
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
      const authData = await authApi.login({ email: email.trim(), password });
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
        message: err.message || "Invalid email or password",
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
      const authData = await authApi.register({
        email: payload.email.trim(),
        password: payload.password,
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        phone: payload.phone?.trim() || "",
        role: payload.role || "CUSTOMER",
      });

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
      authApi.logout().catch(() => {});
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("provana_auth_token");
      localStorage.removeItem("provana_user");
    }
  };

  const can = useCallback(
    (permission: Permission) => {
      return checkCan(user?.role, permission);
    },
    [user?.role]
  );

  const canAny = useCallback(
    (permissions: Permission[]) => {
      return hasAnyPermission(user?.role, permissions);
    },
    [user?.role]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        isAuthModalOpen,
        selectedRoleForModal,
        can,
        canAny,
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
