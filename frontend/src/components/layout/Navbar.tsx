"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { ROLE_PRESETS } from "@/types/auth";
import { PROVANA_PRODUCTS } from "@/data/products";

const NAV_CATEGORIES = [
  { label: "All Products 🛍️", href: "/products", category: "All", badge: "" },
  { label: "Protein", href: "/products?category=Protein", category: "Protein", badge: "" },
  { label: "Creatine", href: "/products?category=Creatine", category: "Creatine", badge: "" },
  { label: "Pre-Workout", href: "/products?category=Pre-Workout", category: "Pre-Workout", badge: "" },
  { label: "Healthy Foods", href: "/products?category=Healthy%20Foods", category: "Healthy Foods", badge: "" },
  { label: "Gym Gear", href: "/products?category=Gym%20Accessories", category: "Gym Accessories", badge: "" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = pathname === "/products" ? (searchParams.get("category") || "All") : null;

  const { cartCount, wishlist, toggleCart, openModal } = useStore();
  const { user, isAuthenticated, openAuthModal, logout, quickLogin } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<typeof PROVANA_PRODUCTS>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const q = val.trim().toLowerCase();
    if (q.length < 2) {
      setSuggestions([]);
      setIsSearchOpen(false);
      return;
    }
    const matches = PROVANA_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.highlight.toLowerCase().includes(q) ||
        p.flavors.some((f) => f.toLowerCase().includes(q))
    ).slice(0, 5);
    setSuggestions(matches);
    setIsSearchOpen(matches.length > 0);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryNav = (href: string) => {
    setIsMobileMenuOpen(false);
    router.push(href);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backgroundColor: isScrolled ? "rgba(9, 10, 12, 0.78)" : "rgba(9, 10, 12, 0.94)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        transition: "all 0.25s ease",
      }}
    >
      {/* Active Role Strip (visible when authenticated) */}
      {mounted && isAuthenticated && user && (
        <div
          style={{
            backgroundColor:
              user.role === "ADMIN"
                ? "rgba(239, 68, 68, 0.16)"
                : user.role === "PRODUCT_MANAGER"
                ? "rgba(245, 158, 11, 0.16)"
                : user.role === "MANAGER"
                ? "rgba(59, 130, 246, 0.16)"
                : "rgba(16, 185, 129, 0.14)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "5px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "11.5px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>
              {user.role === "ADMIN"
                ? "👑"
                : user.role === "PRODUCT_MANAGER"
                ? "📦"
                : user.role === "MANAGER"
                ? "🏪"
                : "🛒"}
            </span>
            <span style={{ color: "#FFF", fontWeight: "700" }}>
              Active RBAC Role: <strong style={{ color: "var(--color-accent)" }}>{user.role}</strong> ({user.firstName} {user.lastName})
            </span>
            <span style={{ color: "#94A3B8" }}>— Spring Security JWT Authenticated</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {(user.role === "ADMIN" || user.role === "PRODUCT_MANAGER" || user.role === "MANAGER") && (
              <Link
                href="/admin"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "#0B0C0E",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontWeight: "800",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  boxShadow: "0 2px 8px rgba(245, 158, 11, 0.3)",
                }}
              >
                <span>👑</span>
                <span>OPEN ADMIN PORTAL →</span>
              </Link>
            )}
            <button
              onClick={() => openAuthModal()}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#FFF",
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Switch Role ⇄
            </button>
            <button
              onClick={logout}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "#EF4444",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      <div className="site-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "76px" }}>
        {/* Brand Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ position: "relative", width: "38px", height: "38px" }}>
            <Image
              src="/assets/brand-logo.png"
              alt="PROVANA Logo"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <span
            className="font-display"
            style={{
              fontSize: "28px",
              letterSpacing: "1.8px",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              gap: "2px",
            }}
          >
            PROVANA<span style={{ color: "var(--color-accent)", fontSize: "30px" }}>.</span>
          </span>
        </Link>

        {/* Primary Desktop Navigation Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "8px" }} className="header-category-nav">
          <Link
            href="/products"
            style={{
              fontSize: "13px",
              fontWeight: pathname === "/products" && !searchParams.get("category") ? "800" : "600",
              color: pathname === "/products" && !searchParams.get("category") ? "#8FB8D8" : "#A7ABB2",
              padding: "8px 14px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#8FB8D8")}
            onMouseLeave={(e) => {
              if (!(pathname === "/products" && !searchParams.get("category"))) {
                e.currentTarget.style.color = "#A7ABB2";
              }
            }}
          >
            SHOP
          </Link>

          <Link
            href="/products?category=Protein"
            style={{
              fontSize: "13px",
              fontWeight: currentCategory === "Protein" ? "800" : "600",
              color: currentCategory === "Protein" ? "#8FB8D8" : "#A7ABB2",
              padding: "8px 14px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#8FB8D8")}
            onMouseLeave={(e) => {
              if (currentCategory !== "Protein") e.currentTarget.style.color = "#A7ABB2";
            }}
          >
            PROTEIN
          </Link>

          <Link
            href="/products?category=Performance"
            style={{
              fontSize: "13px",
              fontWeight: currentCategory === "Performance" || currentCategory === "Pre-Workout" ? "800" : "600",
              color: currentCategory === "Performance" || currentCategory === "Pre-Workout" ? "#8FB8D8" : "#A7ABB2",
              padding: "8px 14px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#8FB8D8")}
            onMouseLeave={(e) => {
              if (currentCategory !== "Performance" && currentCategory !== "Pre-Workout") e.currentTarget.style.color = "#A7ABB2";
            }}
          >
            PERFORMANCE
          </Link>

          <Link
            href="/#learn"
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#A7ABB2",
              padding: "8px 14px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#8FB8D8")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#A7ABB2")}
          >
            LEARN
          </Link>

          <button
            onClick={() => openModal("stack-builder-modal")}
            style={{
              fontSize: "12px",
              fontWeight: "800",
              color: "#8FB8D8",
              backgroundColor: "rgba(143, 184, 216, 0.12)",
              border: "1px solid rgba(143, 184, 216, 0.35)",
              borderRadius: "4px",
              padding: "6px 12px",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              marginLeft: "6px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(143, 184, 216, 0.22)";
              e.currentTarget.style.borderColor = "#8FB8D8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(143, 184, 216, 0.12)";
              e.currentTarget.style.borderColor = "rgba(143, 184, 216, 0.35)";
            }}
          >
            Stack Builder ⚡
          </button>
        </nav>

        {/* Search, Wishlist, Cart Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* Autocomplete Search Bar */}
          <div ref={searchRef} style={{ position: "relative" }}>
            <form onSubmit={handleSearchSubmit}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(25, 30, 40, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "9999px",
                  padding: "0 14px",
                  height: "38px",
                  width: "220px",
                  transition: "width 0.25s ease, border-color 0.25s ease",
                }}
              >
                <span style={{ color: "#94A3B8", marginRight: "8px", fontSize: "14px" }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search pure nutrition..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) setIsSearchOpen(true);
                  }}
                  style={{
                    border: "none",
                    background: "none",
                    outline: "none",
                    color: "#FFFFFF",
                    fontSize: "12.5px",
                    width: "100%",
                  }}
                />
              </div>
            </form>

            {/* Live Autocomplete Dropdown */}
            {isSearchOpen && suggestions.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "46px",
                  right: 0,
                  width: "320px",
                  backgroundColor: "#141720",
                  border: "1px solid rgba(148, 163, 184, 0.3)",
                  borderRadius: "var(--radius-card)",
                  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.8)",
                  padding: "8px",
                  zIndex: 2000,
                  animation: "fadeIn 0.2s ease",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", padding: "6px 10px" }}>
                  Product Suggestions
                </div>
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                      router.push(`/products/${item.slug}`);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "background-color 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1C2331")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <div style={{ position: "relative", width: "36px", height: "36px", flexShrink: 0, backgroundColor: "#0F131A", borderRadius: "4px" }}>
                      <Image src={item.img} alt={item.name} fill style={{ objectFit: "contain", padding: "2px" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "12.5px", fontWeight: "700", color: "#FFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "var(--color-accent)", fontWeight: "600" }}>
                        ₹{item.price.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={() => router.push("/products?wishlist=true")}
            title="Wishlist"
            style={{
              position: "relative",
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              backgroundColor: "rgba(25, 30, 40, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#CBD5E1",
              fontSize: "16px",
              cursor: "pointer",
              transition: "border-color 0.2s ease, color 0.2s ease",
            }}
          >
            ♡
            {mounted && wishlist.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  backgroundColor: "#EF4444",
                  color: "#FFFFFF",
                  fontSize: "10px",
                  fontWeight: "800",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Role & Auth Portal Trigger */}
          <div ref={userMenuRef} style={{ position: "relative" }}>
            {!mounted || !isAuthenticated ? (
              <button
                onClick={() => openAuthModal("ADMIN")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  height: "38px",
                  padding: "0 14px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(245, 158, 11, 0.12)",
                  border: "1.5px solid rgba(245, 158, 11, 0.45)",
                  color: "#FBBF24",
                  fontSize: "12.5px",
                  fontWeight: "800",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(245, 158, 11, 0.22)";
                  e.currentTarget.style.borderColor = "#FBBF24";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(245, 158, 11, 0.12)";
                  e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.45)";
                }}
              >
                <span style={{ fontSize: "14px" }}>🛡️</span>
                <span>ROLES / LOGIN</span>
              </button>
            ) : (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  height: "38px",
                  padding: "0 12px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#FFF",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                <span>
                  {user?.role === "ADMIN"
                    ? "👑"
                    : user?.role === "PRODUCT_MANAGER"
                    ? "📦"
                    : user?.role === "MANAGER"
                    ? "🏪"
                    : "🛒"}
                </span>
                <span
                  style={{
                    maxWidth: "85px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.firstName}
                </span>
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: "800",
                    backgroundColor:
                      user?.role === "ADMIN"
                        ? "#EF4444"
                        : user?.role === "PRODUCT_MANAGER"
                        ? "#F59E0B"
                        : user?.role === "MANAGER"
                        ? "#3B82F6"
                        : "#10B981",
                    color: "#FFF",
                    padding: "2px 5px",
                    borderRadius: "4px",
                  }}
                >
                  {user?.role === "PRODUCT_MANAGER" ? "PM" : user?.role}
                </span>
                <span style={{ fontSize: "10px", color: "#94A3B8" }}>▼</span>
              </button>
            )}

            {/* Dropdown Menu */}
            {mounted && isUserMenuOpen && isAuthenticated && user && (
              <div
                style={{
                  position: "absolute",
                  top: "46px",
                  right: 0,
                  width: "280px",
                  backgroundColor: "#141720",
                  border: "1.5px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "12px",
                  padding: "16px",
                  boxShadow: "0 16px 36px rgba(0, 0, 0, 0.9)",
                  zIndex: 1001,
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: "#FFF" }}>
                    {user.firstName} {user.lastName}
                  </div>
                  <div style={{ fontSize: "12px", color: "#94A3B8", fontFamily: "monospace" }}>
                    {user.email}
                  </div>
                  <div style={{ marginTop: "6px" }}>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "800",
                        color: "#10B981",
                        backgroundColor: "rgba(16, 185, 129, 0.15)",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      ROLE: {user.role}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748B", marginBottom: "8px" }}>
                    QUICK SWITCH ROLE:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                    {ROLE_PRESETS.map((p) => (
                      <button
                        key={p.role}
                        onClick={() => {
                          quickLogin(p.role);
                          setIsUserMenuOpen(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "6px 8px",
                          borderRadius: "6px",
                          backgroundColor: user.role === p.role ? "rgba(245, 158, 11, 0.2)" : "#1E2430",
                          border: `1px solid ${user.role === p.role ? "var(--color-accent)" : "rgba(255, 255, 255, 0.08)"}`,
                          color: "#FFF",
                          fontSize: "10.5px",
                          fontWeight: "700",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <span>{p.icon}</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "10px" }}>
                  {(user.role === "ADMIN" || user.role === "PRODUCT_MANAGER" || user.role === "MANAGER") && (
                    <Link
                      href="/admin"
                      onClick={() => setIsUserMenuOpen(false)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        backgroundColor: "rgba(245, 158, 11, 0.15)",
                        border: "1px solid rgba(245, 158, 11, 0.35)",
                        color: "#FBBF24",
                        fontSize: "12px",
                        fontWeight: "800",
                        textAlign: "center",
                        textDecoration: "none",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      👑 Open Catalogue Admin Portal →
                    </Link>
                  )}
                  <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      openAuthModal();
                    }}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      color: "#CBD5E1",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    All Roles 🛡️
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(239, 68, 68, 0.15)",
                      color: "#EF4444",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

          {/* Cart Trigger Button */}
          <button
            onClick={() => toggleCart(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "var(--color-accent)",
              color: "#0B0C0E",
              padding: "0 16px",
              height: "38px",
              borderRadius: "9999px",
              fontWeight: "800",
              fontSize: "13px",
              cursor: "pointer",
              transition: "transform 0.15s ease, background-color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-accent-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-accent)")}
          >
            <span>🛒 CART</span>
            <span
              style={{
                backgroundColor: "#0B0C0E",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: "800",
                padding: "2px 7px",
                borderRadius: "9999px",
              }}
            >
              {mounted ? cartCount : 0}
            </span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "6px",
              backgroundColor: "rgba(25, 30, 40, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFF",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Category Navigation Drawer */}
      {isMobileMenuOpen && (
        <div
          style={{
            backgroundColor: "#0F131A",
            borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
            padding: "16px 20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            boxShadow: "0 16px 32px rgba(0, 0, 0, 0.8)",
          }}
        >
          {NAV_CATEGORIES.map((cat) => {
            const isActive =
              cat.category === "All"
                ? pathname === "/products" && (!searchParams.get("category") || searchParams.get("category") === "All")
                : cat.category === "Pre-Workout"
                ? pathname === "/products" && (currentCategory === "Pre-Workout" || currentCategory === "Performance")
                : pathname === "/products" && currentCategory === cat.category;

            return (
              <button
                key={cat.category}
                onClick={() => handleCategoryNav(cat.href)}
                style={{
                  textAlign: "left",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  fontSize: "13.5px",
                  fontWeight: isActive ? "800" : "600",
                  color: isActive ? "#FFFFFF" : "#CBD5E1",
                  backgroundColor: isActive ? "rgba(148, 163, 184, 0.2)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(148, 163, 184, 0.4)" : "transparent"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
              >
                <span>{cat.label}</span>
                {isActive && <span style={{ color: "var(--color-accent)", fontSize: "14px" }}>●</span>}
              </button>
            );
          })}

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              openModal("stack-builder-modal");
            }}
            style={{
              marginTop: "8px",
              textAlign: "center",
              padding: "12px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "800",
              color: "#0B0C0E",
              backgroundColor: "#FBBF24",
              cursor: "pointer",
            }}
          >
            Build Your Stack ⚡
          </button>
        </div>
      )}
    </header>
  );
}
