"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { PROVANA_PRODUCTS } from "@/data/products";
import { useStore } from "@/context/StoreContext";

const TABS = ["ALL", "PROTEIN", "PERFORMANCE", "HEALTHY FOODS"];

export default function BestSellerCarousel() {
  const { addToCart, buyNow, toggleWishlist, isInWishlist } = useStore();
  const [activeTab, setActiveTab] = useState("ALL");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  // Filtered Best Sellers based on active tab
  const filteredProducts = PROVANA_PRODUCTS.filter((p) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "PROTEIN") return p.category === "Protein";
    if (activeTab === "PERFORMANCE") return ["Performance", "Pre-Workout", "Creatine"].includes(p.category);
    if (activeTab === "HEALTHY FOODS") return p.category === "Healthy Foods";
    return true;
  });

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [activeTab]);

  const scrollByDirection = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.querySelector(".bestseller-carousel-card")?.clientWidth || 360;
    const distance = direction === "left" ? -(cardWidth + 24) : (cardWidth + 24);
    scrollRef.current.scrollBy({ left: distance, behavior: "smooth" });
  };

  // Drag-to-scroll interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
  };

  return (
    <section
      style={{
        padding: "clamp(80px, 10vw, 140px) 0",
        backgroundColor: "#0B0C0E",
        position: "relative",
        overflow: "hidden",
      }}
      id="best-sellers-section"
    >
      <div className="site-container">
        {/* Section Header with Category Tabs & Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "44px",
            flexWrap: "wrap",
            gap: "24px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "800",
                color: "#8FB8D8",
                letterSpacing: "3px",
                textTransform: "uppercase",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ width: "28px", height: "1px", backgroundColor: "#8FB8D8" }} />
              <span>TESTED BY CHAMPIONS</span>
            </div>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(44px, 5.5vw, 76px)",
                color: "#FFFFFF",
                letterSpacing: "1.5px",
                lineHeight: "0.95",
                textTransform: "uppercase",
              }}
            >
              PROVANA BEST SELLERS
            </h2>
          </div>

          {/* Minimalist Filter Tabs & Prev/Next Arrow Navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            {/* Category Filter Pills */}
            <div
              style={{
                display: "flex",
                gap: "4px",
                backgroundColor: "#16191E",
                padding: "4px",
                borderRadius: "9999px",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "9999px",
                      fontSize: "12px",
                      fontWeight: isActive ? "800" : "600",
                      letterSpacing: "0.8px",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      backgroundColor: isActive ? "#8FB8D8" : "transparent",
                      color: isActive ? "#090A0C" : "#94A3B8",
                      border: "none",
                      transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Prev / Next Arrows */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => scrollByDirection("left")}
                disabled={!canScrollLeft}
                aria-label="Previous Products"
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: canScrollLeft ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: canScrollLeft ? "#FFFFFF" : "#475569",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: canScrollLeft ? "pointer" : "default",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  if (canScrollLeft) {
                    e.currentTarget.style.backgroundColor = "rgba(143, 184, 216, 0.15)";
                    e.currentTarget.style.borderColor = "#8FB8D8";
                    e.currentTarget.style.color = "#8FB8D8";
                  }
                }}
                onMouseLeave={(e) => {
                  if (canScrollLeft) {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.color = "#FFFFFF";
                  }
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              <button
                onClick={() => scrollByDirection("right")}
                disabled={!canScrollRight}
                aria-label="Next Products"
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: canScrollRight ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: canScrollRight ? "#FFFFFF" : "#475569",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: canScrollRight ? "pointer" : "default",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  if (canScrollRight) {
                    e.currentTarget.style.backgroundColor = "rgba(143, 184, 216, 0.15)";
                    e.currentTarget.style.borderColor = "#8FB8D8";
                    e.currentTarget.style.color = "#8FB8D8";
                  }
                }}
                onMouseLeave={(e) => {
                  if (canScrollRight) {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.color = "#FFFFFF";
                  }
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Carousel Track (3 full cards + partial next card peek on desktop) */}
      <div
        ref={scrollRef}
        className="bestseller-carousel-rail"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        style={{
          display: "flex",
          gap: "28px",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          paddingLeft: "calc((100vw - min(1320px, 92vw)) / 2)",
          paddingRight: "64px",
          paddingBottom: "32px",
          cursor: isMouseDown ? "grabbing" : "grab",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {filteredProducts.map((prod) => {
          const wishlisted = isInWishlist(prod.id);

          return (
            <article
              key={prod.id}
              className="bestseller-carousel-card"
              style={{
                flex: "0 0 auto",
                width: "clamp(300px, 29vw, 390px)",
                scrollSnapAlign: "start",
                backgroundColor: "#16191E",
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, border-color 0.35s ease",
                border: "1px solid rgba(255, 255, 255, 0.04)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 18px 50px rgba(0, 0, 0, 0.35)";
                e.currentTarget.style.borderColor = "rgba(143, 184, 216, 0.10)";
                const img = e.currentTarget.querySelector(".product-carousel-img");
                if (img) (img as HTMLElement).style.transform = "scale(1.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.04)";
                const img = e.currentTarget.querySelector(".product-carousel-img");
                if (img) (img as HTMLElement).style.transform = "scale(1.0)";
              }}
            >
              {/* Product Photography Box (65-70% height emphasis with subtle spotlight) */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "340px",
                  background: "radial-gradient(circle at 50% 40%, #252A31 0%, #111318 65%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "28px",
                  overflow: "hidden",
                }}
              >
                {/* Floating Badge (Top Left) */}
                {prod.badge && (
                  <span
                    style={{
                      position: "absolute",
                      top: "16px",
                      left: "16px",
                      fontSize: "11px",
                      fontWeight: "800",
                      color: "#8FB8D8",
                      backgroundColor: "rgba(143, 184, 216, 0.12)",
                      border: "1px solid rgba(143, 184, 216, 0.25)",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      zIndex: 3,
                    }}
                  >
                    {prod.badge}
                  </span>
                )}

                {/* Floating Wishlist Button (Top Right) */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(prod.id);
                  }}
                  title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(11, 12, 14, 0.65)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: wishlisted ? "#EF4444" : "#94A3B8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    cursor: "pointer",
                    zIndex: 3,
                    transition: "all 0.2s ease",
                  }}
                >
                  {wishlisted ? "♥" : "♡"}
                </button>

                {/* Product Image Link (Clean, no blue tint) */}
                <Link
                  href={`/products/${prod.slug}`}
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    src={prod.img}
                    alt={prod.name}
                    fill
                    sizes="(max-width: 768px) 85vw, 390px"
                    className="product-carousel-img"
                    style={{
                      objectFit: "contain",
                      transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                  />
                </Link>
              </div>

              {/* Product Info Section: Name ↓ Rating ↓ Price ↓ Add to Cart */}
              <div style={{ padding: "24px 24px 28px", display: "flex", flexDirection: "column", flex: 1 }}>
                {/* 1. PRODUCT NAME */}
                <Link href={`/products/${prod.slug}`} style={{ textDecoration: "none" }}>
                  <h3
                    className="font-display"
                    style={{
                      fontSize: "26px",
                      color: "#FFFFFF",
                      letterSpacing: "0.8px",
                      lineHeight: "1.1",
                      marginBottom: "10px",
                      textTransform: "uppercase",
                      transition: "color 0.2s ease",
                    }}
                  >
                    {prod.name}
                  </h3>
                </Link>

                {/* 2. RATING */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", marginBottom: "14px" }}>
                  <div style={{ color: "#FBBF24", display: "flex", gap: "2px" }}>
                    <span>★</span>
                  </div>
                  <span style={{ fontWeight: "700", color: "#FFFFFF" }}>{prod.rating}</span>
                  <span style={{ color: "#64748B", fontSize: "12px" }}>({prod.reviewCount} reviews)</span>
                  <span style={{ color: "#334155", margin: "0 4px" }}>•</span>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#8FB8D8", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                    {prod.category}
                  </span>
                </div>

                {/* 3. PRICE */}
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "20px", marginTop: "auto" }}>
                  <span style={{ fontSize: "24px", fontWeight: "800", color: "#FFFFFF", letterSpacing: "-0.5px" }}>
                    ₹{prod.price.toLocaleString("en-IN")}
                  </span>
                  {prod.mrp && (
                    <span style={{ fontSize: "14px", color: "#64748B", textDecoration: "line-through" }}>
                      ₹{prod.mrp.toLocaleString("en-IN")}
                    </span>
                  )}
                  {prod.discount && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "800",
                        color: "#8FB8D8",
                        marginLeft: "auto",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {prod.discount}
                    </span>
                  )}
                </div>

                {/* 4. ADD TO CART / BUY NOW */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <button
                    onClick={() => addToCart(prod.id)}
                    style={{
                      height: "44px",
                      backgroundColor: "#FFFFFF",
                      color: "#090A0C",
                      fontWeight: "800",
                      fontSize: "12px",
                      letterSpacing: "0.6px",
                      borderRadius: "4px",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F1F5F9")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFFFFF")}
                  >
                    ADD TO CART
                  </button>

                  <button
                    onClick={() => buyNow(prod.id)}
                    style={{
                      height: "44px",
                      backgroundColor: "#8FB8D8",
                      color: "#090A0C",
                      fontWeight: "800",
                      fontSize: "12px",
                      letterSpacing: "0.6px",
                      borderRadius: "4px",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#A9CCE5")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#8FB8D8")}
                  >
                    ⚡ BUY NOW
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
