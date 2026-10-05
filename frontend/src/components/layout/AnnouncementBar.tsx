"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/context/StoreContext";

const MESSAGES = [
  "⚡ FLAT 20% OFF ON FIRST PURCHASE — USE CODE: PRO20",
  "🔬 100% NABL ACCREDITED LAB REPORTS FOR EVERY SINGLE BATCH",
  "🚚 FREE EXPRESS DISPATCH ACROSS INDIA ON ORDERS ABOVE ₹999",
  "🛡️ 100% AUTHENTICITY GUARANTEED — ZERO BANNED SUBSTANCES",
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const { openModal } = useStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        background: "linear-gradient(90deg, #11141C 0%, #171C26 50%, #11141C 100%)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        color: "#CBD5E1",
        fontSize: "12px",
        fontWeight: "600",
        padding: "7px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        letterSpacing: "0.5px",
        zIndex: 50,
      }}
    >
      <div className="site-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "var(--color-accent)", fontSize: "14px" }}>●</span>
          <span style={{ transition: "opacity 0.3s ease" }}>{MESSAGES[index]}</span>
        </div>

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button
            onClick={() => openModal("batch-verify-modal")}
            style={{
              color: "var(--color-accent)",
              fontSize: "11.5px",
              fontWeight: "700",
              cursor: "pointer",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>🔬 Verify Batch</span>
          </button>
          <span style={{ opacity: 0.3 }}>|</span>
          <button
            onClick={() => openModal("offers-modal")}
            style={{
              color: "#FFFFFF",
              fontSize: "11.5px",
              fontWeight: "700",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            🏷️ Today&apos;s Offers
          </button>
        </div>
      </div>
    </div>
  );
}
