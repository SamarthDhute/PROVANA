"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PROVANA_PRODUCTS } from "@/data/products";
import ProductCard from "@/components/catalog/ProductCard";
import { productApi, mapBackendProductSummaryToProduct } from "@/lib/api/productApi";
import { Product } from "@/types";

const CATEGORIES = [
  "All",
  "Protein",
  "Creatine",
  "Pre-Workout",
  "Performance",
  "Weight Management",
  "Healthy Foods",
  "Gym Accessories",
];

const GOALS = [
  "All",
  "Build Lean Muscle",
  "Boost Performance",
  "Daily Nutrition",
  "Healthy Snacking",
];

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialGoal = searchParams.get("goal") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedGoal, setSelectedGoal] = useState(initialGoal);
  const [selectedSort, setSelectedSort] = useState("featured");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [liveProducts, setLiveProducts] = useState<Product[] | null>(null);

  // Load live catalogue from Spring Boot backend
  useEffect(() => {
    productApi
      .listProducts({ size: 100 })
      .then((res) => {
        if (res?.content && res.content.length > 0) {
          setLiveProducts(res.content.map(mapBackendProductSummaryToProduct));
        }
      })
      .catch((err) => {
        console.warn("Backend product API unavailable, using offline fallback:", err);
      });
  }, []);

  // Sync state whenever URL searchParams change (e.g. from Header navigation)
  useEffect(() => {
    const cat = searchParams.get("category");
    const goal = searchParams.get("goal");
    const search = searchParams.get("search");

    queueMicrotask(() => {
      setSelectedCategory(cat || "All");
      setSelectedGoal(goal || "All");
      if (search !== null) {
        setSearchQuery(search);
      }
    });
  }, [searchParams]);

  const sourceProducts = liveProducts || PROVANA_PRODUCTS;

  // Multi-Filter & Sort Pipeline
  const filteredProducts = useMemo(() => {
    return sourceProducts.filter((prod) => {
      // Category filter
      if (selectedCategory !== "All") {
        if (selectedCategory === "Performance") {
          if (!["Performance", "Pre-Workout", "Creatine"].includes(prod.category)) return false;
        } else if (selectedCategory === "Pre-Workout") {
          if (!["Pre-Workout", "Performance"].includes(prod.category)) return false;
        } else if (selectedCategory === "Gym Accessories") {
          if (!["Gym Accessories", "Accessories"].includes(prod.category)) return false;
        } else if (prod.category !== selectedCategory) {
          return false;
        }
      }

      // Goal filter
      if (selectedGoal !== "All" && prod.goal !== selectedGoal) {
        return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesName = prod.name.toLowerCase().includes(q);
        const matchesCat = prod.category.toLowerCase().includes(q);
        const matchesHighlight = prod.highlight.toLowerCase().includes(q);
        const matchesFlavors = prod.flavors.some((f) => f.toLowerCase().includes(q));
        if (!matchesName && !matchesCat && !matchesHighlight && !matchesFlavors) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (selectedSort === "price-low") return a.price - b.price;
      if (selectedSort === "price-high") return b.price - a.price;
      if (selectedSort === "rating") return b.rating - a.rating;
      return 0; // featured default
    });
  }, [selectedCategory, selectedGoal, selectedSort, searchQuery]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    if (typeof window !== "undefined") {
      const url = cat === "All" ? "/products" : `/products?category=${encodeURIComponent(cat)}`;
      window.history.replaceState(null, "", url);
    }
  };

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedGoal("All");
    setSelectedSort("featured");
    setSearchQuery("");
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/products");
    }
  };

  return (
    <div style={{ padding: "40px 0 80px", minHeight: "80vh" }}>
      <div className="site-container">
        {/* Breadcrumb & Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--color-text-muted)" }}>
            <Link href="/" style={{ color: "#CBD5E1" }}>Home</Link>
            <span>/</span>
            <span style={{ color: "var(--color-accent)", fontWeight: "700" }}>All Products</span>
          </div>

          <Link
            href="/"
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#CBD5E1",
              backgroundColor: "#161B24",
              border: "1px solid var(--color-border)",
              padding: "6px 14px",
              borderRadius: "4px",
            }}
          >
            ← Back to Store Home
          </Link>
        </div>

        {/* Section Heading */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--color-accent)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "6px" }}>
            THE PROVANA CATALOG
          </div>
          <h1 className="font-display" style={{ fontSize: "44px", color: "#FFF", letterSpacing: "1.5px", lineHeight: 1.1 }}>
            ALL SPORTS NUTRITION &amp; PERFORMANCE ESSENTIALS
          </h1>
          <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginTop: "6px", maxWidth: "700px" }}>
            Micro-filtered cold CFM whey isolates, micronized Creapure® creatine, and precision macro fuel formulated without fillers or banned substances.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1.5px solid var(--color-border)",
            borderRadius: "var(--radius-card)",
            padding: "20px",
            marginBottom: "32px",
          }}
        >
          {/* Category Filter Pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "9999px",
                    fontSize: "12.5px",
                    fontWeight: "800",
                    letterSpacing: "0.4px",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    backgroundColor: active ? "var(--color-accent)" : "#161A24",
                    color: active ? "#0B0C0E" : "#CBD5E1",
                    border: `1px solid ${active ? "var(--color-accent)" : "#262C3A"}`,
                    transition: "all var(--motion-fast)",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search, Goal & Sort Controls */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", alignItems: "center" }}>
            {/* Search Input */}
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, flavors, specs..."
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 14px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  backgroundColor: "#0D1016",
                  border: "1px solid #2B3342",
                  color: "#FFF",
                }}
              />
            </div>

            {/* Goal Select */}
            <div>
              <select
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 14px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  backgroundColor: "#0D1016",
                  border: "1px solid #2B3342",
                  color: "#FFF",
                  cursor: "pointer",
                }}
              >
                <option value="All">All Fitness Goals</option>
                {GOALS.filter((g) => g !== "All").map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 14px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  backgroundColor: "#0D1016",
                  border: "1px solid #2B3342",
                  color: "#FFF",
                  cursor: "pointer",
                }}
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>

            {/* Live Count & Reset */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span
                style={{
                  backgroundColor: "#161B24",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontSize: "12.5px",
                  fontWeight: "700",
                  color: "#CBD5E1",
                }}
              >
                Showing {filteredProducts.length} Products
              </span>
              <button
                onClick={resetFilters}
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "var(--color-accent)",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--color-text-muted)" }}>
            <div style={{ fontSize: "48px", marginBottom: "14px" }}>🔍</div>
            <h3 style={{ color: "#FFF", fontSize: "20px", fontWeight: "800", marginBottom: "8px" }}>
              No Products Match Your Filter
            </h3>
            <p style={{ fontSize: "14px", marginBottom: "20px" }}>
              Try adjusting your search terms or resetting the category filter.
            </p>
            <button
              onClick={resetFilters}
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#0B0C0E",
                padding: "10px 24px",
                borderRadius: "6px",
                fontWeight: "800",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              RESET ALL FILTERS
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "26px",
            }}
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div style={{ padding: "80px 0", textAlign: "center", color: "#FFF" }}>Loading Catalog...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
