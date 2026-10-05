"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const TIMELINE_STEPS = [
  {
    time: "07:00",
    phase: "MORNING",
    title: "Protein Oats",
    metric: "22g Protein • Beta-Glucan",
    desc: "Kickstart metabolic protein synthesis and sustained glycogen replenishment.",
    img: "/assets/images/hd_showcase_4.png",
    link: "/products/high-protein-rolled-oats-1kg",
  },
  {
    time: "10:30",
    phase: "PRE-WORKOUT",
    title: "Pre-Workout",
    metric: "300mg Caffeine • 6000mg Citrulline",
    desc: "Vascular endothelial nitric oxide expansion and central nervous drive.",
    img: "/assets/product-catalog/preworkout.png",
    link: "/products/provana-ignition-pre-workout-300g",
  },
  {
    time: "13:00",
    phase: "RECOVER",
    title: "Whey Protein",
    metric: "27g Pure CFM Isolate • 6.2g BCAAs",
    desc: "Rapid leucine spike initiating immediate post-exertion myofibrillar repair.",
    img: "/assets/product-catalog/whey_isolated.png",
    link: "/products/provana-pure-iso-whey-protein-1kg",
  },
  {
    time: "18:00",
    phase: "PERFORM",
    title: "Creatine",
    metric: "3g Creapure® Micronized ATP",
    desc: "Saturate intramuscular phosphocreatine reserves for maximal torque output.",
    img: "/assets/product-catalog/creatine_monohydrate.png",
    link: "/products/provana-creapure-creatine-monohydrate-250g",
  },
  {
    time: "22:00",
    phase: "RECOVER",
    title: "Casein",
    metric: "25g Sustained Micro-Micellar",
    desc: "Gradual multi-hour nocturnal amino acid trickle preventing muscle breakdown.",
    img: "/assets/product-catalog/whey_plant_protien.png",
    link: "/products/provana-plant-protein-vegan-isolate-1kg",
  },
];

export default function NutritionRoutine() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <section
      style={{
        padding: "clamp(80px, 11vw, 150px) 0",
        backgroundColor: "#0E1014",
        position: "relative",
        overflow: "hidden",
      }}
      id="daily-nutrition-routine"
    >
      <div className="site-container">
        {/* Editorial Section Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(48px, 7vw, 72px)" }}>
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
            <span>NUTRIENT TIMING PROTOCOL</span>
            <span style={{ width: "28px", height: "1px", backgroundColor: "#8FB8D8" }} />
          </div>

          <h2
            className="font-display"
            style={{
              fontSize: "clamp(44px, 6vw, 84px)",
              color: "#FFFFFF",
              letterSpacing: "1.5px",
              lineHeight: "0.92",
              textTransform: "uppercase",
            }}
          >
            <span style={{ display: "block" }}>YOUR DAILY</span>
            <span style={{ display: "block", color: "#8FB8D8" }}>NUTRITION ROUTINE</span>
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: "#94A3B8",
              marginTop: "14px",
              maxWidth: "520px",
              margin: "14px auto 0",
              lineHeight: "1.65",
            }}
          >
            An uninterrupted 24-hour physiological protocol precision-timed for optimal protein synthesis and continuous recovery.
          </p>
        </div>

        {/* Editorial Protocol Timeline (No heavy card boxes, pure whitespace & refined rhythm) */}
        <div
          style={{
            position: "relative",
            maxWidth: "880px",
            margin: "0 auto",
            padding: "20px 0 20px 24px",
          }}
        >
          {/* Thin Ice Blue Continuous Vertical Connector Line */}
          <div
            style={{
              position: "absolute",
              top: "40px",
              bottom: "40px",
              left: "48px",
              width: "1.5px",
              backgroundColor: "rgba(143, 184, 216, 0.4)",
              zIndex: 1,
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(32px, 4vw, 44px)", position: "relative", zIndex: 2 }}>
            {TIMELINE_STEPS.map((step, idx) => {
              const isHovered = hoveredStep === idx;

              return (
                <div
                  key={step.time}
                  onMouseEnter={() => setHoveredStep(idx)}
                  onMouseLeave={() => setHoveredStep(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "clamp(20px, 3.5vw, 36px)",
                    padding: "16px 20px",
                    borderRadius: "8px",
                    backgroundColor: isHovered ? "rgba(255, 255, 255, 0.02)" : "transparent",
                    transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                    transform: isHovered ? "translateX(6px)" : "translateX(0)",
                  }}
                >
                  {/* Subtle Node Point (Time & Status) */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      backgroundColor: "#0E1014",
                      border: isHovered
                        ? "1.5px solid #8FB8D8"
                        : idx === 0
                        ? "1.5px solid #8FB8D8"
                        : "1.5px solid rgba(255, 255, 255, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isHovered || idx === 0 ? "#FFFFFF" : "#64748B",
                      fontFamily: "var(--font-stats)",
                      fontSize: "12px",
                      fontWeight: "700",
                      letterSpacing: "0.5px",
                      boxShadow: isHovered || idx === 0 ? "0 0 16px rgba(143, 184, 216, 0.25)" : "none",
                      transition: "all 0.25s ease",
                    }}
                  >
                    {step.time}
                  </div>

                  {/* Larger Product Thumbnail */}
                  <div
                    style={{
                      position: "relative",
                      width: "74px",
                      height: "74px",
                      flexShrink: 0,
                      backgroundColor: "#16191E",
                      borderRadius: "8px",
                      padding: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.04)",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={step.img}
                      alt={step.title}
                      fill
                      sizes="80px"
                      style={{
                        objectFit: "contain",
                        transform: isHovered ? "scale(1.08)" : "scale(1.0)",
                        transition: "transform 0.4s ease",
                      }}
                    />
                  </div>

                  {/* Protocol Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#8FB8D8",
                          letterSpacing: "1.5px",
                          textTransform: "uppercase",
                        }}
                      >
                        {step.phase}
                      </span>
                      <span style={{ color: "rgba(255, 255, 255, 0.18)" }}>•</span>
                      <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600" }}>{step.metric}</span>
                    </div>

                    <Link href={step.link} style={{ textDecoration: "none" }}>
                      <h3
                        className="font-display"
                        style={{
                          fontSize: "clamp(22px, 2.2vw, 28px)",
                          color: isHovered ? "#8FB8D8" : "#FFFFFF",
                          letterSpacing: "0.8px",
                          lineHeight: "1.1",
                          marginBottom: "6px",
                          textTransform: "uppercase",
                          transition: "color 0.2s ease",
                        }}
                      >
                        {step.title}
                      </h3>
                    </Link>

                    <p
                      style={{
                        fontSize: "13.5px",
                        color: "#94A3B8",
                        lineHeight: "1.55",
                        margin: 0,
                        maxWidth: "540px",
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Minimal Editorial CTA */}
        <div style={{ textAlign: "center", marginTop: "56px" }}>
          <Link
            href="/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              height: "50px",
              padding: "0 34px",
              backgroundColor: "transparent",
              color: "#8FB8D8",
              border: "1px solid rgba(143, 184, 216, 0.3)",
              fontWeight: "800",
              fontSize: "13px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              borderRadius: "4px",
              transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(143, 184, 216, 0.12)";
              e.currentTarget.style.borderColor = "#8FB8D8";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "rgba(143, 184, 216, 0.3)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span>EXPLORE FULL NUTRITION PROTOCOL</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
