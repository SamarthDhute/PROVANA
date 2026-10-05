"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function BeastModeSection() {
  return (
    <section
      style={{
        position: "relative",
        height: "72vh",
        minHeight: "520px",
        maxHeight: "780px",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#090A0C",
      }}
    >
      {/* Full-Bleed Beast Power Imagery (Monochrome & Dark Atmosphere) */}
      <Image
        src="/assets/goals/goal_explosive_energy.png"
        alt="Provana Beast Mode Discipline"
        fill
        sizes="100vw"
        priority={false}
        style={{
          objectFit: "cover",
          objectPosition: "center 40%",
          filter: "grayscale(100%) contrast(135%) brightness(0.35)",
          transform: "scale(1.05)",
          transition: "transform 1.4s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />

      {/* Dark Charcoal Vignette & Atmospheric Fog Gradients */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at center, rgba(9, 10, 12, 0.3) 0%, rgba(9, 10, 12, 0.85) 75%, #090A0C 100%), linear-gradient(180deg, #0E1014 0%, transparent 25%, transparent 75%, #111318 100%)",
          zIndex: 1,
        }}
      />

      {/* Oversized Statement Content */}
      <div
        className="site-container"
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          maxWidth: "960px",
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
          <span>RAW ATHLETIC WILL</span>
          <span style={{ width: "24px", height: "1px", backgroundColor: "#8FB8D8" }} />
        </div>

        <h2
          className="font-display"
          style={{
            fontSize: "clamp(56px, 8.5vw, 116px)",
            color: "#FFFFFF",
            letterSpacing: "2px",
            lineHeight: "0.92",
            textTransform: "uppercase",
            margin: "0 0 22px",
            textShadow: "0 14px 40px rgba(0, 0, 0, 0.9)",
          }}
        >
          <span style={{ display: "block" }}>NO SHORTCUTS.</span>
          <span style={{ display: "block" }}>
            JUST <span style={{ color: "#8FB8D8" }}>PROGRESS.</span>
          </span>
        </h2>

        <p
          style={{
            fontSize: "clamp(14px, 1.4vw, 17px)",
            color: "#94A3B8",
            maxWidth: "560px",
            lineHeight: "1.6",
            marginBottom: "36px",
          }}
        >
          Discipline is the uncompromising bridge between intent and physiological adaptation. Fuel your body with what is proven in the lab and on the platform.
        </p>

        <Link
          href="/products?category=Performance"
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
          <span>SHOP PERFORMANCE</span>
          <span>→</span>
        </Link>
      </div>
    </section>
  );
}
