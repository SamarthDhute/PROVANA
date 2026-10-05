"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";

export default function WhyProvanaSection() {
  const { openModal } = useStore();

  const METRICS = [
    {
      stat: "100%",
      label: "QUALITY",
      desc: "Cross-flow microfiltered isolates at low temperatures preserve vital native peptide structures with zero amino spiking or fillers.",
    },
    {
      stat: "30+",
      label: "ACTIVE PRODUCTS",
      desc: "Targeted formulations across CFM isolates, Creapure® creatine, pre-workout matrices, and metabolic superfoods for real athletic output.",
    },
    {
      stat: "FULL",
      label: "TRANSPARENCY",
      desc: "Every single production batch is verified by NABL-accredited third-party laboratories for protein assay and banned substance screening.",
    },
  ];

  return (
    <section
      style={{
        padding: "clamp(80px, 11vw, 150px) 0",
        backgroundColor: "#111318",
        position: "relative",
      }}
      id="why-provana"
    >
      <div className="site-container">
        {/* Editorial Section Heading */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "clamp(24px, 4vw, 48px)",
            alignItems: "flex-end",
            marginBottom: "clamp(48px, 6vw, 72px)",
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
                marginBottom: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ width: "28px", height: "1px", backgroundColor: "#8FB8D8" }} />
              <span>THE PROVANA STANDARD</span>
            </div>

            <h2
              className="font-display"
              style={{
                fontSize: "clamp(46px, 6.5vw, 88px)",
                color: "#FFFFFF",
                letterSpacing: "1.5px",
                lineHeight: "0.92",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              <span style={{ display: "block" }}>BUILT FOR</span>
              <span style={{ display: "block", color: "#8FB8D8" }}>THE WORK.</span>
            </h2>
          </div>

          <div>
            <p
              style={{
                fontSize: "15px",
                color: "#94A3B8",
                lineHeight: "1.65",
                maxWidth: "500px",
                margin: 0,
              }}
            >
              We formulate sports nutrition without proprietary blends, hidden sugars, or deceptive marketing. Clinical accuracy tested at every stage.
            </p>
          </div>
        </div>

        {/* Editorial Horizontal Metric Layout (Huge numbers, subtle horizontal separators, no heavy cards) */}
        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
          {METRICS.map((m, idx) => (
            <div
              key={m.label}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "clamp(20px, 4vw, 40px)",
                alignItems: "center",
                padding: "clamp(28px, 4vw, 44px) 0",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              {/* Huge Number & Label */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "20px", flexWrap: "wrap" }}>
                <span
                  className="font-stats"
                  style={{
                    fontSize: "clamp(64px, 8vw, 96px)",
                    fontWeight: "700",
                    color: idx === 1 ? "#8FB8D8" : "#FFFFFF",
                    lineHeight: "0.9",
                    letterSpacing: "0.5px",
                  }}
                >
                  {m.stat}
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    color: "#94A3B8",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                  }}
                >
                  {m.label}
                </span>
              </div>

              {/* Small Manrope Description */}
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#CBD5E1",
                    lineHeight: "1.65",
                    margin: 0,
                    maxWidth: "520px",
                  }}
                >
                  {m.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Verification Strip (Refined, no heavy border) */}
        <div
          style={{
            marginTop: "clamp(48px, 6vw, 64px)",
            padding: "24px 0",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: "800",
                color: "#10B981",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              REAL-TIME BATCH LAB VERIFICATION
            </div>
            <div
              className="font-display"
              style={{
                fontSize: "24px",
                color: "#FFFFFF",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
              }}
            >
              VERIFY YOUR SPECIFIC PRODUCTION BATCH REPORT
            </div>
          </div>

          <button
            onClick={() => openModal("cert-modal")}
            style={{
              height: "46px",
              padding: "0 28px",
              backgroundColor: "transparent",
              color: "#FFFFFF",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              fontWeight: "800",
              fontSize: "12px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#8FB8D8";
              e.currentTarget.style.borderColor = "#8FB8D8";
              e.currentTarget.style.color = "#090A0C";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.color = "#FFFFFF";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span>VERIFY LAB REPORT</span>
            <span style={{ marginLeft: "8px" }}>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
