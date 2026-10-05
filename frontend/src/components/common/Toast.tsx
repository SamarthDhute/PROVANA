"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";

export default function Toast() {
  const { toastMessage } = useStore();

  if (!toastMessage) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(20, 23, 32, 0.95)",
        backdropFilter: "blur(12px)",
        color: "#FFFFFF",
        padding: "12px 24px",
        borderRadius: "9999px",
        border: "1px solid rgba(148, 163, 184, 0.4)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(148, 163, 184, 0.25)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "14px",
        fontWeight: "600",
        zIndex: 99999,
        animation: "fadeIn 0.2s ease-out forwards",
      }}
    >
      <span style={{ color: "var(--color-accent)", fontSize: "16px" }}>⚡</span>
      <span>{toastMessage}</span>
    </div>
  );
}
