"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

export interface HeroSlide {
  id: string | number;
  image: string;
  hasBakedText: boolean;
  eyebrow?: string;
  title?: string;
  titleLine1?: string;
  titleLine2?: string;
  description?: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  objectPosition?: string;
  textPosition?: "left" | "right" | "center";
  contentPosition?: "bottom-left" | "bottom-right" | "center" | "left";
}

/**
 * SOURCE OF TRUTH: Curated Hero Slides from the existing `heroimage` folder.
 * Supports both:
 * TYPE A: `hasBakedText: false` -> Renders full frontend eyebrow, large title, description, CTAs.
 * TYPE B: `hasBakedText: true`  -> Image already contains typography; renders ONLY eyebrow tag & CTAs.
 */
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-whey",
    image: "/heroimage/hero_whey_protiene.png",
    hasBakedText: true,
    eyebrow: "FLAGSHIP CFM NUTRITION",
    primaryCta: {
      label: "SHOP WHEY PROTEIN",
      href: "/products?category=Protein",
    },
    secondaryCta: {
      label: "EXPLORE PROTEIN",
      href: "/products",
    },
    objectPosition: "center center",
    textPosition: "left",
    contentPosition: "bottom-left",
  },
  {
    id: "slide-oats",
    image: "/heroimage/hero_oats.png",
    hasBakedText: true,
    eyebrow: "DAILY METABOLIC NUTRITION",
    primaryCta: {
      label: "GET PROTEIN OATS",
      href: "/products?category=Healthy%20Foods",
    },
    secondaryCta: {
      label: "ALL ESSENTIALS",
      href: "/products",
    },
    objectPosition: "center center",
    textPosition: "left",
    contentPosition: "bottom-left",
  },
  {
    id: "slide-creatine",
    image: "/heroimage/hero_creatine.png",
    hasBakedText: true,
    eyebrow: "RAW CELLULAR ATP OUTPUT",
    primaryCta: {
      label: "SHOP CREATINE",
      href: "/products?category=Creatine",
    },
    secondaryCta: {
      label: "VIEW PROTOCOL",
      href: "/products",
    },
    objectPosition: "center center",
    textPosition: "left",
    contentPosition: "bottom-left",
  },
  {
    id: "slide-drink",
    image: "/heroimage/hero_drink.png",
    hasBakedText: true,
    eyebrow: "CHILLED INSTANT RECOVERY",
    primaryCta: {
      label: "SHOP RTD SHAKES",
      href: "/products?category=Healthy%20Foods",
    },
    secondaryCta: {
      label: "EXPLORE PRODUCTS",
      href: "/products",
    },
    objectPosition: "center center",
    textPosition: "left",
    contentPosition: "bottom-left",
  },
  {
    id: "slide-zoro",
    image: "/heroimage/zoro_hero.png",
    hasBakedText: true,
    eyebrow: "LIMITED CAMPAIGN ARSENAL",
    primaryCta: {
      label: "SHOP THE CAMPAIGN",
      href: "/products",
    },
    secondaryCta: {
      label: "EXPLORE PERFORMANCE",
      href: "/products?category=Performance",
    },
    objectPosition: "center center",
    textPosition: "left",
    contentPosition: "bottom-left",
  },
];

