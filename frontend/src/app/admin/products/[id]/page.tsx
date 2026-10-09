"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { adminProductApi } from "@/lib/api/adminProductApi";
import { categoryApi, Category, Subcategory, Brand } from "@/lib/api/categoryApi";
import { ProductDetail, ProductVariant, ProductSku, ProductMedia, ProductNutrition, ProductFaq } from "@/lib/api/productApi";

export default function AdminProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { user, token, isAuthenticated, quickLogin } = useAuth();
  const { showToast } = useStore();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "variants" | "media" | "nutrition" | "faqs">("details");

  // Metadata dropdowns
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Forms
  const [detailsForm, setDetailsForm] = useState({
    name: "",
    slug: "",
    brandId: "",
    categoryId: "",
    subcategoryId: "",
    goalTag: "",
    badge: "",
    highlight: "",
    minimalDesc: "",
    description: "",
    benefits: "",
    usageInstructions: "",
    ingredients: "",
    allergens: "",
    status: "PUBLISHED" as "DRAFT" | "PUBLISHED" | "UNPUBLISHED",
  });

  // Variant Form Modal
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [variantForm, setVariantForm] = useState({
    name: "",
    flavor: "",
    size: "",
    sortOrder: 1,
    active: true,
  });

  // SKU Form Modal
  const [isSkuModalOpen, setIsSkuModalOpen] = useState(false);
  const [selectedVariantIdForSku, setSelectedVariantIdForSku] = useState<string>("");
  const [skuForm, setSkuForm] = useState({
    skuCode: "",
    price: 2499,
    compareAtPrice: 2999,
    currency: "INR",
    available: true,
    active: true,
  });

  // Media Form Modal
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaForm, setMediaForm] = useState({
    url: "",
    mediaType: "IMAGE" as "IMAGE" | "VIDEO",
    altText: "",
    isPrimary: true,
    sortOrder: 1,
  });

  // Nutrition Form
  const [nutritionForm, setNutritionForm] = useState({
    servingSize: "1 Scoop (32g)",
    servingsPerContainer: 30,
    calories: 120,
    proteinG: 27,
    carbsG: 1.5,
    fatG: 0.5,
    fiberG: 0,
    sugarG: 0,
    sodiumMg: 140,
    metricsJson: "",
  });

  // FAQ Form Modal
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    sortOrder: 1,
  });

  const isStaff = isAuthenticated && user?.role !== "CUSTOMER" && (user?.role === "ADMIN" || user?.role === "PRODUCT_MANAGER" || user?.role === "MANAGER");

  useEffect(() => {
    if (!isStaff) {
      setProduct(null);
      setCategories([]);
      setSubcategories([]);
      setBrands([]);
    }
  }, [isStaff]);

  const loadProductData = useCallback(async () => {
    if (!id || !token || !isStaff) return;
    setLoading(true);
    try {
      const [prod, cats, subs, b] = await Promise.all([
        adminProductApi.getAdminProductById(id),
        categoryApi.listCategories(),
        categoryApi.listSubcategories(),
        categoryApi.listBrands(),
      ]);

      setProduct(prod);
      setCategories(cats || []);
      setSubcategories(subs || []);
      setBrands(b || []);

      setDetailsForm({
        name: prod.name || "",
        slug: prod.slug || "",
        brandId: prod.brand?.id || "",
        categoryId: prod.category?.id || "",
        subcategoryId: prod.subcategory?.id || "",
        goalTag: prod.goalTag || "",
        badge: prod.badge || "",
        highlight: prod.highlight || "",
        minimalDesc: prod.minimalDesc || "",
        description: prod.description || "",
        benefits: prod.benefits || "",
        usageInstructions: prod.usageInstructions || "",
        ingredients: prod.ingredients || "",
        allergens: prod.allergens || "",
        status: prod.status || "DRAFT",
      });

      if (prod.nutrition) {
        setNutritionForm({
          servingSize: prod.nutrition.servingSize || "1 Scoop (32g)",
          servingsPerContainer: prod.nutrition.servingsPerContainer || 30,
          calories: prod.nutrition.calories || 120,
          proteinG: prod.nutrition.proteinG || 27,
          carbsG: prod.nutrition.carbsG || 1.5,
          fatG: prod.nutrition.fatG || 0.5,
          fiberG: prod.nutrition.fiberG || 0,
          sugarG: prod.nutrition.sugarG || 0,
          sodiumMg: prod.nutrition.sodiumMg || 140,
          metricsJson: prod.nutrition.metricsJson || "",
        });
      }
    } catch (err: any) {
      showToast(err.message || "Error loading product");
    } finally {
      setLoading(false);
    }
  }, [id, token, isStaff, showToast]);

  useEffect(() => {
    loadProductData();
  }, [loadProductData]);

  // Status Change
  const handleStatusChange = async (status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED") => {
    try {
      await adminProductApi.updateProductStatus(id, status);
      showToast(`Status updated to ${status}`);
      loadProductData();
    } catch (err: any) {
      showToast(err.message || "Failed to update status");
    }
  };

  // Update Product Details
  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminProductApi.updateProduct(id, detailsForm);
      showToast("Product details updated successfully!");
      loadProductData();
    } catch (err: any) {
      showToast(err.message || "Failed to update product");
    }
  };

  // Add Variant
  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminProductApi.addVariant(id, {
        name: variantForm.name,
        flavor: variantForm.flavor,
        size: variantForm.size,
        sortOrder: variantForm.sortOrder,
        active: variantForm.active,
      });
      showToast("Variant added successfully!");
      setIsVariantModalOpen(false);
      setVariantForm({ name: "", flavor: "", size: "", sortOrder: 1, active: true });
      loadProductData();
    } catch (err: any) {
      showToast(err.message || "Failed to add variant");
    }
  };

  // Delete Variant
  const handleDeleteVariant = async (variantId: string) => {
    if (!window.confirm("Are you sure you want to deactivate this variant?")) return;
    try {
      await adminProductApi.deleteVariant(variantId);
      showToast("Variant removed");
      loadProductData();
    } catch (err: any) {
      showToast(err.message || "Failed to delete variant");
    }
  };

  // Add SKU
  const handleAddSku = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariantIdForSku) return;
    try {
      await adminProductApi.createSku({
        variantId: selectedVariantIdForSku,
        skuCode: skuForm.skuCode,
        price: Number(skuForm.price),
        compareAtPrice: Number(skuForm.compareAtPrice),
        currency: skuForm.currency,
        available: skuForm.available,
        active: skuForm.active,
      });
      showToast("SKU created successfully!");
      setIsSkuModalOpen(false);
      setSkuForm({ skuCode: "", price: 2499, compareAtPrice: 2999, currency: "INR", available: true, active: true });
      loadProductData();
    } catch (err: any) {
      showToast(err.message || "Failed to create SKU");
    }
  };

  // Delete SKU
  const handleDeleteSku = async (skuId: string) => {
    if (!window.confirm("Are you sure you want to deactivate this SKU?")) return;
    try {
      await adminProductApi.deleteSku(skuId);
      showToast("SKU deactivated");
      loadProductData();
    } catch (err: any) {
      showToast(err.message || "Failed to delete SKU");
    }
  };

  // Add Media
  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminProductApi.addMedia(id, mediaForm);
      showToast("Media added successfully!");
      setIsMediaModalOpen(false);
      setMediaForm({ url: "", mediaType: "IMAGE", altText: "", isPrimary: false, sortOrder: 1 });
      loadProductData();
    } catch (err: any) {
      showToast(err.message || "Failed to add media");
    }
  };

  // Delete Media
  const handleDeleteMedia = async (mediaId: string) => {
    if (!window.confirm("Are you sure you want to delete this media?")) return;
    try {
      await adminProductApi.deleteMedia(mediaId);
      showToast("Media deleted");
      loadProductData();
    } catch (err: any) {
      showToast(err.message || "Failed to delete media");
    }
  };

  // Save Nutrition
  const handleSaveNutrition = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminProductApi.saveNutrition(id, {
        servingSize: nutritionForm.servingSize,
        servingsPerContainer: Number(nutritionForm.servingsPerContainer),
        calories: Number(nutritionForm.calories),
        proteinG: Number(nutritionForm.proteinG),
        carbsG: Number(nutritionForm.carbsG),
        fatG: Number(nutritionForm.fatG),
        fiberG: Number(nutritionForm.fiberG),
        sugarG: Number(nutritionForm.sugarG),
        sodiumMg: Number(nutritionForm.sodiumMg),
        metricsJson: nutritionForm.metricsJson,
      });
      showToast("Nutrition facts updated successfully!");
      loadProductData();
    } catch (err: any) {
      showToast(err.message || "Failed to save nutrition");
    }
  };

  // Add FAQ
  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminProductApi.addFaq(id, faqForm);
      showToast("FAQ added successfully!");
      setIsFaqModalOpen(false);
      setFaqForm({ question: "", answer: "", sortOrder: 1 });
      loadProductData();
    } catch (err: any) {
      showToast(err.message || "Failed to add FAQ");
    }
  };

  // Delete FAQ
  const handleDeleteFaq = async (faqId: string) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await adminProductApi.deleteFaq(faqId);
      showToast("FAQ deleted");
      loadProductData();
    } catch (err: any) {
      showToast(err.message || "Failed to delete FAQ");
    }
  };

  // Access Denied Screen
  if (!isStaff) {
    return (
      <div style={{ backgroundColor: "#0A0D14", minHeight: "80vh", padding: "60px 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: "500px", width: "100%", backgroundColor: "#121622", border: "1px solid #EF4444", borderRadius: "12px", padding: "32px", textAlign: "center" }}>
          <h2 style={{ color: "#EF4444", marginBottom: "16px" }}>ADMIN ACCESS REQUIRED</h2>
          <p style={{ color: "#94A3B8", marginBottom: "20px" }}>Please log in with an ADMIN or PRODUCT_MANAGER account to manage catalogue products.</p>
          <button onClick={() => quickLogin("ADMIN")} style={{ padding: "10px 20px", backgroundColor: "var(--color-accent)", color: "#000", fontWeight: "700", borderRadius: "6px" }}>
            1-Click Login as Admin
          </button>
        </div>
      </div>
    );
  }

  if (loading || !product) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center", minHeight: "70vh", color: "var(--color-accent)" }}>
        Loading Product #{id}...
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#0B0C0E", minHeight: "90vh", padding: "32px 0 80px" }}>
      <div className="site-container" style={{ maxWidth: "1200px" }}>
        {/* Navigation Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <Link href="/admin/products" style={{ color: "var(--color-accent)", fontWeight: "700", fontSize: "14px", textDecoration: "none" }}>
            ← Back to Products List
          </Link>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#94A3B8" }}>Status:</span>
            <select
              value={product.status}
              onChange={(e) => handleStatusChange(e.target.value as any)}
              style={{
                backgroundColor: product.status === "PUBLISHED" ? "#065F46" : product.status === "DRAFT" ? "#78350F" : "#7F1D1D",
                color: "#FFF",
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "6px 12px",
                borderRadius: "6px",
                fontWeight: "700",
                fontSize: "12px",
              }}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="UNPUBLISHED">UNPUBLISHED</option>
            </select>
          </div>
        </div>

        {/* Title Header */}
        <div style={{ backgroundColor: "#11141C", padding: "24px", borderRadius: "12px", border: "1px solid #1E2330", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--color-accent)", letterSpacing: "1px", textTransform: "uppercase" }}>
                {product.brand?.name || "PROVANA"} • {product.category?.name}
              </span>
              <h1 className="font-display" style={{ fontSize: "28px", color: "#FFF", marginTop: "4px" }}>
                {product.name}
              </h1>
              <p style={{ color: "#94A3B8", fontSize: "13px", marginTop: "4px" }}>
                Slug: <code>{product.slug}</code> | ID: <code>{product.id}</code>
              </p>
            </div>
            <Link
              href={`/products/${product.slug}`}
              target="_blank"
              style={{
                padding: "8px 16px",
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "#FFF",
                borderRadius: "6px",
                fontSize: "12.5px",
                fontWeight: "600",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              👁 View Public Page ↗
            </Link>
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #1E2330", marginBottom: "24px" }}>
          {[
            { id: "details", label: "Product Info" },
            { id: "variants", label: `Variants & SKUs (${product.variants?.length || 0})` },
            { id: "media", label: `Media Gallery (${product.media?.length || 0})` },
            { id: "nutrition", label: "Nutritional Facts" },
            { id: "faqs", label: `Customer FAQs (${product.faqs?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: "10px 18px",
                backgroundColor: activeTab === tab.id ? "#1E2330" : "transparent",
                color: activeTab === tab.id ? "var(--color-accent)" : "#94A3B8",
                fontWeight: activeTab === tab.id ? "700" : "500",
                fontSize: "13.5px",
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid var(--color-accent)" : "2px solid transparent",
                cursor: "pointer",
                borderRadius: "6px 6px 0 0",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: PRODUCT INFO */}
        {activeTab === "details" && (
          <form onSubmit={handleUpdateDetails} style={{ backgroundColor: "#11141C", padding: "24px", borderRadius: "12px", border: "1px solid #1E2330" }}>
            <h3 style={{ fontSize: "16px", color: "#FFF", marginBottom: "16px", fontWeight: "700" }}>Core Product Information</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Product Name *</label>
                <input
                  type="text"
                  required
                  value={detailsForm.name}
                  onChange={(e) => setDetailsForm({ ...detailsForm, name: e.target.value })}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>URL Slug *</label>
                <input
                  type="text"
                  required
                  value={detailsForm.slug}
                  onChange={(e) => setDetailsForm({ ...detailsForm, slug: e.target.value })}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Brand</label>
                <select
                  value={detailsForm.brandId}
                  onChange={(e) => setDetailsForm({ ...detailsForm, brandId: e.target.value })}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Category</label>
                <select
                  value={detailsForm.categoryId}
                  onChange={(e) => setDetailsForm({ ...detailsForm, categoryId: e.target.value })}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Subcategory</label>
                <select
                  value={detailsForm.subcategoryId}
                  onChange={(e) => setDetailsForm({ ...detailsForm, subcategoryId: e.target.value })}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                >
                  <option value="">None</option>
                  {subcategories.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Badge</label>
                <input
                  type="text"
                  value={detailsForm.badge}
                  onChange={(e) => setDetailsForm({ ...detailsForm, badge: e.target.value })}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Goal Tag</label>
                <input
                  type="text"
                  value={detailsForm.goalTag}
                  onChange={(e) => setDetailsForm({ ...detailsForm, goalTag: e.target.value })}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Highlight</label>
                <input
                  type="text"
                  value={detailsForm.highlight}
                  onChange={(e) => setDetailsForm({ ...detailsForm, highlight: e.target.value })}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Minimal Description (Catalog Cards)</label>
              <textarea
                rows={2}
                value={detailsForm.minimalDesc}
                onChange={(e) => setDetailsForm({ ...detailsForm, minimalDesc: e.target.value })}
                style={{ width: "100%", padding: "10px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Full Description</label>
              <textarea
                rows={4}
                value={detailsForm.description}
                onChange={(e) => setDetailsForm({ ...detailsForm, description: e.target.value })}
                style={{ width: "100%", padding: "10px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Key Benefits (Semicolon separated)</label>
                <textarea
                  rows={2}
                  value={detailsForm.benefits}
                  onChange={(e) => setDetailsForm({ ...detailsForm, benefits: e.target.value })}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Usage Instructions</label>
                <textarea
                  rows={2}
                  value={detailsForm.usageInstructions}
                  onChange={(e) => setDetailsForm({ ...detailsForm, usageInstructions: e.target.value })}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Ingredients List</label>
                <textarea
                  rows={2}
                  value={detailsForm.ingredients}
                  onChange={(e) => setDetailsForm({ ...detailsForm, ingredients: e.target.value })}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Allergens / Advisory</label>
                <textarea
                  rows={2}
                  value={detailsForm.allergens}
                  onChange={(e) => setDetailsForm({ ...detailsForm, allergens: e.target.value })}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                padding: "10px 24px",
                backgroundColor: "var(--color-accent)",
                color: "#000",
                fontWeight: "700",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
              }}
            >
              💾 Save Product Changes
            </button>
          </form>
        )}

        {/* TAB 2: VARIANTS & SKUS */}
        {activeTab === "variants" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", color: "#FFF", fontWeight: "700" }}>Product Variants &amp; Sellable SKUs</h3>
              <button
                onClick={() => setIsVariantModalOpen(true)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "var(--color-accent)",
                  color: "#000",
                  fontWeight: "700",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                + Add Variant
              </button>
            </div>

            {(!product.variants || product.variants.length === 0) ? (
              <div style={{ backgroundColor: "#11141C", padding: "40px", borderRadius: "12px", textAlign: "center", color: "#94A3B8" }}>
                No variants added yet. Add a variant (e.g. "Chocolate / 1kg") and SKUs to make this product sellable.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {product.variants.map((v) => (
                  <div key={v.id} style={{ backgroundColor: "#11141C", padding: "20px", borderRadius: "10px", border: "1px solid #1E2330" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1E2330", paddingBottom: "12px", marginBottom: "12px" }}>
                      <div>
                        <strong style={{ color: "#FFF", fontSize: "16px" }}>{v.name}</strong>
                        <span style={{ marginLeft: "12px", fontSize: "12px", color: v.active ? "#10B981" : "#EF4444" }}>
                          {v.active ? "● ACTIVE" : "● INACTIVE"}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => {
                            setSelectedVariantIdForSku(v.id);
                            setIsSkuModalOpen(true);
                          }}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "rgba(255,255,255,0.08)",
                            color: "var(--color-accent)",
                            border: "1px solid var(--color-accent)",
                            borderRadius: "4px",
                            fontSize: "12px",
                            cursor: "pointer",
                            fontWeight: "700",
                          }}
                        >
                          + Add SKU
                        </button>
                        <button
                          onClick={() => handleDeleteVariant(v.id)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "rgba(239,68,68,0.15)",
                            color: "#EF4444",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          Deactivate
                        </button>
                      </div>
                    </div>

                    {/* SKUs Under Variant */}
                    <div>
                      <span style={{ fontSize: "12px", color: "#94A3B8", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                        Sellable SKUs ({v.skus?.length || 0}):
                      </span>
                      {(!v.skus || v.skus.length === 0) ? (
                        <p style={{ fontSize: "12px", color: "#64748B" }}>No SKUs linked yet. Click "+ Add SKU" above.</p>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
                          {v.skus.map((sku) => (
                            <div key={sku.id} style={{ backgroundColor: "#0B0C0E", padding: "12px 16px", borderRadius: "6px", border: "1px solid #1E2330", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <code style={{ color: "var(--color-accent)", fontSize: "13px", fontWeight: "700" }}>{sku.skuCode}</code>
                                <div style={{ fontSize: "12px", color: "#FFF", marginTop: "4px" }}>
                                  ₹{sku.price} {sku.compareAtPrice ? <span style={{ textDecoration: "line-through", color: "#64748B" }}>₹{sku.compareAtPrice}</span> : null}
                                </div>
                                <span style={{ fontSize: "11px", color: sku.available ? "#10B981" : "#EF4444" }}>
                                  {sku.available ? "In Stock" : "Out of Stock"}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteSku(sku.id)}
                                style={{ padding: "4px 8px", backgroundColor: "transparent", color: "#EF4444", border: "none", cursor: "pointer", fontSize: "12px" }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MEDIA */}
        {activeTab === "media" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", color: "#FFF", fontWeight: "700" }}>Product Media Gallery</h3>
              <button
                onClick={() => setIsMediaModalOpen(true)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "var(--color-accent)",
                  color: "#000",
                  fontWeight: "700",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                + Add Media
              </button>
            </div>

            {(!product.media || product.media.length === 0) ? (
              <div style={{ backgroundColor: "#11141C", padding: "40px", borderRadius: "12px", textAlign: "center", color: "#94A3B8" }}>
                No media uploaded for this product.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
                {product.media.map((m) => (
                  <div key={m.id} style={{ backgroundColor: "#11141C", borderRadius: "8px", border: "1px solid #1E2330", overflow: "hidden" }}>
                    <div style={{ height: "160px", position: "relative", backgroundColor: "#0B0C0E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img src={m.url} alt={m.altText || "Product media"} style={{ maxHeight: "140px", maxWidth: "100%", objectFit: "contain" }} />
                      {m.isPrimary && (
                        <span style={{ position: "absolute", top: "8px", left: "8px", backgroundColor: "var(--color-accent)", color: "#000", padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "800" }}>
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <div style={{ padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", color: "#64748B" }}>Order: {m.sortOrder}</span>
                      <button
                        onClick={() => handleDeleteMedia(m.id)}
                        style={{ padding: "4px 8px", backgroundColor: "rgba(239,68,68,0.15)", color: "#EF4444", border: "none", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: NUTRITION FACTS */}
        {activeTab === "nutrition" && (
          <form onSubmit={handleSaveNutrition} style={{ backgroundColor: "#11141C", padding: "24px", borderRadius: "12px", border: "1px solid #1E2330" }}>
            <h3 style={{ fontSize: "16px", color: "#FFF", marginBottom: "16px", fontWeight: "700" }}>Nutritional Profile</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Serving Size</label>
                <input
                  type="text"
                  value={nutritionForm.servingSize}
                  onChange={(e) => setNutritionForm({ ...nutritionForm, servingSize: e.target.value })}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Servings Per Container</label>
                <input
                  type="number"
                  value={nutritionForm.servingsPerContainer}
                  onChange={(e) => setNutritionForm({ ...nutritionForm, servingsPerContainer: Number(e.target.value) })}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Calories (kcal)</label>
                <input
                  type="number"
                  value={nutritionForm.calories}
                  onChange={(e) => setNutritionForm({ ...nutritionForm, calories: Number(e.target.value) })}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Protein (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={nutritionForm.proteinG}
                  onChange={(e) => setNutritionForm({ ...nutritionForm, proteinG: Number(e.target.value) })}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Carbs (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={nutritionForm.carbsG}
                  onChange={(e) => setNutritionForm({ ...nutritionForm, carbsG: Number(e.target.value) })}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>Fat (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={nutritionForm.fatG}
                  onChange={(e) => setNutritionForm({ ...nutritionForm, fatG: Number(e.target.value) })}
                  style={{ width: "100%", padding: "10px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "6px" }}>
                Custom Metrics JSON (e.g. <code>[{'{"metric":"BCAA","value":"6.2 g"}'}]</code>)
              </label>
              <textarea
                rows={3}
                value={nutritionForm.metricsJson}
                onChange={(e) => setNutritionForm({ ...nutritionForm, metricsJson: e.target.value })}
                style={{ width: "100%", padding: "10px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF", fontFamily: "monospace" }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: "10px 24px",
                backgroundColor: "var(--color-accent)",
                color: "#000",
                fontWeight: "700",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
              }}
            >
              💾 Save Nutritional Facts
            </button>
          </form>
        )}

        {/* TAB 5: FAQS */}
        {activeTab === "faqs" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", color: "#FFF", fontWeight: "700" }}>Frequently Asked Questions</h3>
              <button
                onClick={() => setIsFaqModalOpen(true)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "var(--color-accent)",
                  color: "#000",
                  fontWeight: "700",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                + Add FAQ
              </button>
            </div>

            {(!product.faqs || product.faqs.length === 0) ? (
              <div style={{ backgroundColor: "#11141C", padding: "40px", borderRadius: "12px", textAlign: "center", color: "#94A3B8" }}>
                No FAQs added for this product yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {product.faqs.map((f) => (
                  <div key={f.id} style={{ backgroundColor: "#11141C", padding: "16px 20px", borderRadius: "8px", border: "1px solid #1E2330", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h4 style={{ color: "#FFF", fontSize: "14px", fontWeight: "700", marginBottom: "6px" }}>{f.question}</h4>
                      <p style={{ color: "#CBD5E1", fontSize: "13px", lineHeight: "1.5" }}>{f.answer}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteFaq(f.id)}
                      style={{ padding: "4px 8px", backgroundColor: "rgba(239,68,68,0.15)", color: "#EF4444", border: "none", borderRadius: "4px", fontSize: "12px", cursor: "pointer", marginLeft: "16px" }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* VARIANT MODAL */}
      {isVariantModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ maxWidth: "450px", width: "100%", backgroundColor: "#121622", padding: "24px", borderRadius: "10px", border: "1px solid #2A3040" }}>
            <h3 style={{ color: "#FFF", fontSize: "18px", marginBottom: "16px" }}>Add Product Variant</h3>
            <form onSubmit={handleAddVariant}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "4px" }}>Variant Name (e.g. Belgian Chocolate - 1kg)</label>
                <input
                  type="text"
                  required
                  value={variantForm.name}
                  onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "4px" }}>Flavor</label>
                  <input
                    type="text"
                    value={variantForm.flavor}
                    onChange={(e) => setVariantForm({ ...variantForm, flavor: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "4px" }}>Size</label>
                  <input
                    type="text"
                    value={variantForm.size}
                    onChange={(e) => setVariantForm({ ...variantForm, size: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setIsVariantModalOpen(false)} style={{ padding: "8px 16px", backgroundColor: "#2A3040", color: "#FFF", borderRadius: "6px", border: "none" }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: "8px 16px", backgroundColor: "var(--color-accent)", color: "#000", fontWeight: "700", borderRadius: "6px", border: "none" }}>
                  Create Variant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SKU MODAL */}
      {isSkuModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ maxWidth: "450px", width: "100%", backgroundColor: "#121622", padding: "24px", borderRadius: "10px", border: "1px solid #2A3040" }}>
            <h3 style={{ color: "#FFF", fontSize: "18px", marginBottom: "16px" }}>Create Sellable SKU</h3>
            <form onSubmit={handleAddSku}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "4px" }}>SKU Code (e.g. PV-WHEY-CHOC-1KG)</label>
                <input
                  type="text"
                  required
                  value={skuForm.skuCode}
                  onChange={(e) => setSkuForm({ ...skuForm, skuCode: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "4px" }}>Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={skuForm.price}
                    onChange={(e) => setSkuForm({ ...skuForm, price: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "4px" }}>MRP / Compare (₹)</label>
                  <input
                    type="number"
                    value={skuForm.compareAtPrice}
                    onChange={(e) => setSkuForm({ ...skuForm, compareAtPrice: Number(e.target.value) })}
                    style={{ width: "100%", padding: "8px 12px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setIsSkuModalOpen(false)} style={{ padding: "8px 16px", backgroundColor: "#2A3040", color: "#FFF", borderRadius: "6px", border: "none" }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: "8px 16px", backgroundColor: "var(--color-accent)", color: "#000", fontWeight: "700", borderRadius: "6px", border: "none" }}>
                  Create SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEDIA MODAL */}
      {isMediaModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ maxWidth: "450px", width: "100%", backgroundColor: "#121622", padding: "24px", borderRadius: "10px", border: "1px solid #2A3040" }}>
            <h3 style={{ color: "#FFF", fontSize: "18px", marginBottom: "16px" }}>Add Product Media</h3>
            <form onSubmit={handleAddMedia}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "4px" }}>Media URL *</label>
                <input
                  type="text"
                  required
                  placeholder="/assets/product-catalog/whey_isolated.png"
                  value={mediaForm.url}
                  onChange={(e) => setMediaForm({ ...mediaForm, url: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "4px" }}>Alt Text</label>
                <input
                  type="text"
                  value={mediaForm.altText}
                  onChange={(e) => setMediaForm({ ...mediaForm, altText: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <input
                  type="checkbox"
                  id="primaryMediaCheck"
                  checked={mediaForm.isPrimary}
                  onChange={(e) => setMediaForm({ ...mediaForm, isPrimary: e.target.checked })}
                />
                <label htmlFor="primaryMediaCheck" style={{ fontSize: "13px", color: "#CBD5E1" }}>
                  Set as primary display image
                </label>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setIsMediaModalOpen(false)} style={{ padding: "8px 16px", backgroundColor: "#2A3040", color: "#FFF", borderRadius: "6px", border: "none" }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: "8px 16px", backgroundColor: "var(--color-accent)", color: "#000", fontWeight: "700", borderRadius: "6px", border: "none" }}>
                  Add Media
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ MODAL */}
      {isFaqModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ maxWidth: "500px", width: "100%", backgroundColor: "#121622", padding: "24px", borderRadius: "10px", border: "1px solid #2A3040" }}>
            <h3 style={{ color: "#FFF", fontSize: "18px", marginBottom: "16px" }}>Add Product FAQ</h3>
            <form onSubmit={handleAddFaq}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "4px" }}>Question *</label>
                <input
                  type="text"
                  required
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#94A3B8", marginBottom: "4px" }}>Answer *</label>
                <textarea
                  rows={3}
                  required
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", backgroundColor: "#0B0C0E", border: "1px solid #2A3040", borderRadius: "6px", color: "#FFF" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setIsFaqModalOpen(false)} style={{ padding: "8px 16px", backgroundColor: "#2A3040", color: "#FFF", borderRadius: "6px", border: "none" }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: "8px 16px", backgroundColor: "var(--color-accent)", color: "#000", fontWeight: "700", borderRadius: "6px", border: "none" }}>
                  Add FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
