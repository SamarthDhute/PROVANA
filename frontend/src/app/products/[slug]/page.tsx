"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { PROVANA_PRODUCTS } from "@/data/products";
import { useStore } from "@/context/StoreContext";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const product = PROVANA_PRODUCTS.find((p) => p.slug === slug || p.id === slug);

  if (!product) {
    notFound();
  }

  const { addToCart, buyNow, toggleWishlist, isInWishlist, openModal } = useStore();
  const wishlisted = isInWishlist(product.id);

  const [selectedFlavor, setSelectedFlavor] = useState(product.flavors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [qty, setQty] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>("nutrition");

  const toggleAccordion = (name: string) => {
    setOpenAccordion((prev) => (prev === name ? null : name));
  };

  return (
    <div style={{ padding: "40px 0 80px" }}>
      <div className="site-container">
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "32px" }}>
          <Link href="/" style={{ color: "#CBD5E1" }}>Home</Link>
          <span>/</span>
          <Link href="/products" style={{ color: "#CBD5E1" }}>Products</Link>
          <span>/</span>
          <Link href={`/products?category=${encodeURIComponent(product.category)}`} style={{ color: "#CBD5E1" }}>{product.category}</Link>
          <span>/</span>
          <span style={{ color: "var(--color-accent)", fontWeight: "700" }}>{product.name}</span>
        </div>

        {/* Product Hero Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "48px", marginBottom: "64px" }}>
          {/* Left: Gallery Column */}
          <div>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "460px",
                backgroundColor: "#141720",
                border: "1.5px solid var(--color-border)",
                borderRadius: "var(--radius-card)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px",
                overflow: "hidden",
                boxShadow: "0 16px 40px rgba(0, 0, 0, 0.5)",
              }}
            >
              <Image
                src={product.img}
                alt={product.name}
                fill
                style={{ objectFit: "contain", padding: "24px" }}
                priority
              />

              {product.badge && (
                <span
                  style={{
                    position: "absolute",
                    top: "20px",
                    left: "20px",
                    backgroundColor: "rgba(148, 163, 184, 0.95)",
                    color: "#0B0C0E",
                    fontSize: "11px",
                    fontWeight: "800",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  {product.badge}
                </span>
              )}

              <button
                onClick={() => toggleWishlist(product.id)}
                style={{
                  position: "absolute",
                  top: "18px",
                  right: "18px",
                  backgroundColor: wishlisted ? "#EF4444" : "rgba(11, 12, 14, 0.65)",
                  border: `1px solid ${wishlisted ? "#EF4444" : "rgba(255, 255, 255, 0.12)"}`,
                  color: "#FFF",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                {wishlisted ? "♥" : "♡"}
              </button>
            </div>

            {/* Trust Badges Ribbon Under Photo */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                marginTop: "16px",
                textAlign: "center",
              }}
            >
              <div style={{ backgroundColor: "#11141C", border: "1px solid var(--color-border)", padding: "12px 8px", borderRadius: "6px" }}>
                <div style={{ fontSize: "18px", marginBottom: "4px" }}>🔬</div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#FFF" }}>NABL TESTED</div>
                <div style={{ fontSize: "10px", color: "#94A3B8" }}>Report verified</div>
              </div>
              <div style={{ backgroundColor: "#11141C", border: "1px solid var(--color-border)", padding: "12px 8px", borderRadius: "6px" }}>
                <div style={{ fontSize: "18px", marginBottom: "4px" }}>⚡</div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#FFF" }}>FAST ABSORB</div>
                <div style={{ fontSize: "10px", color: "#94A3B8" }}>CFM filtration</div>
              </div>
              <div style={{ backgroundColor: "#11141C", border: "1px solid var(--color-border)", padding: "12px 8px", borderRadius: "6px" }}>
                <div style={{ fontSize: "18px", marginBottom: "4px" }}>🛡️</div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#FFF" }}>100% CLEAN</div>
                <div style={{ fontSize: "10px", color: "#94A3B8" }}>No banned dyes</div>
              </div>
            </div>
          </div>

          {/* Right: Product Buy Info Column */}
          <div>
            <div style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: "var(--color-accent)", letterSpacing: "1.2px", marginBottom: "6px" }}>
              {product.category} • {product.goal}
            </div>

            <h1 className="font-display" style={{ fontSize: "38px", color: "#FFF", letterSpacing: "1px", lineHeight: 1.15, marginBottom: "12px" }}>
              {product.name}
            </h1>

            {/* Ratings */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", fontSize: "14px" }}>
              <span style={{ color: "#F59E0B" }}>★★★★★</span>
              <strong style={{ color: "#FFF" }}>{product.rating}</strong>
              <span style={{ color: "var(--color-text-muted)" }}>({product.reviewCount} verified athlete reviews)</span>
            </div>

            {/* Price Box */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "20px" }}>
              <span style={{ fontSize: "32px", fontWeight: "800", color: "#FFFFFF" }}>
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.mrp && (
                <span style={{ fontSize: "18px", color: "var(--color-text-muted)", textDecoration: "line-through" }}>
                  ₹{product.mrp.toLocaleString("en-IN")}
                </span>
              )}
              {product.discount && (
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#10B981", backgroundColor: "rgba(16, 185, 129, 0.15)", padding: "3px 8px", borderRadius: "4px" }}>
                  {product.discount}
                </span>
              )}
            </div>

            <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#CBD5E1", marginBottom: "24px" }}>
              {product.minimalDesc}
            </p>

            {/* Flavor Selector */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: "#94A3B8", letterSpacing: "0.5px", marginBottom: "8px" }}>
                SELECT FLAVOR: <span style={{ color: "#FFF" }}>{selectedFlavor}</span>
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {product.flavors.map((flv) => {
                  const active = selectedFlavor === flv;
                  return (
                    <button
                      key={flv}
                      onClick={() => setSelectedFlavor(flv)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        fontWeight: "700",
                        backgroundColor: active ? "var(--color-surface-hover)" : "#0D1016",
                        border: `1.5px solid ${active ? "var(--color-accent)" : "#262C3A"}`,
                        color: active ? "#FFF" : "#CBD5E1",
                        cursor: "pointer",
                      }}
                    >
                      {flv}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector */}
            <div style={{ marginBottom: "28px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: "#94A3B8", letterSpacing: "0.5px", marginBottom: "8px" }}>
                SELECT SIZE: <span style={{ color: "#FFF" }}>{selectedSize}</span>
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {product.sizes.map((sz) => {
                  const active = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        fontWeight: "700",
                        backgroundColor: active ? "var(--color-surface-hover)" : "#0D1016",
                        border: `1.5px solid ${active ? "var(--color-accent)" : "#262C3A"}`,
                        color: active ? "#FFF" : "#CBD5E1",
                        cursor: "pointer",
                      }}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper & Dual Action Buttons */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid #333C4D", borderRadius: "6px", backgroundColor: "#0F131A", height: "48px" }}>
                <button
                  onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                  style={{ width: "36px", height: "100%", color: "#FFF", fontSize: "16px", fontWeight: "700" }}
                >
                  -
                </button>
                <span style={{ width: "36px", textAlign: "center", fontSize: "14px", fontWeight: "800", color: "#FFF" }}>
                  {qty}
                </span>
                <button
                  onClick={() => setQty((prev) => prev + 1)}
                  style={{ width: "36px", height: "100%", color: "#FFF", fontSize: "16px", fontWeight: "700" }}
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={() => addToCart(product.id, selectedFlavor, selectedSize, qty)}
                style={{
                  flex: 1,
                  height: "48px",
                  borderRadius: "6px",
                  backgroundColor: "var(--color-btn-cart-bg)",
                  color: "var(--color-btn-cart-text)",
                  fontWeight: "800",
                  fontSize: "13px",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                ADD TO CART 🛒
              </button>

              {/* ⚡ BUY NOW (Athletic Grey) */}
              <button
                onClick={() => buyNow(product.id, selectedFlavor, selectedSize, qty)}
                style={{
                  flex: 1.1,
                  height: "48px",
                  borderRadius: "6px",
                  backgroundColor: "var(--color-btn-buy-bg)",
                  color: "var(--color-btn-buy-text)",
                  border: "1px solid var(--color-btn-buy-border)",
                  fontWeight: "800",
                  fontSize: "13px",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                }}
              >
                ⚡ BUY NOW
              </button>
            </div>

            {/* Lab Verify Callout Banner */}
            <div
              style={{
                backgroundColor: "#101620",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                borderRadius: "8px",
                padding: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "28px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>🔬</span>
                <div>
                  <div style={{ fontSize: "12.5px", fontWeight: "800", color: "#FFF" }}>Want to verify this product&apos;s test report?</div>
                  <div style={{ fontSize: "11.5px", color: "#94A3B8" }}>Inspect actual protein assay &amp; banned substance purity</div>
                </div>
              </div>
              <button
                onClick={() => openModal("batch-verify-modal")}
                style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  color: "var(--color-accent)",
                  backgroundColor: "rgba(148, 163, 184, 0.12)",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                VERIFY BATCH →
              </button>
            </div>

            {/* Accordions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {/* Accordion 1: Nutrition Facts */}
              <div style={{ border: "1px solid var(--color-border)", borderRadius: "8px", overflow: "hidden", backgroundColor: "#11141C" }}>
                <button
                  onClick={() => toggleAccordion("nutrition")}
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: "800",
                    fontSize: "14px",
                    color: "#FFF",
                    cursor: "pointer",
                  }}
                >
                  <span>Nutrition Facts &amp; Serving Breakdown</span>
                  <span>{openAccordion === "nutrition" ? "▴" : "▾"}</span>
                </button>
                {openAccordion === "nutrition" && (
                  <div style={{ padding: "0 18px 18px", fontSize: "13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <span style={{ color: "#94A3B8" }}>Serving Size</span>
                      <strong style={{ color: "#FFF" }}>{product.nutritionFacts.servingSize}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <span style={{ color: "#94A3B8" }}>Servings Per Container</span>
                      <strong style={{ color: "#FFF" }}>{product.nutritionFacts.servingsPerContainer}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <span style={{ color: "#94A3B8" }}>Calories</span>
                      <strong style={{ color: "#FFF" }}>{product.nutritionFacts.calories} kcal</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <span style={{ color: "#94A3B8" }}>Protein</span>
                      <strong style={{ color: "#10B981" }}>{product.nutritionFacts.protein}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <span style={{ color: "#94A3B8" }}>Carbohydrates</span>
                      <strong style={{ color: "#FFF" }}>{product.nutritionFacts.carbs}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                      <span style={{ color: "#94A3B8" }}>Total Fat</span>
                      <strong style={{ color: "#FFF" }}>{product.nutritionFacts.fat}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2: Ingredients & Allergens */}
              <div style={{ border: "1px solid var(--color-border)", borderRadius: "8px", overflow: "hidden", backgroundColor: "#11141C" }}>
                <button
                  onClick={() => toggleAccordion("ingredients")}
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: "800",
                    fontSize: "14px",
                    color: "#FFF",
                    cursor: "pointer",
                  }}
                >
                  <span>Ingredients &amp; Allergen Advisory</span>
                  <span>{openAccordion === "ingredients" ? "▴" : "▾"}</span>
                </button>
                {openAccordion === "ingredients" && (
                  <div style={{ padding: "0 18px 18px", fontSize: "13px", lineHeight: 1.6 }}>
                    <div style={{ marginBottom: "10px" }}>
                      <strong style={{ color: "#FFF", display: "block", marginBottom: "4px" }}>Ingredients:</strong>
                      <p style={{ color: "#CBD5E1" }}>{product.ingredients}</p>
                    </div>
                    <div>
                      <strong style={{ color: "var(--color-accent)", display: "block", marginBottom: "4px" }}>Allergens &amp; Warnings:</strong>
                      <p style={{ color: "#CBD5E1" }}>{product.allergens}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 3: How to Use */}
              <div style={{ border: "1px solid var(--color-border)", borderRadius: "8px", overflow: "hidden", backgroundColor: "#11141C" }}>
                <button
                  onClick={() => toggleAccordion("usage")}
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: "800",
                    fontSize: "14px",
                    color: "#FFF",
                    cursor: "pointer",
                  }}
                >
                  <span>Usage &amp; Timing Protocol</span>
                  <span>{openAccordion === "usage" ? "▴" : "▾"}</span>
                </button>
                {openAccordion === "usage" && (
                  <div style={{ padding: "0 18px 18px", fontSize: "13px", color: "#CBD5E1", lineHeight: 1.6 }}>
                    {product.howToUse}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
