"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { adminProductApi } from "@/lib/api/adminProductApi";
import { categoryApi, Category, Subcategory, Brand } from "@/lib/api/categoryApi";
import { ProductSummary } from "@/lib/api/productApi";
export default function AdminCataloguePage() {
  const { user, token, isAuthenticated, openAuthModal, quickLogin } = useAuth();
  const { showToast } = useStore();

  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT" | "UNPUBLISHED">("ALL");

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    categoryId: "",
    subcategoryId: "",
    brandId: "",
    startingPrice: 2499,
    compareAtPrice: 2999,
    badge: "NEW LAUNCH",
    goalTag: "Build Lean Muscle",
    highlight: "24g High Quality Protein • Zero Added Sugar",
    minimalDesc: "Advanced formula designed for athletic recovery and lean muscle synthesis.",
    ingredients: "Pure Whey Protein Isolate, Cocoa Powder, Sunflower Lecithin, Natural Flavors, Stevia Extract.",
    allergens: "Contains Milk and Dairy derivatives. Manufactured in a facility that processes Soy.",
    primaryImageUrl: "/assets/product-catalog/whey_isolated.png",
    status: "PUBLISHED" as "DRAFT" | "PUBLISHED" | "UNPUBLISHED",
  });

  const isStaff = isAuthenticated && (user?.role === "ADMIN" || user?.role === "PRODUCT_MANAGER" || user?.role === "MANAGER");

  // Fetch Products & Metadata
  const fetchData = useCallback(async () => {
    if (!token || !isStaff) return;
    setLoading(true);
    try {
      const [prodPage, cats, subs, b] = await Promise.all([
        adminProductApi.listAdminProducts({ size: 50 }),
        categoryApi.listCategories(),
        categoryApi.listSubcategories(),
        categoryApi.listBrands(),
      ]);

      setProducts(prodPage?.content || []);
      setCategories(cats || []);
      if (cats && cats.length > 0 && !formData.categoryId) {
        setFormData((prev) => ({ ...prev, categoryId: cats[0].id }));
      }
      setSubcategories(subs || []);
      if (subs && subs.length > 0 && !formData.subcategoryId) {
        setFormData((prev) => ({ ...prev, subcategoryId: subs[0].id }));
      }
      setBrands(b || []);
      if (b && b.length > 0 && !formData.brandId) {
        setFormData((prev) => ({ ...prev, brandId: b[0].id }));
      }
    } catch (err: any) {
      console.error("Error fetching admin catalog data:", err);
      if (err?.status === 401 || err?.status === 403) {
        showToast("Session expired or unauthorized. Please re-authenticate.");
      } else {
        showToast(err.message || "Error loading catalog data from server");
      }
    } finally {
      setLoading(false);
    }
  }, [token, isStaff, showToast, formData.categoryId, formData.subcategoryId, formData.brandId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Product Status Change (Publish / Unpublish / Draft)
  const handleStatusChange = async (productId: string, newStatus: "DRAFT" | "PUBLISHED" | "UNPUBLISHED") => {
    try {
      await adminProductApi.updateProductStatus(productId, newStatus);
      showToast(`Product status updated to ${newStatus}!`);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, status: newStatus } : p))
      );
    } catch (err: any) {
      showToast(err.message || "Failed to update product status");
    }
  };

  // Handle Delete / Deactivate Product
  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`Are you sure you want to deactivate/delete "${productName}"?`)) return;

    try {
      await adminProductApi.deleteProduct(productId);
      showToast(`Product "${productName}" deactivated successfully.`);
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Failed to delete product");
    }
  };

  // Handle Name Input with Auto Slug
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setFormData((prev) => ({ ...prev, name, slug }));
  };

  // Handle Create Product Submit
  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        categoryId: formData.categoryId || categories[0]?.id,
        subcategoryId: formData.subcategoryId || subcategories[0]?.id,
        brandId: formData.brandId || brands[0]?.id,
        badge: formData.badge,
        goalTag: formData.goalTag,
        highlight: formData.highlight,
        minimalDesc: formData.minimalDesc,
        benefits: "Lean Muscle Synthesis, Rapid Recovery, Digestive Enzyme Fortified",
        usageInstructions: "Mix 1 scoop with 250-300ml cold water or milk. Consume post-workout.",
        ingredients: formData.ingredients,
        allergens: formData.allergens,
        status: formData.status,
      };

      await adminProductApi.createProduct(payload);
      showToast(`🎉 Product "${formData.name}" created successfully!`);
      setIsCreateModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Error submitting product");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (product: ProductSummary) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId,
      brandId: product.brandId,
      startingPrice: product.startingPrice,
      compareAtPrice: product.compareAtPrice,
      badge: product.badge || "FEATURED",
      goalTag: product.goalTag || "Performance",
      highlight: product.highlight || "",
      minimalDesc: product.minimalDesc || "",
      ingredients: "Pure Whey Protein Isolate, Natural Flavors, Stevia Extract.",
      allergens: "Contains Milk and Dairy derivatives.",
      primaryImageUrl: product.primaryImageUrl || "/assets/product-catalog/whey_isolated.png",
      status: product.status,
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Submit
  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setFormSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId,
        brandId: formData.brandId,
        badge: formData.badge,
        goalTag: formData.goalTag,
        highlight: formData.highlight,
        minimalDesc: formData.minimalDesc,
        benefits: "Lean Muscle Synthesis, Rapid Recovery",
        usageInstructions: "Mix 1 scoop with 250-300ml cold water.",
        ingredients: formData.ingredients,
        allergens: formData.allergens,
        status: formData.status,
      };

      await adminProductApi.updateProduct(selectedProduct.id, payload);
      showToast(`Product "${formData.name}" updated successfully!`);
      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Error updating product");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Access Denied / Role Required screen if not Admin/PM
  if (!isStaff) {
    return (
      <div style={{ backgroundColor: "#0A0D14", minHeight: "80vh", padding: "60px 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            maxWidth: "540px",
            width: "100%",
            backgroundColor: "#121622",
            border: "1.5px solid rgba(239, 68, 68, 0.4)",
            borderRadius: "16px",
            padding: "36px",
            textAlign: "center",
            boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
          }}
        >
          <div style={{ fontSize: "52px", marginBottom: "16px" }}>🛡️</div>
          <h2 className="font-display" style={{ fontSize: "28px", color: "#EF4444", marginBottom: "8px", letterSpacing: "1px" }}>
            ADMIN ACCESS RESTRICTED
          </h2>
          <p style={{ color: "#94A3B8", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
            This portal provides enterprise catalogue management, pricing overrides, and product lifecycle controls. You must authenticate with an <strong>ADMIN</strong> or <strong>PRODUCT_MANAGER</strong> role.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              onClick={() => quickLogin("ADMIN")}
              style={{
                width: "100%",
                height: "46px",
                borderRadius: "8px",
                backgroundColor: "var(--color-accent)",
                color: "#0B0C0E",
                fontWeight: "800",
                fontSize: "13.5px",
                cursor: "pointer",
              }}
            >
              👑 1-CLICK LOGIN AS SUPER ADMIN
            </button>
            <button
              onClick={() => quickLogin("PRODUCT_MANAGER")}
              style={{
                width: "100%",
                height: "46px",
                borderRadius: "8px",
                backgroundColor: "rgba(245, 158, 11, 0.15)",
                border: "1px solid rgba(245, 158, 11, 0.4)",
                color: "#FBBF24",
                fontWeight: "800",
                fontSize: "13.5px",
                cursor: "pointer",
              }}
            >
              📦 1-CLICK LOGIN AS PRODUCT MANAGER
            </button>
            <button
              onClick={() => openAuthModal()}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "#94A3B8",
                fontSize: "12.5px",
                cursor: "pointer",
                marginTop: "8px",
              }}
            >
              Open Other Role Logins →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#0A0D14", minHeight: "100vh", color: "#FFF", paddingBottom: "80px" }}>
      {/* Top Header Banner */}
      <div
        style={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "#0F131D",
          padding: "24px 0",
        }}
      >
        <div className="site-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span style={{ fontSize: "24px" }}>👑</span>
              <h1 className="font-display" style={{ fontSize: "32px", letterSpacing: "1.5px", margin: 0 }}>
                ENTERPRISE CATALOGUE MANAGEMENT
              </h1>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  backgroundColor: "rgba(16, 185, 129, 0.2)",
                  color: "#10B981",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  padding: "3px 8px",
                  borderRadius: "6px",
                }}
              >
                PHASE 2 ACTIVE
              </span>
            </div>
            <p style={{ fontSize: "13.5px", color: "#94A3B8", margin: 0 }}>
              Authenticated as <strong>{user?.firstName} {user?.lastName}</strong> ({user?.role}) • Full CRUD, Variants, Media &amp; Pricing Controls
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link
              href="/products"
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#CBD5E1",
                fontSize: "13px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>🛍️ Storefront View</span>
            </Link>
            <button
              onClick={() => {
                setFormData({
                  name: "",
                  slug: "",
                  categoryId: categories[0]?.id || "",
                  subcategoryId: subcategories[0]?.id || "",
                  brandId: brands[0]?.id || "",
                  startingPrice: 2499,
                  compareAtPrice: 2999,
                  badge: "NEW LAUNCH",
                  goalTag: "Build Lean Muscle",
                  highlight: "24g High Quality Protein • Zero Added Sugar",
                  minimalDesc: "Advanced formula designed for athletic recovery and lean muscle synthesis.",
                  ingredients: "Pure Whey Protein Isolate, Cocoa Powder, Sunflower Lecithin, Natural Flavors, Stevia Extract.",
                  allergens: "Contains Milk and Dairy derivatives.",
                  primaryImageUrl: "/assets/product-catalog/whey_isolated.png",
                  status: "PUBLISHED",
                });
                setIsCreateModalOpen(true);
              }}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                backgroundColor: "var(--color-accent)",
                color: "#0B0C0E",
                fontSize: "13.5px",
                fontWeight: "800",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 4px 14px rgba(245, 158, 11, 0.3)",
              }}
            >
              <span>+ CREATE PRODUCT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="site-container" style={{ marginTop: "28px" }}>
        {/* Metric Cards Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "24px" }}>
          <div style={{ backgroundColor: "#141824", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "#94A3B8", fontWeight: "700", marginBottom: "4px" }}>TOTAL PRODUCTS</div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#FFF" }}>{products.length}</div>
          </div>
          <div style={{ backgroundColor: "#141824", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "#10B981", fontWeight: "700", marginBottom: "4px" }}>PUBLISHED (LIVE)</div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#10B981" }}>
              {products.filter((p) => p.status === "PUBLISHED").length}
            </div>
          </div>
          <div style={{ backgroundColor: "#141824", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "#F59E0B", fontWeight: "700", marginBottom: "4px" }}>DRAFTS</div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#F59E0B" }}>
              {products.filter((p) => p.status === "DRAFT").length}
            </div>
          </div>
          <div style={{ backgroundColor: "#141824", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "#94A3B8", fontWeight: "700", marginBottom: "4px" }}>CATEGORIES / BRANDS</div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--color-accent)" }}>
              {categories.length} / {brands.length}
            </div>
          </div>
        </div>

        {/* Filters and Search Row */}
        <div
          style={{
            backgroundColor: "#141824",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "10px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
            marginBottom: "20px",
          }}
        >
          {/* Status Tabs */}
          <div style={{ display: "flex", gap: "8px" }}>
            {(["ALL", "PUBLISHED", "DRAFT", "UNPUBLISHED"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "800",
                  cursor: "pointer",
                  backgroundColor: statusFilter === tab ? "var(--color-accent)" : "rgba(255, 255, 255, 0.05)",
                  color: statusFilter === tab ? "#0B0C0E" : "#94A3B8",
                  border: statusFilter === tab ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
                  transition: "all 0.15s ease",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#0D1016",
                border: "1px solid #2B3342",
                borderRadius: "8px",
                padding: "0 12px",
                height: "38px",
                width: "260px",
              }}
            >
              <span style={{ marginRight: "8px", color: "#64748B" }}>🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                style={{
                  border: "none",
                  background: "none",
                  outline: "none",
                  color: "#FFF",
                  fontSize: "13px",
                  width: "100%",
                }}
              />
            </div>
            <button
              onClick={fetchData}
              title="Refresh"
              style={{
                height: "38px",
                padding: "0 12px",
                borderRadius: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#CBD5E1",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              🔄
            </button>
          </div>
        </div>

        {/* Product Catalogue Table */}
        <div
          style={{
            backgroundColor: "#141824",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>
              ⏳ Loading products from PostgreSQL 18...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ padding: "50px", textAlign: "center", color: "#94A3B8" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>📦</div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "#FFF" }}>No products found</div>
              <p style={{ fontSize: "13px", marginTop: "4px" }}>Create your first product using the button above.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#0F131D", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#94A3B8", fontSize: "11.5px", textTransform: "uppercase" }}>
                    <th style={{ padding: "14px 18px" }}>Product</th>
                    <th style={{ padding: "14px 18px" }}>Category &amp; Brand</th>
                    <th style={{ padding: "14px 18px" }}>Price</th>
                    <th style={{ padding: "14px 18px" }}>Status</th>
                    <th style={{ padding: "14px 18px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const statusColor =
                      p.status === "PUBLISHED" ? "#10B981" : p.status === "DRAFT" ? "#F59E0B" : "#94A3B8";

                    return (
                      <tr
                        key={p.id}
                        style={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                          transition: "background-color 0.15s ease",
                        }}
                      >
                        {/* Thumbnail & Name */}
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <div
                              style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "8px",
                                backgroundColor: "#0B0C0E",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                position: "relative",
                                overflow: "hidden",
                                flexShrink: 0,
                              }}
                            >
                              <Image
                                src={p.primaryImageUrl || "/assets/product-catalog/whey_isolated.png"}
                                alt={p.name}
                                fill
                                style={{ objectFit: "contain", padding: "4px" }}
                              />
                            </div>
                            <div>
                              <div style={{ fontWeight: "800", color: "#FFF", fontSize: "14px" }}>{p.name}</div>
                              <div style={{ fontSize: "11px", color: "#64748B", fontFamily: "monospace" }}>
                                slug: {p.slug}
                              </div>
                              {p.badge && (
                                <span
                                  style={{
                                    fontSize: "9.5px",
                                    fontWeight: "800",
                                    color: "var(--color-accent)",
                                    backgroundColor: "rgba(245, 158, 11, 0.15)",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    display: "inline-block",
                                    marginTop: "3px",
                                  }}
                                >
                                  {p.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category & Brand */}
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ color: "#FFF", fontWeight: "700" }}>{p.categoryName || "General"}</div>
                          <div style={{ fontSize: "12px", color: "#94A3B8" }}>
                            Sub: {p.subcategoryName || "—"} | Brand: {p.brandName || "PROVANA"}
                          </div>
                        </td>

                        {/* Price */}
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ fontWeight: "800", color: "#FFF" }}>₹{p.startingPrice?.toLocaleString("en-IN")}</div>
                          {p.compareAtPrice && p.compareAtPrice > p.startingPrice && (
                            <div style={{ fontSize: "11.5px", color: "#64748B", textDecoration: "line-through" }}>
                              ₹{p.compareAtPrice?.toLocaleString("en-IN")}
                            </div>
                          )}
                        </td>

                        {/* Status Toggle Dropdown */}
                        <td style={{ padding: "14px 18px" }}>
                          <select
                            value={p.status}
                            onChange={(e) =>
                              handleStatusChange(p.id, e.target.value as "DRAFT" | "PUBLISHED" | "UNPUBLISHED")
                            }
                            style={{
                              backgroundColor: `${statusColor}18`,
                              color: statusColor,
                              border: `1px solid ${statusColor}44`,
                              borderRadius: "6px",
                              padding: "4px 8px",
                              fontSize: "12px",
                              fontWeight: "800",
                              cursor: "pointer",
                              outline: "none",
                            }}
                          >
                            <option value="PUBLISHED" style={{ backgroundColor: "#141824", color: "#10B981" }}>
                              ● PUBLISHED
                            </option>
                            <option value="DRAFT" style={{ backgroundColor: "#141824", color: "#F59E0B" }}>
                              ● DRAFT
                            </option>
                            <option value="UNPUBLISHED" style={{ backgroundColor: "#141824", color: "#94A3B8" }}>
                              ● UNPUBLISHED
                            </option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                            <Link
                              href={`/products/${p.slug}`}
                              target="_blank"
                              title="View PDP"
                              style={{
                                padding: "6px 10px",
                                borderRadius: "6px",
                                backgroundColor: "rgba(255, 255, 255, 0.08)",
                                color: "#CBD5E1",
                                fontSize: "12px",
                                fontWeight: "700",
                              }}
                            >
                              👁️
                            </Link>
                            <Link
                              href={`/admin/products/${p.id}`}
                              title="Manage Variants, SKUs, Media, Nutrition & FAQs"
                              style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                backgroundColor: "rgba(59, 130, 246, 0.15)",
                                border: "1px solid rgba(59, 130, 246, 0.35)",
                                color: "#60A5FA",
                                fontSize: "12px",
                                fontWeight: "700",
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              ⚙️ Manage
                            </Link>
                            <button
                              onClick={() => openEditModal(p)}
                              title="Edit Product"
                              style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                backgroundColor: "rgba(245, 158, 11, 0.15)",
                                border: "1px solid rgba(245, 158, 11, 0.35)",
                                color: "#FBBF24",
                                fontSize: "12px",
                                fontWeight: "700",
                                cursor: "pointer",
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              title="Delete or Deactivate"
                              style={{
                                padding: "6px 10px",
                                borderRadius: "6px",
                                backgroundColor: "rgba(239, 68, 68, 0.12)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                color: "#EF4444",
                                fontSize: "12px",
                                fontWeight: "700",
                                cursor: "pointer",
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* CREATE PRODUCT MODAL                                              */}
      {/* ================================================================= */}
      {isCreateModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 100000,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateModalOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: "#141824",
              border: "1.5px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "28px",
              color: "#FFF",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 className="font-display" style={{ fontSize: "24px", letterSpacing: "1px", margin: 0 }}>
                CREATE NEW PRODUCT (PHASE 2)
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: "none", border: "none", color: "#94A3B8", fontSize: "18px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProductSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Product Name */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                  PRODUCT NAME *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Provana Ultra Mass Gainer"
                  required
                  style={{ width: "100%", height: "42px", padding: "0 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF", fontSize: "13.5px" }}
                />
              </div>

              {/* Slug */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                  SLUG (URL PATH) *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="provana-ultra-mass-gainer"
                  required
                  style={{ width: "100%", height: "42px", padding: "0 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF", fontSize: "13.5px", fontFamily: "monospace" }}
                />
              </div>

              {/* Category & Subcategory Selection */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                    CATEGORY *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    style={{ width: "100%", height: "42px", padding: "0 10px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF", fontSize: "13px" }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                    SUBCATEGORY *
                  </label>
                  <select
                    value={formData.subcategoryId}
                    onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                    style={{ width: "100%", height: "42px", padding: "0 10px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF", fontSize: "13px" }}
                  >
                    {subcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Highlights & Badge */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                    HIGHLIGHT
                  </label>
                  <input
                    type="text"
                    value={formData.highlight}
                    onChange={(e) => setFormData({ ...formData, highlight: e.target.value })}
                    placeholder="e.g. 24g Protein • 5.5g BCAA"
                    style={{ width: "100%", height: "42px", padding: "0 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                    BADGE
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. BESTSELLER"
                    style={{ width: "100%", height: "42px", padding: "0 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Minimal Description */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                  MINIMAL DESCRIPTION
                </label>
                <textarea
                  rows={2}
                  value={formData.minimalDesc}
                  onChange={(e) => setFormData({ ...formData, minimalDesc: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF", fontSize: "13px", resize: "vertical" }}
                />
              </div>

              {/* Ingredients & Allergens */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                    INGREDIENTS
                  </label>
                  <textarea
                    rows={2}
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF", fontSize: "12.5px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                    ALLERGENS
                  </label>
                  <textarea
                    rows={2}
                    value={formData.allergens}
                    onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF", fontSize: "12.5px" }}
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                  INITIAL STATUS
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  style={{ width: "100%", height: "42px", padding: "0 10px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF", fontSize: "13px" }}
                >
                  <option value="PUBLISHED">PUBLISHED (Instantly visible to customers)</option>
                  <option value="DRAFT">DRAFT (Admin preview only)</option>
                  <option value="UNPUBLISHED">UNPUBLISHED</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{ flex: 1, height: "44px", borderRadius: "6px", backgroundColor: "#252B37", color: "#FFF", fontWeight: "700", border: "none" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  style={{
                    flex: 2,
                    height: "44px",
                    borderRadius: "6px",
                    backgroundColor: "var(--color-accent)",
                    color: "#0B0C0E",
                    fontWeight: "800",
                    border: "none",
                    cursor: formSubmitting ? "wait" : "pointer",
                  }}
                >
                  {formSubmitting ? "CREATING ON POSTGRES..." : "SAVE & CREATE PRODUCT 🚀"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* EDIT PRODUCT MODAL                                                */}
      {/* ================================================================= */}
      {isEditModalOpen && selectedProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 100000,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditModalOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: "#141824",
              border: "1.5px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "28px",
              color: "#FFF",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 className="font-display" style={{ fontSize: "24px", letterSpacing: "1px", margin: 0 }}>
                EDIT PRODUCT: {selectedProduct.name}
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: "none", border: "none", color: "#94A3B8", fontSize: "18px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditProductSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                  PRODUCT NAME *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: "100%", height: "42px", padding: "0 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF", fontSize: "13.5px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                  SLUG *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  style={{ width: "100%", height: "42px", padding: "0 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF", fontSize: "13.5px", fontFamily: "monospace" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                    HIGHLIGHT
                  </label>
                  <input
                    type="text"
                    value={formData.highlight}
                    onChange={(e) => setFormData({ ...formData, highlight: e.target.value })}
                    style={{ width: "100%", height: "42px", padding: "0 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                    BADGE
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    style={{ width: "100%", height: "42px", padding: "0 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                  MINIMAL DESCRIPTION
                </label>
                <textarea
                  rows={2}
                  value={formData.minimalDesc}
                  onChange={(e) => setFormData({ ...formData, minimalDesc: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                    INGREDIENTS
                  </label>
                  <textarea
                    rows={2}
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF", fontSize: "12.5px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                    ALLERGENS
                  </label>
                  <textarea
                    rows={2}
                    value={formData.allergens}
                    onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF", fontSize: "12.5px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ flex: 1, height: "44px", borderRadius: "6px", backgroundColor: "#252B37", color: "#FFF", fontWeight: "700", border: "none" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  style={{
                    flex: 2,
                    height: "44px",
                    borderRadius: "6px",
                    backgroundColor: "var(--color-accent)",
                    color: "#0B0C0E",
                    fontWeight: "800",
                    border: "none",
                    cursor: formSubmitting ? "wait" : "pointer",
                  }}
                >
                  {formSubmitting ? "UPDATING..." : "UPDATE PRODUCT 💾"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
