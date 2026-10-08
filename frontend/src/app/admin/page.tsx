"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { adminProductApi } from "@/lib/api/adminProductApi";
import { categoryApi, Category, Subcategory, Brand } from "@/lib/api/categoryApi";
import { ProductSummary } from "@/lib/api/productApi";
import { inventoryApi, InventoryItem, InventoryMovement } from "@/lib/api/inventoryApi";

export default function AdminCataloguePage() {
  const { user, token, isAuthenticated, openAuthModal, quickLogin, can } = useAuth();
  const { showToast } = useStore();

  // Top-level Navigation Tab
  const [activeMainTab, setActiveMainTab] = useState<"PRODUCTS" | "CATEGORIES" | "SUBCATEGORIES" | "BRANDS" | "INVENTORY">("PRODUCTS");

  // Data States
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT" | "UNPUBLISHED">("ALL");
  const [inventoryFilter, setInventoryFilter] = useState<"ALL" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL");

  // Inventory Modals
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<"INCREASE" | "DECREASE">("INCREASE");
  const [adjustReason, setAdjustReason] = useState<string>("New shipment / Restock received");

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementsList, setMovementsList] = useState<InventoryMovement[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(false);

  // Product Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Category Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    sortOrder: 1,
    active: true,
  });

  // Subcategory Modals
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [subcategoryFormData, setSubcategoryFormData] = useState({
    categoryId: "",
    name: "",
    slug: "",
    description: "",
    sortOrder: 1,
    active: true,
  });

  // Brand Modals
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [brandFormData, setBrandFormData] = useState({
    name: "",
    slug: "",
    description: "",
    logoUrl: "",
    active: true,
  });

  // Product Form Fields
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

  const isStaff = isAuthenticated && (
    can("CATALOGUE_READ") ||
    can("USER_READ") ||
    can("INVENTORY_READ") ||
    can("ORDER_READ") ||
    can("CMS_READ")
  );

  // Fetch Products & Metadata
  const fetchData = useCallback(async () => {
    if (!token || !isStaff) return;
    setLoading(true);
    try {
      const [prodPage, cats, subs, b, inv] = await Promise.all([
        adminProductApi.listAdminProducts({ size: 50 }),
        categoryApi.adminListCategories().catch(() => categoryApi.listCategories()),
        categoryApi.adminListSubcategories().catch(() => categoryApi.listSubcategories()),
        categoryApi.adminListBrands().catch(() => categoryApi.listBrands()),
        inventoryApi.getInventoryList({ size: 50 }).catch(() => null),
      ]);

      setProducts(prodPage?.content || []);
      setCategories(cats || []);
      if (inv?.content) {
        setInventoryItems(inv.content);
      }
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

  const fetchInventory = useCallback(async () => {
    if (!token || !can("INVENTORY_READ")) return;
    setInventoryLoading(true);
    try {
      const res = await inventoryApi.getInventoryList({
        lowStockOnly: inventoryFilter === "LOW_STOCK" ? true : undefined,
        size: 50,
      });
      setInventoryItems(res?.content || []);
    } catch (err: any) {
      console.error("Error fetching inventory:", err);
    } finally {
      setInventoryLoading(false);
    }
  }, [token, can, inventoryFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (activeMainTab === "INVENTORY") {
      fetchInventory();
    }
  }, [activeMainTab, fetchInventory]);

  // Inventory Adjustment Action
  const handleOpenAdjustModal = (item: InventoryItem) => {
    setSelectedInventoryItem(item);
    setAdjustQuantity(10);
    setAdjustType("INCREASE");
    setAdjustReason("New shipment / Restock received");
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInventoryItem) return;
    setFormSubmitting(true);
    try {
      const finalQty = adjustType === "INCREASE" ? Math.abs(adjustQuantity) : -Math.abs(adjustQuantity);
      await inventoryApi.adjustStock(selectedInventoryItem.skuId, {
        adjustmentQuantity: finalQty,
        reason: adjustReason.trim(),
      });
      showToast(`Stock updated for SKU ${selectedInventoryItem.skuCode}!`);
      setIsAdjustModalOpen(false);
      fetchInventory();
    } catch (err: any) {
      showToast(err.message || "Failed to adjust stock");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Inventory Movements Action
  const handleOpenMovementsModal = async (item: InventoryItem) => {
    setSelectedInventoryItem(item);
    setIsMovementModalOpen(true);
    setMovementsLoading(true);
    try {
      const res = await inventoryApi.getMovementHistory(item.skuId, { size: 30 });
      setMovementsList(res?.content || []);
    } catch (err: any) {
      showToast(err.message || "Failed to load stock movements");
    } finally {
      setMovementsLoading(false);
    }
  };

  // Product Status Change
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

  // Delete Product
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

  // Name Auto Slug Helpers
  const generateSlug = (val: string) =>
    val.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({ ...prev, name, slug: generateSlug(name) }));
  };

  // Submit Create Product
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

  // Open Edit Product Modal
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

  // Submit Edit Product
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

  // Category Actions
  const handleOpenCategoryModal = (cat?: Category) => {
    if (cat) {
      setSelectedCategory(cat);
      setCategoryFormData({
        name: cat.name,
        slug: cat.slug,
        description: cat.description || "",
        imageUrl: cat.imageUrl || "",
        sortOrder: cat.sortOrder || 1,
        active: cat.active,
      });
    } else {
      setSelectedCategory(null);
      setCategoryFormData({
        name: "",
        slug: "",
        description: "",
        imageUrl: "",
        sortOrder: (categories.length || 0) + 1,
        active: true,
      });
    }
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      if (selectedCategory) {
        await categoryApi.adminUpdateCategory(selectedCategory.id, categoryFormData);
        showToast(`Category "${categoryFormData.name}" updated successfully!`);
      } else {
        await categoryApi.adminCreateCategory(categoryFormData);
        showToast(`Category "${categoryFormData.name}" created successfully!`);
      }
      setIsCategoryModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Error saving category");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to deactivate/delete Category "${name}"?`)) return;
    try {
      await categoryApi.adminDeleteCategory(id);
      showToast(`Category "${name}" removed/deactivated.`);
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Error deleting category");
    }
  };

  // Subcategory Actions
  const handleOpenSubcategoryModal = (sub?: Subcategory) => {
    if (sub) {
      setSelectedSubcategory(sub);
      setSubcategoryFormData({
        categoryId: sub.categoryId,
        name: sub.name,
        slug: sub.slug,
        description: sub.description || "",
        sortOrder: sub.sortOrder || 1,
        active: sub.active,
      });
    } else {
      setSelectedSubcategory(null);
      setSubcategoryFormData({
        categoryId: categories[0]?.id || "",
        name: "",
        slug: "",
        description: "",
        sortOrder: (subcategories.length || 0) + 1,
        active: true,
      });
    }
    setIsSubcategoryModalOpen(true);
  };

  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      if (selectedSubcategory) {
        await categoryApi.adminUpdateSubcategory(selectedSubcategory.id, subcategoryFormData);
        showToast(`Subcategory "${subcategoryFormData.name}" updated!`);
      } else {
        await categoryApi.adminCreateSubcategory(subcategoryFormData);
        showToast(`Subcategory "${subcategoryFormData.name}" created!`);
      }
      setIsSubcategoryModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Error saving subcategory");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteSubcategory = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to deactivate/delete Subcategory "${name}"?`)) return;
    try {
      await categoryApi.adminDeleteSubcategory(id);
      showToast(`Subcategory "${name}" removed/deactivated.`);
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Error deleting subcategory");
    }
  };

  // Brand Actions
  const handleOpenBrandModal = (brand?: Brand) => {
    if (brand) {
      setSelectedBrand(brand);
      setBrandFormData({
        name: brand.name,
        slug: brand.slug,
        description: brand.description || "",
        logoUrl: brand.logoUrl || "",
        active: brand.active,
      });
    } else {
      setSelectedBrand(null);
      setBrandFormData({
        name: "",
        slug: "",
        description: "",
        logoUrl: "",
        active: true,
      });
    }
    setIsBrandModalOpen(true);
  };

  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      if (selectedBrand) {
        await categoryApi.adminUpdateBrand(selectedBrand.id, brandFormData);
        showToast(`Brand "${brandFormData.name}" updated!`);
      } else {
        await categoryApi.adminCreateBrand(brandFormData);
        showToast(`Brand "${brandFormData.name}" created!`);
      }
      setIsBrandModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Error saving brand");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteBrand = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to deactivate/delete Brand "${name}"?`)) return;
    try {
      await categoryApi.adminDeleteBrand(id);
      showToast(`Brand "${name}" removed/deactivated.`);
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Error deleting brand");
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

  // Access Denied Screen
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
                ENTERPRISE CATALOGUE &amp; INVENTORY MANAGEMENT
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
                PHASE 3 ACTIVE
              </span>
            </div>
            <p style={{ fontSize: "13.5px", color: "#94A3B8", margin: 0 }}>
              Authenticated as <strong>{user?.firstName} {user?.lastName}</strong> ({user?.role}) • Full Categories, Brands, Products, Variants, SKUs, Media, Pricing &amp; Real-Time Inventory Control
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
            {activeMainTab === "PRODUCTS" && can("PRODUCT_CREATE") && (
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
            )}
            {activeMainTab === "CATEGORIES" && can("CATEGORY_CREATE") && (
              <button
                onClick={() => handleOpenCategoryModal()}
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
                }}
              >
                <span>+ NEW CATEGORY</span>
              </button>
            )}
            {activeMainTab === "SUBCATEGORIES" && can("SUBCATEGORY_CREATE") && (
              <button
                onClick={() => handleOpenSubcategoryModal()}
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
                }}
              >
                <span>+ NEW SUBCATEGORY</span>
              </button>
            )}
            {activeMainTab === "BRANDS" && can("BRAND_CREATE") && (
              <button
                onClick={() => handleOpenBrandModal()}
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
                }}
              >
                <span>+ NEW BRAND</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="site-container" style={{ marginTop: "28px" }}>
        {/* Metric Cards Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "24px" }}>
          <div
            onClick={() => setActiveMainTab("PRODUCTS")}
            style={{
              backgroundColor: "#141824",
              border: activeMainTab === "PRODUCTS" ? "1.5px solid var(--color-accent)" : "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "10px",
              padding: "16px",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: "12px", color: "#94A3B8", fontWeight: "700", marginBottom: "4px" }}>📦 TOTAL PRODUCTS</div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#FFF" }}>{products.length}</div>
          </div>
          <div
            onClick={() => setActiveMainTab("CATEGORIES")}
            style={{
              backgroundColor: "#141824",
              border: activeMainTab === "CATEGORIES" ? "1.5px solid var(--color-accent)" : "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "10px",
              padding: "16px",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: "12px", color: "#10B981", fontWeight: "700", marginBottom: "4px" }}>🏷️ CATEGORIES</div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#10B981" }}>{categories.length}</div>
          </div>
          <div
            onClick={() => setActiveMainTab("SUBCATEGORIES")}
            style={{
              backgroundColor: "#141824",
              border: activeMainTab === "SUBCATEGORIES" ? "1.5px solid var(--color-accent)" : "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "10px",
              padding: "16px",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: "12px", color: "#F59E0B", fontWeight: "700", marginBottom: "4px" }}>📑 SUBCATEGORIES</div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#F59E0B" }}>{subcategories.length}</div>
          </div>
          <div
            onClick={() => setActiveMainTab("BRANDS")}
            style={{
              backgroundColor: "#141824",
              border: activeMainTab === "BRANDS" ? "1.5px solid var(--color-accent)" : "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "10px",
              padding: "16px",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: "12px", color: "#38BDF8", fontWeight: "700", marginBottom: "4px" }}>🏢 BRANDS</div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#38BDF8" }}>{brands.length}</div>
          </div>
          {can("INVENTORY_READ") && (
            <div
              onClick={() => setActiveMainTab("INVENTORY")}
              style={{
                backgroundColor: "#141824",
                border: activeMainTab === "INVENTORY" ? "1.5px solid var(--color-accent)" : "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "10px",
                padding: "16px",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: "12px", color: "#EC4899", fontWeight: "700", marginBottom: "4px" }}>📊 LIVE INVENTORY</div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#EC4899" }}>
                {inventoryItems.length} <span style={{ fontSize: "14px", fontWeight: "500", color: "#94A3B8" }}>SKUs</span>
              </div>
            </div>
          )}
        </div>

        {/* Top-Level Section Navigation Bar */}
        <div
          style={{
            backgroundColor: "#141824",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "10px",
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
            marginBottom: "20px",
          }}
        >
          {/* Main Tabs */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {(["PRODUCTS", "CATEGORIES", "SUBCATEGORIES", "BRANDS", ...(can("INVENTORY_READ") ? ["INVENTORY" as const] : [])] as Array<"PRODUCTS" | "CATEGORIES" | "SUBCATEGORIES" | "BRANDS" | "INVENTORY">).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveMainTab(tab)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  fontSize: "12.5px",
                  fontWeight: "800",
                  cursor: "pointer",
                  backgroundColor: activeMainTab === tab ? "var(--color-accent)" : "rgba(255, 255, 255, 0.05)",
                  color: activeMainTab === tab ? "#0B0C0E" : "#94A3B8",
                  border: activeMainTab === tab ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
                  transition: "all 0.15s ease",
                }}
              >
                {tab === "PRODUCTS"
                  ? "📦 Products"
                  : tab === "CATEGORIES"
                  ? "🏷️ Categories"
                  : tab === "SUBCATEGORIES"
                  ? "📑 Subcategories"
                  : tab === "BRANDS"
                  ? "🏢 Brands"
                  : "📊 Inventory"}
              </button>
            ))}
          </div>

          {/* Search Box & Refresh */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {activeMainTab === "PRODUCTS" && (
              <div style={{ display: "flex", gap: "6px" }}>
                {(["ALL", "PUBLISHED", "DRAFT", "UNPUBLISHED"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                      backgroundColor: statusFilter === tab ? "rgba(245, 158, 11, 0.2)" : "transparent",
                      color: statusFilter === tab ? "#FBBF24" : "#64748B",
                      border: statusFilter === tab ? "1px solid #F59E0B" : "1px solid transparent",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}

            {activeMainTab === "INVENTORY" && (
              <div style={{ display: "flex", gap: "6px" }}>
                {(["ALL", "LOW_STOCK", "OUT_OF_STOCK"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setInventoryFilter(tab)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                      backgroundColor: inventoryFilter === tab ? "rgba(236, 72, 153, 0.2)" : "transparent",
                      color: inventoryFilter === tab ? "#F472B6" : "#64748B",
                      border: inventoryFilter === tab ? "1px solid #EC4899" : "1px solid transparent",
                    }}
                  >
                    {tab === "ALL" ? "All SKUs" : tab === "LOW_STOCK" ? "⚠️ Low Stock" : "🚫 Out of Stock"}
                  </button>
                ))}
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#0D1016",
                border: "1px solid #2B3342",
                borderRadius: "8px",
                padding: "0 12px",
                height: "38px",
                width: "220px",
              }}
            >
              <span style={{ marginRight: "8px", color: "#64748B" }}>🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
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
              onClick={() => {
                fetchData();
                if (activeMainTab === "INVENTORY") fetchInventory();
              }}
              title="Refresh Data from Server"
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

        {/* ============================================================= */}
        {/* TAB 1: PRODUCTS TABLE                                          */}
        {/* ============================================================= */}
        {activeMainTab === "PRODUCTS" && (
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

                          <td style={{ padding: "14px 18px" }}>
                            <div style={{ color: "#FFF", fontWeight: "700" }}>{p.categoryName || "General"}</div>
                            <div style={{ fontSize: "12px", color: "#94A3B8" }}>
                              Sub: {p.subcategoryName || "—"} | Brand: {p.brandName || "PROVANA"}
                            </div>
                          </td>

                          <td style={{ padding: "14px 18px" }}>
                            <div style={{ fontWeight: "800", color: "#FFF" }}>₹{p.startingPrice?.toLocaleString("en-IN")}</div>
                            {p.compareAtPrice && p.compareAtPrice > p.startingPrice && (
                              <div style={{ fontSize: "11.5px", color: "#64748B", textDecoration: "line-through" }}>
                                ₹{p.compareAtPrice?.toLocaleString("en-IN")}
                              </div>
                            )}
                          </td>

                          <td style={{ padding: "14px 18px" }}>
                            <select
                              value={p.status}
                              disabled={!can("PRODUCT_UPDATE") && !can("PRODUCT_PUBLISH")}
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
                                cursor: can("PRODUCT_UPDATE") || can("PRODUCT_PUBLISH") ? "pointer" : "default",
                                opacity: can("PRODUCT_UPDATE") || can("PRODUCT_PUBLISH") ? 1 : 0.7,
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
                              {can("PRODUCT_UPDATE") && (
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
                              )}
                              {can("PRODUCT_UPDATE") && (
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
                              )}
                              {can("PRODUCT_DELETE") && (
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
                              )}
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
        )}

        {/* ============================================================= */}
        {/* TAB 2: CATEGORIES TABLE                                       */}
        {/* ============================================================= */}
        {activeMainTab === "CATEGORIES" && (
          <div
            style={{
              backgroundColor: "#141824",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
              <thead>
                <tr style={{ backgroundColor: "#0F131D", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#94A3B8", fontSize: "11.5px", textTransform: "uppercase" }}>
                  <th style={{ padding: "14px 18px" }}>Category Name</th>
                  <th style={{ padding: "14px 18px" }}>Slug</th>
                  <th style={{ padding: "14px 18px" }}>Sort Order</th>
                  <th style={{ padding: "14px 18px" }}>Status</th>
                  <th style={{ padding: "14px 18px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <td style={{ padding: "14px 18px", fontWeight: "800", color: "#FFF" }}>{cat.name}</td>
                    <td style={{ padding: "14px 18px", fontFamily: "monospace", color: "#64748B" }}>{cat.slug}</td>
                    <td style={{ padding: "14px 18px", color: "#94A3B8" }}>{cat.sortOrder}</td>
                    <td style={{ padding: "14px 18px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          backgroundColor: cat.active ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                          color: cat.active ? "#10B981" : "#EF4444",
                        }}
                      >
                        {cat.active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        {can("CATEGORY_UPDATE") && (
                          <button
                            onClick={() => handleOpenCategoryModal(cat)}
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
                        )}
                        {can("CATEGORY_DELETE") && (
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
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
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 3: SUBCATEGORIES TABLE                                    */}
        {/* ============================================================= */}
        {activeMainTab === "SUBCATEGORIES" && (
          <div
            style={{
              backgroundColor: "#141824",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
              <thead>
                <tr style={{ backgroundColor: "#0F131D", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#94A3B8", fontSize: "11.5px", textTransform: "uppercase" }}>
                  <th style={{ padding: "14px 18px" }}>Subcategory</th>
                  <th style={{ padding: "14px 18px" }}>Parent Category</th>
                  <th style={{ padding: "14px 18px" }}>Slug</th>
                  <th style={{ padding: "14px 18px" }}>Status</th>
                  <th style={{ padding: "14px 18px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subcategories.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <td style={{ padding: "14px 18px", fontWeight: "800", color: "#FFF" }}>{sub.name}</td>
                    <td style={{ padding: "14px 18px", color: "var(--color-accent)", fontWeight: "700" }}>{sub.categoryName || "—"}</td>
                    <td style={{ padding: "14px 18px", fontFamily: "monospace", color: "#64748B" }}>{sub.slug}</td>
                    <td style={{ padding: "14px 18px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          backgroundColor: sub.active ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                          color: sub.active ? "#10B981" : "#EF4444",
                        }}
                      >
                        {sub.active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        {can("SUBCATEGORY_UPDATE") && (
                          <button
                            onClick={() => handleOpenSubcategoryModal(sub)}
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
                        )}
                        {can("SUBCATEGORY_DELETE") && (
                          <button
                            onClick={() => handleDeleteSubcategory(sub.id, sub.name)}
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
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 4: BRANDS TABLE                                           */}
        {/* ============================================================= */}
        {activeMainTab === "BRANDS" && (
          <div
            style={{
              backgroundColor: "#141824",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
              <thead>
                <tr style={{ backgroundColor: "#0F131D", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#94A3B8", fontSize: "11.5px", textTransform: "uppercase" }}>
                  <th style={{ padding: "14px 18px" }}>Brand Name</th>
                  <th style={{ padding: "14px 18px" }}>Slug</th>
                  <th style={{ padding: "14px 18px" }}>Status</th>
                  <th style={{ padding: "14px 18px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((b) => (
                  <tr key={b.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <td style={{ padding: "14px 18px", fontWeight: "800", color: "#FFF" }}>{b.name}</td>
                    <td style={{ padding: "14px 18px", fontFamily: "monospace", color: "#64748B" }}>{b.slug}</td>
                    <td style={{ padding: "14px 18px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          backgroundColor: b.active ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                          color: b.active ? "#10B981" : "#EF4444",
                        }}
                      >
                        {b.active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        {can("BRAND_UPDATE") && (
                          <button
                            onClick={() => handleOpenBrandModal(b)}
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
                        )}
                        {can("BRAND_DELETE") && (
                          <button
                            onClick={() => handleDeleteBrand(b.id, b.name)}
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
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 5: INVENTORY TABLE                                        */}
        {/* ============================================================= */}
        {activeMainTab === "INVENTORY" && (
          <div
            style={{
              backgroundColor: "#141824",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {inventoryLoading ? (
              <div style={{ padding: "60px", textAlign: "center", color: "#94A3B8" }}>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>⏳</div>
                <div>Fetching live inventory states &amp; movements...</div>
              </div>
            ) : inventoryItems.length === 0 ? (
              <div style={{ padding: "60px", textAlign: "center", color: "#94A3B8" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>📊</div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#FFF", marginBottom: "6px" }}>
                  No SKUs Found in Inventory
                </div>
                <div style={{ fontSize: "13px" }}>Create products with variants &amp; SKUs to begin tracking live stock.</div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#0F131D", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#94A3B8", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      <th style={{ padding: "14px 18px" }}>SKU CODE &amp; BARCODE</th>
                      <th style={{ padding: "14px 18px" }}>PRODUCT &amp; VARIANT</th>
                      <th style={{ padding: "14px 18px" }}>AVAILABLE</th>
                      <th style={{ padding: "14px 18px" }}>RESERVED</th>
                      <th style={{ padding: "14px 18px" }}>SELLABLE</th>
                      <th style={{ padding: "14px 18px" }}>THRESHOLD</th>
                      <th style={{ padding: "14px 18px" }}>STATUS</th>
                      <th style={{ padding: "14px 18px", textAlign: "right" }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryItems
                      .filter((item) => {
                        const matchesSearch =
                          !searchQuery ||
                          item.skuCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.variantName?.toLowerCase().includes(searchQuery.toLowerCase());
                        const matchesFilter =
                          inventoryFilter === "ALL" ||
                          (inventoryFilter === "LOW_STOCK" && (item.isLowStock || item.availableQuantity <= item.lowStockThreshold)) ||
                          (inventoryFilter === "OUT_OF_STOCK" && (item.isOutOfStock || item.availableQuantity <= 0));
                        return matchesSearch && matchesFilter;
                      })
                      .map((item) => {
                        const isOutOfStock = item.isOutOfStock || item.availableQuantity <= 0;
                        const isLowStock = !isOutOfStock && (item.isLowStock || item.availableQuantity <= item.lowStockThreshold);
                        const statusBadgeBg = isOutOfStock
                          ? "rgba(239, 68, 68, 0.15)"
                          : isLowStock
                          ? "rgba(245, 158, 11, 0.15)"
                          : "rgba(16, 185, 129, 0.15)";
                        const statusBadgeColor = isOutOfStock ? "#EF4444" : isLowStock ? "#FBBF24" : "#10B981";
                        const statusText = isOutOfStock ? "OUT OF STOCK" : isLowStock ? "LOW STOCK" : "IN STOCK";

                        return (
                          <tr
                            key={item.id}
                            style={{
                              borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                              transition: "background 0.15s ease",
                            }}
                          >
                            <td style={{ padding: "14px 18px" }}>
                              <div style={{ fontFamily: "monospace", fontWeight: "800", color: "var(--color-accent)", fontSize: "13px" }}>
                                {item.skuCode}
                              </div>
                            </td>
                            <td style={{ padding: "14px 18px" }}>
                              <div style={{ color: "#FFF", fontWeight: "700" }}>{item.productName || "Product SKU"}</div>
                              <div style={{ fontSize: "12px", color: "#94A3B8" }}>
                                {item.variantName || "Standard Variant"}
                              </div>
                            </td>
                            <td style={{ padding: "14px 18px" }}>
                              <div style={{ fontWeight: "800", fontSize: "15px", color: isOutOfStock ? "#EF4444" : "#FFF" }}>
                                {item.availableQuantity}
                              </div>
                            </td>
                            <td style={{ padding: "14px 18px" }}>
                              <div style={{ fontWeight: "600", color: "#94A3B8" }}>{item.reservedQuantity}</div>
                            </td>
                            <td style={{ padding: "14px 18px" }}>
                              <div style={{ fontWeight: "800", color: "#38BDF8" }}>
                                {item.sellableQuantity !== undefined ? item.sellableQuantity : Math.max(0, item.availableQuantity - item.reservedQuantity)}
                              </div>
                            </td>
                            <td style={{ padding: "14px 18px" }}>
                              <div style={{ color: "#CBD5E1", fontSize: "12.5px" }}>{item.lowStockThreshold} units</div>
                            </td>
                            <td style={{ padding: "14px 18px" }}>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "800",
                                  padding: "3px 8px",
                                  borderRadius: "4px",
                                  backgroundColor: statusBadgeBg,
                                  color: statusBadgeColor,
                                  border: `1px solid ${statusBadgeColor}44`,
                                }}
                              >
                                {statusText}
                              </span>
                            </td>
                            <td style={{ padding: "14px 18px", textAlign: "right" }}>
                              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                {(can("INVENTORY_ADJUST") || can("INVENTORY_UPDATE")) && (
                                  <button
                                    onClick={() => handleOpenAdjustModal(item)}
                                    title="Adjust Stock Quantity"
                                    style={{
                                      padding: "6px 12px",
                                      borderRadius: "6px",
                                      backgroundColor: "rgba(236, 72, 153, 0.15)",
                                      border: "1px solid rgba(236, 72, 153, 0.35)",
                                      color: "#F472B6",
                                      fontSize: "12px",
                                      fontWeight: "700",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px",
                                    }}
                                  >
                                    ⚡ Adjust
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenMovementsModal(item)}
                                  title="View Movement Audit History"
                                  style={{
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                                    border: "1px solid rgba(255, 255, 255, 0.12)",
                                    color: "#CBD5E1",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  📜 History
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
        )}
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
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
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                    BRAND *
                  </label>
                  <select
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                    style={{ width: "100%", height: "42px", padding: "0 10px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF", fontSize: "13px" }}
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
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

      {/* ================================================================= */}
      {/* CATEGORY CREATE/EDIT MODAL                                        */}
      {/* ================================================================= */}
      {isCategoryModalOpen && (
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
            if (e.target === e.currentTarget) setIsCategoryModalOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: "#141824",
              border: "1.5px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "500px",
              padding: "24px",
              color: "#FFF",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className="font-display" style={{ fontSize: "20px", margin: 0 }}>
                {selectedCategory ? `EDIT CATEGORY: ${selectedCategory.name}` : "CREATE NEW CATEGORY"}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>
            <form onSubmit={handleCategorySubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>NAME *</label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value, slug: generateSlug(e.target.value) })}
                  required
                  style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>SLUG *</label>
                <input
                  type="text"
                  value={categoryFormData.slug}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                  required
                  style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF", fontFamily: "monospace" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>SORT ORDER</label>
                  <input
                    type="number"
                    value={categoryFormData.sortOrder}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, sortOrder: parseInt(e.target.value) || 1 })}
                    style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>ACTIVE</label>
                  <select
                    value={categoryFormData.active ? "true" : "false"}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, active: e.target.value === "true" })}
                    style={{ width: "100%", height: "40px", padding: "0 10px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF" }}
                  >
                    <option value="true">YES (Active)</option>
                    <option value="false">NO (Inactive)</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} style={{ flex: 1, height: "42px", borderRadius: "6px", backgroundColor: "#252B37", color: "#FFF", fontWeight: "700", border: "none" }}>Cancel</button>
                <button type="submit" disabled={formSubmitting} style={{ flex: 2, height: "42px", borderRadius: "6px", backgroundColor: "var(--color-accent)", color: "#0B0C0E", fontWeight: "800", border: "none" }}>
                  {formSubmitting ? "Saving..." : selectedCategory ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* SUBCATEGORY CREATE/EDIT MODAL                                     */}
      {/* ================================================================= */}
      {isSubcategoryModalOpen && (
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
            if (e.target === e.currentTarget) setIsSubcategoryModalOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: "#141824",
              border: "1.5px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "500px",
              padding: "24px",
              color: "#FFF",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className="font-display" style={{ fontSize: "20px", margin: 0 }}>
                {selectedSubcategory ? `EDIT SUBCATEGORY: ${selectedSubcategory.name}` : "CREATE SUBCATEGORY"}
              </h3>
              <button onClick={() => setIsSubcategoryModalOpen(false)} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>
            <form onSubmit={handleSubcategorySubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>PARENT CATEGORY *</label>
                <select
                  value={subcategoryFormData.categoryId}
                  onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, categoryId: e.target.value })}
                  required
                  style={{ width: "100%", height: "40px", padding: "0 10px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF" }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>NAME *</label>
                <input
                  type="text"
                  value={subcategoryFormData.name}
                  onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, name: e.target.value, slug: generateSlug(e.target.value) })}
                  required
                  style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>SLUG *</label>
                <input
                  type="text"
                  value={subcategoryFormData.slug}
                  onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, slug: e.target.value })}
                  required
                  style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF", fontFamily: "monospace" }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setIsSubcategoryModalOpen(false)} style={{ flex: 1, height: "42px", borderRadius: "6px", backgroundColor: "#252B37", color: "#FFF", fontWeight: "700", border: "none" }}>Cancel</button>
                <button type="submit" disabled={formSubmitting} style={{ flex: 2, height: "42px", borderRadius: "6px", backgroundColor: "var(--color-accent)", color: "#0B0C0E", fontWeight: "800", border: "none" }}>
                  {formSubmitting ? "Saving..." : selectedSubcategory ? "Update Subcategory" : "Create Subcategory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* BRAND CREATE/EDIT MODAL                                           */}
      {/* ================================================================= */}
      {isBrandModalOpen && (
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
            if (e.target === e.currentTarget) setIsBrandModalOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: "#141824",
              border: "1.5px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "500px",
              padding: "24px",
              color: "#FFF",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className="font-display" style={{ fontSize: "20px", margin: 0 }}>
                {selectedBrand ? `EDIT BRAND: ${selectedBrand.name}` : "CREATE NEW BRAND"}
              </h3>
              <button onClick={() => setIsBrandModalOpen(false)} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>
            <form onSubmit={handleBrandSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>BRAND NAME *</label>
                <input
                  type="text"
                  value={brandFormData.name}
                  onChange={(e) => setBrandFormData({ ...brandFormData, name: e.target.value, slug: generateSlug(e.target.value) })}
                  required
                  style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>SLUG *</label>
                <input
                  type="text"
                  value={brandFormData.slug}
                  onChange={(e) => setBrandFormData({ ...brandFormData, slug: e.target.value })}
                  required
                  style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF", fontFamily: "monospace" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={brandFormData.description}
                  onChange={(e) => setBrandFormData({ ...brandFormData, description: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", backgroundColor: "#0D1016", border: "1px solid #2B3342", color: "#FFF" }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setIsBrandModalOpen(false)} style={{ flex: 1, height: "42px", borderRadius: "6px", backgroundColor: "#252B37", color: "#FFF", fontWeight: "700", border: "none" }}>Cancel</button>
                <button type="submit" disabled={formSubmitting} style={{ flex: 2, height: "42px", borderRadius: "6px", backgroundColor: "var(--color-accent)", color: "#0B0C0E", fontWeight: "800", border: "none" }}>
                  {formSubmitting ? "Saving..." : selectedBrand ? "Update Brand" : "Create Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* INVENTORY STOCK ADJUSTMENT MODAL                                  */}
      {/* ================================================================= */}
      {isAdjustModalOpen && selectedInventoryItem && (
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
            if (e.target === e.currentTarget) setIsAdjustModalOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: "#141824",
              border: "1.5px solid rgba(236, 72, 153, 0.35)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              padding: "28px",
              color: "#FFF",
              boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "22px" }}>⚡</span>
                <h3 className="font-display" style={{ fontSize: "20px", margin: 0, letterSpacing: "0.5px" }}>
                  ADJUST STOCK LEVEL
                </h3>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                style={{ background: "none", border: "none", color: "#94A3B8", fontSize: "18px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ backgroundColor: "#0D1016", border: "1px solid #2B3342", borderRadius: "8px", padding: "14px", marginBottom: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", color: "#94A3B8" }}>SKU Code:</span>
                <span style={{ fontFamily: "monospace", fontWeight: "800", color: "var(--color-accent)", fontSize: "13px" }}>
                  {selectedInventoryItem.skuCode}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", color: "#94A3B8" }}>Product / Variant:</span>
                <span style={{ fontSize: "12.5px", color: "#FFF", fontWeight: "600" }}>
                  {selectedInventoryItem.productName || "Product"} ({selectedInventoryItem.variantName || "Standard"})
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "#94A3B8" }}>Current Available Stock:</span>
                <span style={{ fontSize: "14px", fontWeight: "800", color: selectedInventoryItem.availableQuantity > 0 ? "#10B981" : "#EF4444" }}>
                  {selectedInventoryItem.availableQuantity} units
                </span>
              </div>
            </div>

            <form onSubmit={handleAdjustSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#CBD5E1", marginBottom: "6px" }}>
                  ADJUSTMENT DIRECTION *
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType("INCREASE");
                      setAdjustReason("New shipment / Restock received");
                    }}
                    style={{
                      height: "40px",
                      borderRadius: "6px",
                      fontWeight: "800",
                      fontSize: "12.5px",
                      cursor: "pointer",
                      backgroundColor: adjustType === "INCREASE" ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.05)",
                      border: adjustType === "INCREASE" ? "1.5px solid #10B981" : "1px solid rgba(255, 255, 255, 0.1)",
                      color: adjustType === "INCREASE" ? "#10B981" : "#94A3B8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <span>➕ Increase Stock</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType("DECREASE");
                      setAdjustReason("Inventory audit / Damaged item removal");
                    }}
                    style={{
                      height: "40px",
                      borderRadius: "6px",
                      fontWeight: "800",
                      fontSize: "12.5px",
                      cursor: "pointer",
                      backgroundColor: adjustType === "DECREASE" ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.05)",
                      border: adjustType === "DECREASE" ? "1.5px solid #EF4444" : "1px solid rgba(255, 255, 255, 0.1)",
                      color: adjustType === "DECREASE" ? "#EF4444" : "#94A3B8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <span>➖ Decrease Stock</span>
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                  QUANTITY ({adjustType === "INCREASE" ? "+ units" : "- units"}) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={adjustType === "DECREASE" ? selectedInventoryItem.availableQuantity : 100000}
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  required
                  style={{
                    width: "100%",
                    height: "42px",
                    padding: "0 12px",
                    borderRadius: "6px",
                    backgroundColor: "#0D1016",
                    border: "1px solid #2B3342",
                    color: "#FFF",
                    fontSize: "14px",
                    fontWeight: "700",
                  }}
                />
                <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "4px" }}>
                  Projected stock:{" "}
                  <strong style={{ color: "#FFF" }}>
                    {adjustType === "INCREASE"
                      ? selectedInventoryItem.availableQuantity + adjustQuantity
                      : Math.max(0, selectedInventoryItem.availableQuantity - adjustQuantity)}{" "}
                    units
                  </strong>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: "700", color: "#CBD5E1", marginBottom: "4px" }}>
                  REASON / AUDIT NOTE *
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Warehouse receipt #PO-9481, physical count correction"
                  required
                  style={{
                    width: "100%",
                    height: "42px",
                    padding: "0 12px",
                    borderRadius: "6px",
                    backgroundColor: "#0D1016",
                    border: "1px solid #2B3342",
                    color: "#FFF",
                    fontSize: "13px",
                  }}
                />
              </div>

              {adjustType === "DECREASE" && (
                <div
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "6px",
                    padding: "10px 14px",
                    fontSize: "12px",
                    color: "#FCA5A5",
                    lineHeight: "1.5",
                  }}
                >
                  ⚠️ <strong>Warning:</strong> Decreasing stock creates an immutable audit record and immediately impacts customer checkout availability.
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  style={{ flex: 1, height: "42px", borderRadius: "6px", backgroundColor: "#252B37", color: "#FFF", fontWeight: "700", border: "none", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  style={{
                    flex: 2,
                    height: "42px",
                    borderRadius: "6px",
                    backgroundColor: adjustType === "INCREASE" ? "#10B981" : "#EF4444",
                    color: "#FFF",
                    fontWeight: "800",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
                  }}
                >
                  {formSubmitting ? "Updating Stock..." : adjustType === "INCREASE" ? "Confirm Stock Increase" : "Confirm Stock Decrease"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* INVENTORY MOVEMENTS AUDIT HISTORY MODAL                           */}
      {/* ================================================================= */}
      {isMovementModalOpen && selectedInventoryItem && (
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
            if (e.target === e.currentTarget) setIsMovementModalOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: "#141824",
              border: "1.5px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "760px",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              padding: "24px",
              color: "#FFF",
              boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "22px" }}>📜</span>
                  <h3 className="font-display" style={{ fontSize: "20px", margin: 0 }}>
                    STOCK MOVEMENT AUDIT TRAIL
                  </h3>
                </div>
                <div style={{ fontSize: "12.5px", color: "#94A3B8", marginTop: "4px" }}>
                  SKU: <strong style={{ color: "var(--color-accent)", fontFamily: "monospace" }}>{selectedInventoryItem.skuCode}</strong> • {selectedInventoryItem.productName || "Product"}
                </div>
              </div>
              <button
                onClick={() => setIsMovementModalOpen(false)}
                style={{ background: "none", border: "none", color: "#94A3B8", fontSize: "18px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px" }}>
              {movementsLoading ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏳</div>
                  <div>Loading stock history...</div>
                </div>
              ) : movementsList.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>📭</div>
                  <div>No movements recorded yet for this SKU.</div>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#0D1016", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#94A3B8", fontSize: "11px", textTransform: "uppercase" }}>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>DATE / TIME</th>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>TYPE</th>
                      <th style={{ padding: "10px 14px", textAlign: "center" }}>QTY</th>
                      <th style={{ padding: "10px 14px", textAlign: "center" }}>BEFORE → AFTER</th>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>REASON / USER</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movementsList.map((m) => {
                      const isPositive = m.quantity > 0 || m.movementType.includes("INCREASE") || m.movementType.includes("IN");
                      return (
                        <tr key={m.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                          <td style={{ padding: "10px 14px", color: "#94A3B8", fontSize: "11.5px" }}>
                            {m.createdAt ? new Date(m.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "—"}
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <span
                              style={{
                                fontSize: "10.5px",
                                fontWeight: "800",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                backgroundColor: isPositive ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                color: isPositive ? "#10B981" : "#EF4444",
                              }}
                            >
                              {m.movementType}
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "center", fontWeight: "800", color: isPositive ? "#10B981" : "#EF4444" }}>
                            {isPositive ? `+${m.quantity}` : m.quantity}
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "center", fontFamily: "monospace", color: "#CBD5E1" }}>
                            {m.previousQuantity} → <strong style={{ color: "#FFF" }}>{m.newQuantity}</strong>
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <div style={{ color: "#FFF", fontSize: "12px" }}>{m.reason || "Manual Adjustment"}</div>
                            <div style={{ fontSize: "10.5px", color: "#64748B" }}>By: {m.performedBy || "System"}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setIsMovementModalOpen(false)}
                style={{
                  height: "38px",
                  padding: "0 20px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  color: "#FFF",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
