"use client";

import React from "react";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";

export default function ProteinStackSection() {
  const { openModal } = useStore();

  return (
    <section
      style={{
        padding: "clamp(80px, 11vw, 150px) 0",
        backgroundColor: "#111318",
        position: "relative",
        overflow: "hidden",
      }}
      id="protein-stack-section"
    >
      {/* Background Subtle Radial Glow Atmosphere */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "15%",
          transform: "translateY(-50%)",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(143, 184, 216, 0.12) 0%, rgba(143, 184, 216, 0.03) 45%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="site-container" style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "clamp(40px, 6vw, 80px)",
            alignItems: "center",
          }}
        >
          {/* LEFT COLUMN: Editorial & CTA */}
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "800",
                color: "#8FB8D8",
                letterSpacing: "3px",
                textTransform: "uppercase",
                marginBottom: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ width: "28px", height: "1px", backgroundColor: "#8FB8D8" }} />
              <span>SYNERGISTIC PROTOCOL</span>
            </div>

            <h2
              className="font-display"
              style={{
                fontSize: "clamp(46px, 6vw, 84px)",
                color: "#FFFFFF",
                letterSpacing: "1.5px",
                lineHeight: "0.92",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              <span style={{ display: "block" }}>BUILD YOUR</span>
              <span style={{ display: "block", color: "#8FB8D8" }}>PROTEIN STACK.</span>
            </h2>

            <p
              style={{
                fontSize: "15px",
                color: "#94A3B8",
                lineHeight: "1.65",
                marginBottom: "28px",
                maxWidth: "500px",
              }}
            >
              Formulate your synergistic protocol with pure CFM Whey Isolate, Creapure® Creatine, Electrolyte BCAA, and Gourmet Fuel. Engineered for compounded anabolic response and rapid cellular recovery.
            </p>

            {/* BUNDLE & SAVE Callout */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "14px",
                padding: "12px 18px",
                backgroundColor: "rgba(143, 184, 216, 0.08)",
                borderRadius: "6px",
                borderLeft: "3px solid #8FB8D8",
                marginBottom: "36px",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: "800", color: "#8FB8D8", letterSpacing: "1.5px" }}>
                BUNDLE & SAVE
              </span>
              <span style={{ width: "1px", height: "14px", backgroundColor: "rgba(255, 255, 255, 0.15)" }} />
              <span style={{ fontSize: "13px", color: "#CBD5E1", fontWeight: "600" }}>
                15% OFF + Free Pro Shaker Included
              </span>
            </div>

            {/* CTA Button */}
            <div>
              <button
                onClick={() => openModal("stack-builder-modal")}
                style={{
                  height: "54px",
                  padding: "0 38px",
                  backgroundColor: "#8FB8D8",
                  color: "#090A0C",
                  fontWeight: "800",
                  fontSize: "13px",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
                  boxShadow: "0 10px 30px rgba(143, 184, 216, 0.25)",
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
                <span>CUSTOMIZE YOUR STACK</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Overlapping Product Campaign Composition */}
          <div
            onClick={() => openModal("stack-builder-modal")}
            title="Click to customize your stack"
            style={{
              position: "relative",
              height: "clamp(380px, 48vh, 520px)",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {/* Ice Blue Central Radial Spotlight */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "90%",
                height: "85%",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(143, 184, 216, 0.16) 0%, rgba(143, 184, 216, 0.04) 55%, transparent 75%)",
                filter: "blur(20px)",
                pointerEvents: "none",
              }}
            />

            {/* Composition Stack Container */}
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "560px",
                height: "100%",
              }}
            >
              {/* 1. CREATINE (Left Background) */}
              <div
                style={{
                  position: "absolute",
                  left: "4%",
                  bottom: "16%",
                  width: "36%",
                  height: "56%",
                  zIndex: 2,
                  transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                  filter: "drop-shadow(0 14px 28px rgba(0, 0, 0, 0.7))",
                }}
              >
                <Image
                  src="/assets/product-catalog/creatine_monohydrate.png"
                  alt="Creapure Creatine"
                  fill
                  sizes="240px"
                  style={{ objectFit: "contain" }}
                />
              </div>

              {/* 2. BCAA (Right Background) */}
              <div
                style={{
                  position: "absolute",
                  right: "6%",
                  bottom: "18%",
                  width: "35%",
                  height: "54%",
                  zIndex: 2,
                  transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                  filter: "drop-shadow(0 14px 28px rgba(0, 0, 0, 0.7))",
                }}
              >
                <Image
                  src="/assets/product-catalog/bcaa.png"
                  alt="BCAA Intra-Workout"
                  fill
                  sizes="240px"
                  style={{ objectFit: "contain" }}
                />
              </div>

              {/* 3. WHEY ISOLATE (Dominant Centerpiece) */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: "10%",
                  transform: "translateX(-50%)",
                  width: "52%",
                  height: "76%",
                  zIndex: 4,
                  transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                  filter: "drop-shadow(0 20px 40px rgba(0, 0, 0, 0.9))",
                }}
              >
                <Image
                  src="/assets/product-catalog/whey_isolated.png"
                  alt="100% CFM Whey Isolate"
                  fill
                  sizes="340px"
                  style={{ objectFit: "contain" }}
                />
              </div>

              {/* 4. PROTEIN BAR (Foreground Left) */}
              <div
                style={{
                  position: "absolute",
                  left: "14%",
                  bottom: "4%",
                  width: "30%",
                  height: "30%",
                  zIndex: 5,
                  transform: "rotate(-6deg)",
                  transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                  filter: "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.8))",
                }}
              >
                <Image
                  src="/assets/images/hd_showcase_6.png"
                  alt="Gourmet Protein Bar"
                  fill
                  sizes="180px"
                  style={{ objectFit: "contain" }}
                />
              </div>

              {/* 5. INSULATED SHAKER (Foreground Right) */}
              <div
                style={{
                  position: "absolute",
                  right: "12%",
                  bottom: "2%",
                  width: "28%",
                  height: "44%",
                  zIndex: 5,
                  transform: "rotate(4deg)",
                  transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                  filter: "drop-shadow(0 14px 28px rgba(0, 0, 0, 0.8))",
                }}
              >
                <Image
                  src="/assets/images/gym_shaker.png"
                  alt="Steel Insulated Shaker"
                  fill
                  sizes="180px"
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