const AUTOPLAY_DURATION = 5000; // 5000ms

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const totalSlides = HERO_SLIDES.length;

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Advance forward
  const nextSlide = useCallback(() => {
    setIsTransitioning(true);
    setCurrentSlide((prev) => prev + 1);
  }, []);

  // Move backward
  const prevSlide = useCallback(() => {
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setIsTransitioning(true);
    setCurrentSlide(index);
  };

  // Seamless infinite loop without stutter
  const handleTransitionEnd = () => {
    if (currentSlide >= totalSlides) {
      setIsTransitioning(false);
      setCurrentSlide(0);
    }
  };

  // Autoplay with hover pause, document visibility pause, and reduced-motion check
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    if (isPaused) return;

    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const timer = setInterval(() => {
      nextSlide();
    }, AUTOPLAY_DURATION);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [nextSlide, isPaused]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Normalized active index (0 to totalSlides - 1)
  const activeDotIndex = currentSlide % totalSlides;

  // Extra clone appended for seamless infinite forward loop
  const slidesToRender = [...HERO_SLIDES, HERO_SLIDES[0]];

  return (
    <section
      className="hero-slider-section"
      id="hero-slider-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ position: "relative", backgroundColor: "#090A0C", overflow: "hidden" }}
    >
      <div
        className="hero-slider-wrapper"
        id="hero-slider-wrapper"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: "relative",
          width: "100%",
          height: "clamp(560px, 86vh, 900px)",
          overflow: "hidden",
          backgroundColor: "#090A0C",
        }}
      >
        {/* Slides Track */}
        <div
          className="hero-slider-track"
          id="hero-slider-track"
          onTransitionEnd={handleTransitionEnd}
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            transform: `translateX(-${currentSlide * 100}%)`,
            transition: isTransitioning ? "transform 0.70s cubic-bezier(0.22, 1, 0.36, 1)" : "none",
            willChange: "transform",
          }}
        >
          {slidesToRender.map((slide, idx) => {
            const isSlideActive = (idx % totalSlides) === activeDotIndex;
            const isBaked = slide.hasBakedText;

            return (
              <div
                key={`${slide.id}-${idx}`}
                className={`hero-slide ${isSlideActive ? "active" : ""}`}
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {/* Background Hero Image */}
                <Image
                  src={slide.image}
                  alt={slide.eyebrow || "Provana Hero Slide"}
                  fill
                  sizes="100vw"
                  className="hero-slide-img"
                  priority={idx === 0}
                  loading={idx === 0 ? "eager" : "lazy"}
                  style={{
                    objectFit: "cover",
                    objectPosition: slide.objectPosition || "center center",
                    transform: isSlideActive ? "scale(1.03)" : "scale(1.00)",
                    transition: "transform 6s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                />

                {/* Adaptive Directional Gradient Overlay:
                    For baked-text slides: Very subtle left vignette to preserve baked-in text brightness.
                    For clean-image slides: Directional 90deg gradient for high-contrast frontend typography. */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: isBaked
                      ? "linear-gradient(90deg, rgba(5,7,9,0.30) 0%, rgba(5,7,9,0.12) 40%, transparent 70%)"
                      : "linear-gradient(90deg, rgba(5,7,9,0.82) 0%, rgba(5,7,9,0.50) 38%, rgba(5,7,9,0.18) 70%, rgba(5,7,9,0.04) 100%)",
                    zIndex: 2,
                    pointerEvents: "none",
                  }}
                />

                {/* Subtle Bottom Shadow Gradient for Seamless Section Blend */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "90px",
                    background: "linear-gradient(to top, rgba(14, 16, 20, 0.75) 0%, transparent 100%)",
                    zIndex: 3,
                    pointerEvents: "none",
                  }}
                />

                {/* Hero Editorial Content Overlay */}
                <div
                  className="site-container"
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 4,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: isBaked ? "flex-end" : "center",
                    alignItems: slide.textPosition === "center" ? "center" : "flex-start",
                    paddingTop: "20px",
                    paddingBottom: isBaked ? "clamp(55px, 8vh, 85px)" : "60px",
                  }}
                >
                  <div style={{ maxWidth: isBaked ? "520px" : "620px" }}>
                    {/* Eyebrow Protocol Tag */}
                    {slide.eyebrow && (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "10px",
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#8FB8D8",
                          letterSpacing: "3px",
                          textTransform: "uppercase",
                          marginBottom: isBaked ? "14px" : "16px",
                          backgroundColor: isBaked ? "rgba(9, 10, 12, 0.65)" : "transparent",
                          backdropFilter: isBaked ? "blur(8px)" : "none",
                          padding: isBaked ? "5px 12px" : "0",
                          borderRadius: isBaked ? "4px" : "0",
                          border: isBaked ? "1px solid rgba(143, 184, 216, 0.2)" : "none",
                        }}
                      >
                        <span
                          style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            backgroundColor: "#8FB8D8",
                            boxShadow: "0 0 10px rgba(143, 184, 216, 0.7)",
                          }}
                        />
                        <span>{slide.eyebrow}</span>
                        <span style={{ color: "#64748B" }}>•</span>
                        <span style={{ color: "#94A3B8", letterSpacing: "1px" }}>
                          {(idx % totalSlides) + 1} / {totalSlides}
                        </span>
                      </div>
                    )}

                    {/* ONLY RENDER LARGE TITLE & DESCRIPTION IF hasBakedText = FALSE */}
                    {!isBaked && (
                      <>
                        <h1
                          className="font-display hero-campaign-heading"
                          style={{
                            fontSize: "clamp(46px, 7vw, 98px)",
                            color: "#FFFFFF",
                            letterSpacing: "1.5px",
                            lineHeight: "0.94",
                            marginBottom: "18px",
                            textTransform: "uppercase",
                          }}
                        >
                          <span style={{ display: "block" }}>{slide.titleLine1 || slide.title}</span>
                          {slide.titleLine2 && (
                            <span style={{ display: "block", color: "#8FB8D8" }}>{slide.titleLine2}</span>
                          )}
                        </h1>

                        {slide.description && (
                          <p
                            style={{
                              fontSize: "15px",
                              color: "#CBD5E1",
                              lineHeight: "1.6",
                              maxWidth: "480px",
                              marginBottom: "36px",
                            }}
                          >
                            {slide.description}
                          </p>
                        )}
                      </>
                    )}

                    {/* Dual Action CTAs: The Main Clean UI Element */}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                      <Link
                        href={slide.primaryCta.href}
                        style={{
                          height: "50px",
                          padding: "0 32px",
                          backgroundColor: "#8FB8D8",
                          color: "#090A0C",
                          fontWeight: "800",
                          fontSize: "12.5px",
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          borderRadius: "4px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
                          boxShadow: "0 10px 28px rgba(143, 184, 216, 0.25)",
                          textDecoration: "none",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#A9CCE5";
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 14px 34px rgba(143, 184, 216, 0.35)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#8FB8D8";
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 10px 28px rgba(143, 184, 216, 0.25)";
                        }}
                      >
                        <span>{slide.primaryCta.label}</span>
                        <span>→</span>
                      </Link>

                      {slide.secondaryCta && (
                        <Link
                          href={slide.secondaryCta.href}
                          style={{
                            height: "50px",
                            padding: "0 28px",
                            backgroundColor: "rgba(9, 10, 12, 0.5)",
                            backdropFilter: "blur(10px)",
                            color: "#FFFFFF",
                            border: "1px solid rgba(255, 255, 255, 0.35)",
                            fontWeight: "700",
                            fontSize: "12.5px",
                            letterSpacing: "0.8px",
                            textTransform: "uppercase",
                            borderRadius: "4px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s ease",
                            textDecoration: "none",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(143, 184, 216, 0.15)";
                            e.currentTarget.style.borderColor = "#8FB8D8";
                            e.currentTarget.style.color = "#8FB8D8";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(9, 10, 12, 0.5)";
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.35)";
                            e.currentTarget.style.color = "#FFFFFF";
                          }}
                        >
                          <span>{slide.secondaryCta.label}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Minimalist Desktop Navigation Arrows */}
        <button
          className="hero-slider-nav hero-nav-prev"
          id="hero-slider-prev"
          aria-label="Previous Slide"
          onClick={(e) => {
            e.preventDefault();
            prevSlide();
          }}
          style={{
            position: "absolute",
            top: "50%",
            left: "28px",
            transform: "translateY(-50%)",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: "rgba(9, 10, 12, 0.65)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#FFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#8FB8D8";
            e.currentTarget.style.color = "#090A0C";
            e.currentTarget.style.borderColor = "#8FB8D8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(9, 10, 12, 0.65)";
            e.currentTarget.style.color = "#FFF";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <button
          className="hero-slider-nav hero-nav-next"
          id="hero-slider-next"
          aria-label="Next Slide"
          onClick={(e) => {
            e.preventDefault();
            nextSlide();
          }}
          style={{
            position: "absolute",
            top: "50%",
            right: "28px",
            transform: "translateY(-50%)",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: "rgba(9, 10, 12, 0.65)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#FFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#8FB8D8";
            e.currentTarget.style.color = "#090A0C";
            e.currentTarget.style.borderColor = "#8FB8D8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(9, 10, 12, 0.65)";
            e.currentTarget.style.color = "#FFF";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        {/* Minimalist Pagination & Subtle Progress Indicator */}
        <div
          className="hero-pagination"
          id="hero-pagination"
          role="tablist"
          aria-label="Hero slider pagination"
          style={{
            position: "absolute",
            bottom: "28px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            zIndex: 10,
            backgroundColor: "rgba(9, 10, 12, 0.75)",
            backdropFilter: "blur(12px)",
            padding: "8px 20px",
            borderRadius: "9999px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === activeDotIndex;
            return (
              <button
                key={slide.id}
                className={`hero-page-dot ${isActive ? "active" : ""}`}
                aria-label={`Go to slide ${idx + 1}: ${slide.eyebrow || "Slide"}`}
                onClick={() => goToSlide(idx)}
                style={{
                  width: isActive ? "34px" : "8px",
                  height: "5px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  padding: 0,
                  transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: isActive ? "100%" : "0%",
                    backgroundColor: "#8FB8D8",
                    borderRadius: "9999px",
                    transition: isActive && !isPaused ? `width ${AUTOPLAY_DURATION}ms linear` : "none",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Trust Badges Strip Below Slider — Clean Athletic Minimalist Bar */}
      <div
        className="hero-trust-bar"
        style={{
          backgroundColor: "#0B0C0E",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          padding: "18px 0",
        }}
      >
        <div className="site-container hero-trust-flex">
          <div className="hero-trust-item">
            <span style={{ color: "#8FB8D8", fontSize: "16px" }}>🛡️</span>
            <span>100% Authentic Nutrition</span>
          </div>
          <div className="hero-trust-item">
            <span style={{ color: "#8FB8D8", fontSize: "16px" }}>🚀</span>
            <span>Free Express Air Delivery Above ₹999</span>
          </div>
          <div className="hero-trust-item">
            <span style={{ color: "#8FB8D8", fontSize: "16px" }}>🔬</span>
            <span>NABL Lab Tested &amp; Informed-Choice</span>
          </div>
          <div className="hero-trust-item">
            <span style={{ color: "#8FB8D8", fontSize: "16px" }}>🔄</span>
            <span>Zero-Spike Clean Formulations</span>
          </div>
        </div>
      </div>
    </section>
  );
}
