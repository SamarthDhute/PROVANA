"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function EditorialStatement() {
  return (
    <section
      style={{
        position: "relative",
        height: "70vh",
        minHeight: "520px",
        maxHeight: "780px",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#090A0C",
        marginTop: "clamp(64px, 8vw, 120px)",
      }}
    >
      {/* Full-Bleed Cinematic Background Image */}
      <Image
        src="/assets/images/performance_whey.jpg"
        alt="Provana Athletic Campaign"
        fill
        sizes="100vw"
        priority={false}
        style={{
          objectFit: "cover",
          objectPosition: "center 35%",
          filter: "grayscale(100%) contrast(125%) brightness(0.42)",
          transform: "scale(1.04)",
          transition: "transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />

      {/* Dark Charcoal Radial & Linear Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(9, 10, 12, 0.4) 0%, rgba(9, 10, 12, 0.85) 75%, #090A0C 100%), linear-gradient(180deg, #0E1014 0%, transparent 20%, transparent 80%, #0B0C0E 100%)",
          zIndex: 1,
        }}
      />

      {/* Centerpiece Oversized Typography */}
      <div
        className="site-container"
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          maxWidth: "1000px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: "800",
            color: "#8FB8D8",
            letterSpacing: "4px",
            textTransform: "uppercase",
            marginBottom: "16px",
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ width: "24px", height: "1px", backgroundColor: "#8FB8D8" }} />
          <span>PROVANA MANIFESTO</span>
          <span style={{ width: "24px", height: "1px", backgroundColor: "#8FB8D8" }} />
        </div>

        <h2
          className="font-display"
          style={{
            fontSize: "clamp(54px, 8.5vw, 110px)",
            color: "#FFFFFF",
            letterSpacing: "2px",
            lineHeight: "0.92",
            textTransform: "uppercase",
            margin: "0 0 24px",
            textShadow: "0 16px 40px rgba(0, 0, 0, 0.9)",
          }}
        >
          <span style={{ display: "block" }}>TRAIN HARD.</span>
          <span style={{ display: "block" }}>
            RECOVER <span style={{ color: "#8FB8D8" }}>HARDER.</span>
          </span>
        </h2>

        <p
          style={{
            fontSize: "clamp(14px, 1.4vw, 17px)",
            color: "#94A3B8",
            maxWidth: "580px",
            lineHeight: "1.6",
            marginBottom: "36px",
          }}
        >
          Zero filler aminos. Zero proprietary blends. Precision-engineered for athletes who demand uncompromising physiological adaptation.
        </p>

        <Link
          href="/products"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "13px",
            fontWeight: "800",
            color: "#090A0C",
            backgroundColor: "#8FB8D8",
            padding: "16px 36px",
            borderRadius: "4px",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
            boxShadow: "0 10px 30px rgba(143, 184, 216, 0.25)",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#A9CCE5";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 14px 36px rgba(143, 184, 216, 0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#8FB8D8";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 10px 30px rgba(143, 184, 216, 0.25)";
          }}
        >
          <span>EXPLORE PERFORMANCE</span>
          <span>→</span>
        </Link>
      </div>
    </section>
  );
}
