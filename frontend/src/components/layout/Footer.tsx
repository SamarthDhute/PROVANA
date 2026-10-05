"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#070809",
        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
        color: "#94A3B8",
        padding: "clamp(64px, 8vw, 100px) 0 40px",
        marginTop: "auto",
      }}
    >
      <div className="site-container">
        {/* Main Brand & Minimal Navigation Structure */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "clamp(32px, 5vw, 64px)",
            paddingBottom: "clamp(48px, 6vw, 72px)",
          }}
        >
          {/* Brand Identity */}
          <div>
            <div
              className="font-display"
              style={{
                fontSize: "clamp(36px, 4.5vw, 54px)",
                color: "#FFFFFF",
                letterSpacing: "2px",
                lineHeight: "0.95",
                marginBottom: "12px",
              }}
            >
              PROVANA
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: "800",
                color: "#8FB8D8",
                letterSpacing: "2.5px",
                textTransform: "uppercase",
              }}
            >
              FUEL YOUR PROGRESS.
            </div>
          </div>

          {/* Minimal Navigation Columns */}
          <div
            style={{
              display: "flex",
              gap: "clamp(32px, 6vw, 64px)",
              flexWrap: "wrap",
            }}
          >
            {/* Primary Links */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  color: "#64748B",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                NAVIGATION
              </div>
              <Link href="/products" className="text-link" style={{ color: "#E2E8F0", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>
                SHOP
              </Link>
              <Link href="/#learn-nutrition" className="text-link" style={{ color: "#E2E8F0", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>
                LEARN
              </Link>
              <Link href="/#why-provana" className="text-link" style={{ color: "#E2E8F0", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>
                ABOUT
              </Link>
            </div>

            {/* Social Channels */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  color: "#64748B",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                SOCIAL
              </div>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-link" style={{ color: "#E2E8F0", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>
                INSTAGRAM
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-link" style={{ color: "#E2E8F0", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>
                YOUTUBE
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-link" style={{ color: "#E2E8F0", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>
                X (TWITTER)
              </a>
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div style={{ height: "1px", backgroundColor: "rgba(255, 255, 255, 0.06)", marginBottom: "28px" }} />

        {/* Bottom Row: Copyright & Legal */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            fontSize: "12.5px",
            color: "#64748B",
          }}
        >
          <div>
            © 2026 PROVANA. All rights reserved.
          </div>

          <div style={{ display: "flex", gap: "24px" }}>
            <Link href="/products" style={{ color: "#64748B", textDecoration: "none" }}>
              Privacy Policy
            </Link>
            <Link href="/products" style={{ color: "#64748B", textDecoration: "none" }}>
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
