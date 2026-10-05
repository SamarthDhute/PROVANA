"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { useStore } from "@/context/StoreContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, buyNow, toggleWishlist, isInWishlist } = useStore();
  const wishlisted = isInWishlist(product.id);

  return (
    <article
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1.5px solid var(--color-border)",
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "all var(--motion-normal)",
      }}
      className="product-card-wrap"
    >
      {/* Thumbnail Wrap */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "240px",
          background: "radial-gradient(circle at center, #1C2331 0%, #0F131A 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "18px",
          overflow: "hidden",
        }}
      >
        <Link href={`/products/${product.slug}`} style={{ position: "relative", width: "100%", height: "100%" }}>
          <Image
            src={product.img}
            alt={product.name}
            fill
            style={{ objectFit: "contain", transition: "transform 0.4s ease" }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>

        {/* Badge */}
        {product.badge && (
          <span
            style={{
              position: "absolute",
              top: "14px",
              left: "14px",
              backgroundColor: "rgba(148, 163, 184, 0.95)",
              color: "#0B0C0E",
              fontSize: "10.5px",
              fontWeight: "800",
              letterSpacing: "0.5px",
              padding: "3px 8px",
              borderRadius: "4px",
              textTransform: "uppercase",
            }}
          >
            {product.badge}
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product.id)}
          title="Toggle Wishlist"
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            backgroundColor: wishlisted ? "#EF4444" : "rgba(11, 12, 14, 0.65)",
            border: `1px solid ${wishlisted ? "#EF4444" : "rgba(255, 255, 255, 0.12)"}`,
            color: wishlisted ? "#FFFFFF" : "#CBD5E1",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "15px",
            cursor: "pointer",
            transition: "all var(--motion-fast)",
          }}
        >
          {wishlisted ? "♥" : "♡"}
        </button>
      </div>

      {/* Card Content */}
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "var(--color-text-muted)", letterSpacing: "1px", marginBottom: "4px" }}>
          {product.category}
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3
            style={{
              fontSize: "16.5px",
              fontWeight: "800",
              color: "#FFFFFF",
              lineHeight: 1.35,
              marginBottom: "8px",
              cursor: "pointer",
            }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Nutrition Highlight */}
        <div
          style={{
            fontSize: "12px",
            color: "#CBD5E1",
            backgroundColor: "#191E28",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            padding: "4px 8px",
            borderRadius: "4px",
            marginBottom: "12px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {product.highlight}
        </div>

        {/* Ratings */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px", fontSize: "12.5px" }}>
          <span style={{ color: "#F59E0B" }}>★★★★★</span>
          <span style={{ fontWeight: "700", color: "#FFF" }}>{product.rating}</span>
          <span style={{ color: "var(--color-text-muted)" }}>({product.reviewCount})</span>
        </div>

        {/* Price Row */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "auto", marginBottom: "16px" }}>
          <span style={{ fontSize: "20px", fontWeight: "800", color: "#FFFFFF" }}>
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          {product.mrp && (
            <span style={{ fontSize: "13.5px", color: "var(--color-text-muted)", textDecoration: "line-through" }}>
              ₹{product.mrp.toLocaleString("en-IN")}
            </span>
          )}
          {product.discount && (
            <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#10B981" }}>
              {product.discount}
            </span>
          )}
        </div>

        {/* Dual Actions: Add to Cart + Athletic Grey Buy Now */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => addToCart(product.id)}
            style={{
              flex: 1,
              height: "40px",
              backgroundColor: "var(--color-btn-cart-bg)",
              color: "var(--color-btn-cart-text)",
              border: "none",
              borderRadius: "var(--radius-btn)",
              fontSize: "12px",
              fontWeight: "800",
              cursor: "pointer",
              transition: "all var(--motion-fast)",
              textTransform: "uppercase",
            }}
          >
            ADD TO CART 🛒
          </button>
          <button
            onClick={() => buyNow(product.id)}
            style={{
              flex: 1.1,
              height: "40px",
              backgroundColor: "var(--color-btn-buy-bg)",
              color: "var(--color-btn-buy-text)",
              border: "1px solid var(--color-btn-buy-border)",
              borderRadius: "var(--radius-btn)",
              fontSize: "12px",
              fontWeight: "800",
              cursor: "pointer",
              transition: "all var(--motion-fast)",
              letterSpacing: "0.4px",
              textTransform: "uppercase",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.35)",
            }}
          >
            ⚡ BUY NOW
          </button>
        </div>
      </div>
    </article>
  );
}
