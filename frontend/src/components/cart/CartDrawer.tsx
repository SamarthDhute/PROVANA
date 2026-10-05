"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    toggleCart,
    updateCartItemQty,
    removeFromCart,
    cartSubtotal,
    appliedCoupon,
    applyCoupon,
    openModal,
  } = useStore();

  const [couponInput, setCouponInput] = useState("");

  if (!isCartOpen) return null;

  // Tier Progress Calculation
  const freeShippingThreshold = 999;
  const freeGiftThreshold = 2499;

  let progressPercent = 0;
  let progressText = "";

  if (cartSubtotal < freeShippingThreshold) {
    const diff = freeShippingThreshold - cartSubtotal;
    progressPercent = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 50));
    progressText = `Add ₹${diff.toLocaleString("en-IN")} more to unlock FREE Express Delivery 🚚`;
  } else if (cartSubtotal < freeGiftThreshold) {
    const diff = freeGiftThreshold - cartSubtotal;
    progressPercent = 50 + Math.min(50, Math.round(((cartSubtotal - freeShippingThreshold) / (freeGiftThreshold - freeShippingThreshold)) * 50));
    progressText = `🎉 Free Delivery Unlocked! Add ₹${diff.toLocaleString("en-IN")} for FREE Stainless Shaker 🎁`;
  } else {
    progressPercent = 100;
    progressText = `🔥 Unlocked: FREE Delivery + FREE Stainless Steel Shaker Bottle!`;
  }

  // Discount calculation
  let discountAmount = 0;
  if (appliedCoupon === "PRO10") discountAmount = Math.round(cartSubtotal * 0.1);
  else if (appliedCoupon === "PRO25") discountAmount = Math.round(cartSubtotal * 0.25);
  else if (appliedCoupon === "PRE20") discountAmount = Math.round(cartSubtotal * 0.2);
  else if (appliedCoupon === "GYM15") discountAmount = Math.round(cartSubtotal * 0.15);

  const shippingFee = cartSubtotal >= freeShippingThreshold || cartSubtotal === 0 ? 0 : 99;
  const netPayable = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput);
      setCouponInput("");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999 }}>
      {/* Backdrop */}
      <div
        onClick={() => toggleCart(false)}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(4px)",
          transition: "opacity 0.2s ease",
        }}
      />

      {/* Drawer Panel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "#11141C",
          borderLeft: "1px solid var(--color-border)",
          boxShadow: "-10px 0 40px rgba(0, 0, 0, 0.8)",
          display: "flex",
          flexDirection: "column",
          animation: "slideInRight 0.25s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>🛒</span>
            <span className="font-display" style={{ fontSize: "20px", color: "#FFF", letterSpacing: "1px" }}>
              YOUR ATHLETE CART ({cart.reduce((s, i) => s + i.qty, 0)})
            </span>
          </div>
          <button
            onClick={() => toggleCart(false)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#CBD5E1",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Tier Reward Progress Bar */}
        <div style={{ padding: "14px 20px", backgroundColor: "#171D27", borderBottom: "1px solid var(--color-border)" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#CBD5E1", marginBottom: "8px" }}>
            {progressText}
          </div>
          <div style={{ width: "100%", height: "6px", backgroundColor: "#252D3D", borderRadius: "9999px", overflow: "hidden" }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                backgroundColor: progressPercent === 100 ? "#10B981" : "var(--color-accent)",
                borderRadius: "9999px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Items List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--color-text-muted)" }}>
              <div style={{ fontSize: "48px", marginBottom: "14px" }}>🏋️‍♂️</div>
              <h4 style={{ color: "#FFF", fontSize: "17px", fontWeight: "800", marginBottom: "8px" }}>
                Your Cart is Empty
              </h4>
              <p style={{ fontSize: "13.5px", marginBottom: "20px" }}>
                Fuel your workout with clinically dosed sports nutrition essentials.
              </p>
              <button
                onClick={() => toggleCart(false)}
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "#0B0C0E",
                  padding: "10px 22px",
                  borderRadius: "6px",
                  fontWeight: "800",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                EXPLORE PRODUCTS →
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {cart.map((item, idx) => (
                <div
                  key={`${item.id}-${item.flavor}-${item.size}`}
                  style={{
                    display: "flex",
                    gap: "14px",
                    padding: "14px",
                    backgroundColor: "#161B24",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "70px",
                      height: "70px",
                      backgroundColor: "#0D1016",
                      borderRadius: "6px",
                      flexShrink: 0,
                    }}
                  >
                    <Image src={item.img} alt={item.name} fill style={{ objectFit: "contain", padding: "4px" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: "#FFF", marginBottom: "4px", lineHeight: 1.3 }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "8px" }}>
                      {item.flavor} • {item.size}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid #333C4D", borderRadius: "4px", backgroundColor: "#0F131A" }}>
                        <button
                          onClick={() => updateCartItemQty(idx, -1)}
                          style={{ width: "26px", height: "26px", color: "#FFF", fontSize: "14px", fontWeight: "700" }}
                        >
                          -
                        </button>
                        <span style={{ width: "26px", textAlign: "center", fontSize: "13px", fontWeight: "700", color: "#FFF" }}>
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateCartItemQty(idx, 1)}
                          style={{ width: "26px", height: "26px", color: "#FFF", fontSize: "14px", fontWeight: "700" }}
                        >
                          +
                        </button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "15px", fontWeight: "800", color: "#FFF" }}>
                          ₹{(item.price * item.qty).toLocaleString("en-IN")}
                        </span>
                        <button
                          onClick={() => removeFromCart(idx)}
                          style={{ color: "#EF4444", fontSize: "13px", padding: "4px", cursor: "pointer" }}
                          title="Remove item"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer & Checkout */}
        {cart.length > 0 && (
          <div style={{ padding: "20px", backgroundColor: "#141720", borderTop: "1px solid var(--color-border)" }}>
            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <input
                type="text"
                placeholder="Discount code (e.g. PRO25)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                style={{
                  flex: 1,
                  height: "38px",
                  padding: "0 12px",
                  borderRadius: "6px",
                  fontSize: "12.5px",
                  textTransform: "uppercase",
                  backgroundColor: "#0D1016",
                  border: "1px solid #2B3342",
                  color: "#FFF",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "0 16px",
                  height: "38px",
                  borderRadius: "6px",
                  backgroundColor: "#2B3342",
                  color: "#FFF",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                APPLY
              </button>
            </form>

            {/* Calculations */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13.5px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#94A3B8" }}>
                <span>Subtotal</span>
                <span>₹{cartSubtotal.toLocaleString("en-IN")}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#10B981", fontWeight: "700" }}>
                  <span>Coupon Discount ({appliedCoupon})</span>
                  <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", color: "#94A3B8" }}>
                <span>Shipping</span>
                <span>{shippingFee === 0 ? <strong style={{ color: "#10B981" }}>FREE</strong> : `₹${shippingFee}`}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#FFF",
                  fontWeight: "800",
                  fontSize: "18px",
                  paddingTop: "8px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <span>Net Total</span>
                <span>₹{netPayable.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                toggleCart(false);
                openModal("checkout-modal");
              }}
              style={{
                width: "100%",
                height: "46px",
                borderRadius: "6px",
                backgroundColor: "var(--color-accent)",
                color: "#0B0C0E",
                fontWeight: "800",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
                letterSpacing: "0.5px",
                boxShadow: "0 6px 16px rgba(148, 163, 184, 0.3)",
              }}
            >
              <span>PROCEED TO CHECKOUT</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
