"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { ROLE_PRESETS, UserRole } from "@/types/auth";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    selectedRoleForModal,
    quickLogin,
    login,
    register,
    user,
    isAuthenticated,
    logout,
  } = useAuth();
  const { showToast } = useStore();

  const [activeTab, setActiveTab] = useState<"roles" | "custom_login" | "register">("roles");
  const [activeRole, setActiveRole] = useState<UserRole>(selectedRoleForModal);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Register form state
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regRole, setRegRole] = useState<UserRole>("CUSTOMER");

  useEffect(() => {
    if (selectedRoleForModal) {
      setActiveRole(selectedRoleForModal);
    }
  }, [selectedRoleForModal]);

  if (!isAuthModalOpen) return null;

  const currentPreset = ROLE_PRESETS.find((p) => p.role === activeRole) || ROLE_PRESETS[0];

  const handleRoleQuickLogin = async (role: UserRole) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await quickLogin(role);
      if (res.success) {
        showToast(`⚡ Logged in as ${role}!`);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await login(email, password);
      if (res.success) {
        showToast(res.message);
        closeAuthModal();
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regPassword || !regFirstName || !regLastName) {
      setErrorMessage("Please fill all required fields.");
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await register({
        email: regEmail,
        password: regPassword,
        firstName: regFirstName,
        lastName: regLastName,
        phone: regPhone,
        role: regRole,
      });
      if (res.success) {
        showToast(res.message);
        closeAuthModal();
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        zIndex: 100000,
        animation: "fadeIn 0.2s ease",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "680px",
          maxHeight: "92vh",
          overflowY: "auto",
          backgroundColor: "#12151D",
          border: "1.5px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "16px",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.95)",
          color: "#FFFFFF",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 28px 16px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "20px" }}>🛡️</span>
              <span
                className="font-display"
                style={{ fontSize: "22px", letterSpacing: "1.5px", color: "var(--color-accent)" }}
              >
                PROVANA ACCESS &amp; RBAC PORTAL
              </span>
            </div>
            <p style={{ fontSize: "12.5px", color: "#94A3B8", margin: 0 }}>
              Phase 1: Granular Role-Based Access Control &amp; JWT Authentication
            </p>
          </div>

          <button
            onClick={closeAuthModal}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              border: "none",
              color: "#CBD5E1",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Current User Session Bar (if already authenticated) */}
        {isAuthenticated && user && (
          <div
            style={{
              margin: "16px 28px 0",
              padding: "12px 16px",
              backgroundColor: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>✅</span>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#FFF" }}>
                  Active Session: {user.firstName} {user.lastName} ({user.email})
                </div>
                <div style={{ fontSize: "11px", color: "#10B981", fontWeight: "800" }}>
                  ROLE: {user.role}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                showToast("Signed out successfully");
              }}
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#EF4444",
                backgroundColor: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "16px 28px 0",
          }}
        >
          <button
            onClick={() => {
              setActiveTab("roles");
              setErrorMessage(null);
            }}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "800",
              cursor: "pointer",
              transition: "all 0.2s ease",
              backgroundColor: activeTab === "roles" ? "var(--color-accent)" : "rgba(255, 255, 255, 0.05)",
              color: activeTab === "roles" ? "#0B0C0E" : "#94A3B8",
              border: activeTab === "roles" ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            ⚡ 1-Click Role Login
          </button>
          <button
            onClick={() => {
              setActiveTab("custom_login");
              setErrorMessage(null);
            }}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "800",
              cursor: "pointer",
              transition: "all 0.2s ease",
              backgroundColor: activeTab === "custom_login" ? "var(--color-accent)" : "rgba(255, 255, 255, 0.05)",
              color: activeTab === "custom_login" ? "#0B0C0E" : "#94A3B8",
              border: activeTab === "custom_login" ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            🔑 Manual Login
          </button>
          <button
            onClick={() => {
              setActiveTab("register");
              setErrorMessage(null);
            }}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "800",
              cursor: "pointer",
              transition: "all 0.2s ease",
              backgroundColor: activeTab === "register" ? "var(--color-accent)" : "rgba(255, 255, 255, 0.05)",
              color: activeTab === "register" ? "#0B0C0E" : "#94A3B8",
              border: activeTab === "register" ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            📝 Register Athlete
          </button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div
            style={{
              margin: "14px 28px 0",
              padding: "10px 14px",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "6px",
              color: "#FCA5A5",
              fontSize: "12.5px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div style={{ padding: "20px 28px 28px" }}>
          {/* ============================================================== */}
          {/* TAB 1: 1-CLICK ROLE LOGIN                                      */}
          {/* ============================================================== */}
          {activeTab === "roles" && (
            <div>
              <p style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "16px" }}>
                Select any verified role below to log in immediately with pre-configured BCrypt credentials and explore that role&apos;s permissions:
              </p>

              {/* 4 Role Selector Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                {ROLE_PRESETS.map((preset) => {
                  const isSelected = activeRole === preset.role;
                  return (
                    <div
                      key={preset.role}
                      onClick={() => setActiveRole(preset.role)}
                      style={{
                        padding: "14px",
                        borderRadius: "10px",
                        backgroundColor: isSelected ? "rgba(245, 158, 11, 0.12)" : "#181C26",
                        border: `1.5px solid ${isSelected ? "var(--color-accent)" : "rgba(255, 255, 255, 0.08)"}`,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "20px" }}>{preset.icon}</span>
                          <strong style={{ fontSize: "14px", color: "#FFF" }}>{preset.title}</strong>
                        </div>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "800",
                            color: preset.color,
                            backgroundColor: `${preset.color}22`,
                            padding: "2px 6px",
                            borderRadius: "4px",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {preset.badge}
                        </span>
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#94A3B8", fontFamily: "monospace" }}>
                        {preset.email}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Role Deep-Dive Box */}
              <div
                style={{
                  backgroundColor: "#0D1016",
                  border: `1px solid ${currentPreset.color}44`,
                  borderRadius: "10px",
                  padding: "18px",
                  marginBottom: "20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "22px" }}>{currentPreset.icon}</span>
                    <strong style={{ fontSize: "15px", color: "#FFF" }}>
                      Role: {currentPreset.title} ({currentPreset.role})
                    </strong>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      color: currentPreset.color,
                      fontWeight: "800",
                      backgroundColor: `${currentPreset.color}20`,
                      padding: "4px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    PASS: {currentPreset.password}
                  </span>
                </div>

                <p style={{ fontSize: "12.5px", color: "#CBD5E1", marginBottom: "14px", lineHeight: "1.5" }}>
                  {currentPreset.description}
                </p>

                {/* Permissions Pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", alignSelf: "center" }}>
                    PERMISSIONS:
                  </span>
                  {currentPreset.permissions.map((perm) => (
                    <span
                      key={perm}
                      style={{
                        fontSize: "10.5px",
                        fontFamily: "monospace",
                        color: "#E2E8F0",
                        backgroundColor: "#1E293B",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Login Action Button */}
              <button
                disabled={loading}
                onClick={() => handleRoleQuickLogin(activeRole)}
                style={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-accent)",
                  color: "#0B0C0E",
                  fontWeight: "800",
                  fontSize: "14px",
                  cursor: loading ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  transition: "opacity 0.2s ease",
                  opacity: loading ? 0.7 : 1,
                  boxShadow: "0 4px 14px rgba(245, 158, 11, 0.3)",
                }}
              >
                {loading ? "AUTHENTICATING & ISSUING JWT..." : `LOGIN AS ${currentPreset.title.toUpperCase()} ⚡`}
              </button>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: MANUAL CUSTOM LOGIN                                     */}
          {/* ============================================================== */}
          {activeTab === "custom_login" && (
            <form onSubmit={handleCustomLogin}>
              <p style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "16px" }}>
                Authenticate with custom account credentials via Spring Boot JWT backend:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#CBD5E1", marginBottom: "6px" }}>
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@provana.com"
                    required
                    style={{
                      width: "100%",
                      height: "44px",
                      padding: "0 14px",
                      borderRadius: "6px",
                      backgroundColor: "#0D1016",
                      border: "1px solid #2B3342",
                      color: "#FFF",
                      fontSize: "13.5px",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#CBD5E1", marginBottom: "6px" }}>
                    PASSWORD
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    style={{
                      width: "100%",
                      height: "44px",
                      padding: "0 14px",
                      borderRadius: "6px",
                      backgroundColor: "#0D1016",
                      border: "1px solid #2B3342",
                      color: "#FFF",
                      fontSize: "13.5px",
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  height: "46px",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-accent)",
                  color: "#0B0C0E",
                  fontWeight: "800",
                  fontSize: "14px",
                  cursor: loading ? "wait" : "pointer",
                }}
              >
                {loading ? "VERIFYING CREDENTIALS..." : "SIGN IN 🔒"}
              </button>
            </form>
          )}

          {/* ============================================================== */}
          {/* TAB 3: REGISTER NEW USER                                       */}
          {/* ============================================================== */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister}>
              <p style={{ fontSize: "13px", color: "#94A3B8", marginBottom: "16px" }}>
                Create a new user account with BCrypt password hashing and custom role assignment:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                      FIRST NAME *
                    </label>
                    <input
                      type="text"
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      placeholder="e.g. Rahul"
                      required
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "0 12px",
                        borderRadius: "6px",
                        backgroundColor: "#0D1016",
                        border: "1px solid #2B3342",
                        color: "#FFF",
                        fontSize: "13px",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                      LAST NAME *
                    </label>
                    <input
                      type="text"
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      placeholder="e.g. Sharma"
                      required
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "0 12px",
                        borderRadius: "6px",
                        backgroundColor: "#0D1016",
                        border: "1px solid #2B3342",
                        color: "#FFF",
                        fontSize: "13px",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                    EMAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="athlete@example.com"
                    required
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "0 12px",
                      borderRadius: "6px",
                      backgroundColor: "#0D1016",
                      border: "1px solid #2B3342",
                      color: "#FFF",
                      fontSize: "13px",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                      PASSWORD (MIN 8 CHARS) *
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      required
                      minLength={8}
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "0 12px",
                        borderRadius: "6px",
                        backgroundColor: "#0D1016",
                        border: "1px solid #2B3342",
                        color: "#FFF",
                        fontSize: "13px",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                      ROLE ASSIGNMENT
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "0 10px",
                        borderRadius: "6px",
                        backgroundColor: "#0D1016",
                        border: "1px solid #2B3342",
                        color: "#FFF",
                        fontSize: "13px",
                      }}
                    >
                      <option value="CUSTOMER">CUSTOMER (Default)</option>
                      <option value="PRODUCT_MANAGER">PRODUCT_MANAGER</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                    PHONE NUMBER (OPTIONAL)
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "0 12px",
                      borderRadius: "6px",
                      backgroundColor: "#0D1016",
                      border: "1px solid #2B3342",
                      color: "#FFF",
                      fontSize: "13px",
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  height: "46px",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-accent)",
                  color: "#0B0C0E",
                  fontWeight: "800",
                  fontSize: "14px",
                  cursor: loading ? "wait" : "pointer",
                }}
              >
                {loading ? "CREATING ACCOUNT..." : "REGISTER NEW ACCOUNT 📝"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
