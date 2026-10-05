"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export const GOALS = [
  {
    goalNumber: "GOAL #01",
    title: "BUILD LEAN MUSCLE",
    desc: "Ultra-pure CFM whey isolates & anabolic muscle synthesis",
    tag: "HYPERTROPHY",
    goal: "Build Lean Muscle",
    img: "/assets/goals/goal_build_muscle.png",
    animal: "Lion Spirit",
  },
  {
    goalNumber: "GOAL #02",
    title: "PEAK STRENGTH & POWER",
    desc: "Creapure® micronized creatine & raw ATP cellular energy recycling",
    tag: "STRENGTH",
    goal: "Boost Performance",
    img: "/assets/goals/goal_peak_strength.png",
    animal: "Bull Spirit",
  },
  {
    goalNumber: "GOAL #03",
    title: "EXPLOSIVE ENERGY & FOCUS",
    desc: "Clinically dosed pre-workout pump accelerators & laser neuro-drive",
    tag: "INTENSITY",
    goal: "Boost Performance",
    img: "/assets/goals/goal_explosive_energy.png",
    animal: "Dragon Spirit",
  },
  {
    goalNumber: "GOAL #04",
    title: "DAILY NUTRITION & HEALTH",
    desc: "High protein rolled oats, superfoods & metabolic recovery",
    tag: "WELLNESS",
    goal: "Daily Nutrition",
    img: "/assets/goals/goal_daily_nutrition.png",
    animal: "Wolf Spirit",
  },
  {
    goalNumber: "GOAL #05",
    title: "HEALTHY SNACKING & BARS",
    desc: "20g protein gourmet nougat bars & popped chips with zero guilt",
    tag: "ZERO GUILT",
    goal: "Healthy Snacking",
    img: "/assets/goals/goal_healthy_snacking.png",
    animal: "Eagle Spirit",
  },
];

export default function GoalCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

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
  }, []);

  const scrollByDirection = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.querySelector(".goal-carousel-card")?.clientWidth || 400;
    const distance = direction === "left" ? -(cardWidth + 24) : (cardWidth + 24);
    scrollRef.current.scrollBy({ left: distance, behavior: "smooth" });
  };

  // Drag interaction
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
        backgroundColor: "#0E1014",
        position: "relative",
        overflow: "hidden",
      }}
      id="shop-by-goal"
    >
      <div className="site-container">
        {/* Section Header with Minimalist Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "48px",
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
              <span>DISCIPLINE & OBJECTIVES</span>
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
              SHOP BY FITNESS GOAL
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "#94A3B8",
                marginTop: "12px",
                maxWidth: "520px",
                lineHeight: "1.6",
              }}
            >
              Nutritional architectures formulated for specific athletic adaptations. Select your discipline.
            </p>
          </div>

          {/* Minimalist Prev/Next Arrow Navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => scrollByDirection("left")}
              disabled={!canScrollLeft}
              aria-label="Previous Goal"
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                backgroundColor: canScrollLeft ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: canScrollLeft ? "#FFFFFF" : "#475569",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: canScrollLeft ? "pointer" : "default",
                transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <button
              onClick={() => scrollByDirection("right")}
              disabled={!canScrollRight}
              aria-label="Next Goal"
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                backgroundColor: canScrollRight ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: canScrollRight ? "#FFFFFF" : "#475569",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: canScrollRight ? "pointer" : "default",
                transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Cinematic Card Rail (~2.5 cards visible on desktop, image-dominant) */}
      <div
        ref={scrollRef}
        className="goal-carousel-rail"
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
        {GOALS.map((g, idx) => {
          const isHovered = hoveredIdx === idx;
          const isDimmed = hoveredIdx !== null && hoveredIdx !== idx;

          return (
            <Link
              key={g.goalNumber}
              href={`/products?goal=${encodeURIComponent(g.goal)}`}
              className="goal-carousel-card"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                flex: "0 0 auto",
                width: "clamp(320px, 36vw, 480px)",
                height: "clamp(500px, 62vh, 620px)",
                position: "relative",
                border: isHovered ? "1px solid rgba(143, 184, 216, 0.4)" : "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: "12px",
                overflow: "hidden",
                scrollSnapAlign: "start",
                backgroundColor: "#090A0C",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "36px 32px",
                textDecoration: "none",
                transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                transform: isHovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1.0)",
                opacity: isDimmed ? 0.78 : 1.0,
                filter: isHovered ? "brightness(1.08)" : isDimmed ? "brightness(0.9)" : "none",
                boxShadow: isHovered
                  ? "0 28px 56px rgba(0, 0, 0, 0.85), 0 0 40px rgba(143, 184, 216, 0.08)"
                  : "0 14px 36px rgba(0, 0, 0, 0.5)",
              }}
            >
              {/* Card image occupies 75-80% of visual area */}
              <Image
                src={g.img}
                alt={g.title}
                fill
                sizes="(max-width: 768px) 85vw, 480px"
                className="goal-bg-artwork"
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                  transition: "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
                  transform: isHovered ? "scale(1.06)" : "scale(1.0)",
                }}
              />

              {/* Exact Dark Gradient: bottom fades naturally into card background */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, transparent 45%, rgba(9,10,12,0.30) 65%, #090A0C 100%)",
                  zIndex: 1,
                  pointerEvents: "none",
                }}
              />

              {/* Top: Category Tag & Goal Number (minimal, clean) */}
              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "800",
                    color: "#8FB8D8",
                    letterSpacing: "2.5px",
                    textTransform: "uppercase",
                  }}
                >
                  {g.tag}
                </div>

                <div
                  className="font-stats"
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "rgba(255, 255, 255, 0.5)",
                    letterSpacing: "1.5px",
                  }}
                >
                  {g.goalNumber}
                </div>
              </div>

              {/* Bottom: Minimalist Typography (Title + EXPLORE →) */}
              <div style={{ position: "relative", zIndex: 2 }}>
                <h3
                  className="font-display"
                  style={{
                    fontSize: "clamp(34px, 3.2vw, 46px)",
                    color: "#FFFFFF",
                    letterSpacing: "1.2px",
                    lineHeight: "1.0",
                    marginBottom: "16px",
                    textTransform: "uppercase",
                  }}
                >
                  {g.title}
                </h3>

                {/* Minimal CTA */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    fontWeight: "800",
                    color: isHovered ? "#A9CCE5" : "#8FB8D8",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    transition: "gap 0.25s ease, color 0.25s ease",
                  }}
                >
                  <span>EXPLORE</span>
                  <span style={{ transform: isHovered ? "translateX(6px)" : "none", transition: "transform 0.25s ease" }}>
                    →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
