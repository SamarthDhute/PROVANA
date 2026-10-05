"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const ARTICLES = [
  {
    id: "protein-requirement",
    category: "DAILY NUTRITION",
    readTime: "5 MIN READ",
    headline: "HOW MUCH PROTEIN DO YOU REALLY NEED?",
    snippet: "The generic baseline of 0.8g per kg bodyweight only prevents deficiency in sedentary populations. Discover how to calculate optimal intake between 1.6g and 2.2g for genuine athletic recovery and myofibrillar hypertrophy.",
    relatedProductSlug: "provana-pure-iso-whey-protein-1kg",
    relatedProductName: "Provana 100% Pure Whey Isolate",
    img: "/assets/images/cat_whey_isolate.jpg",
    content: `
      The generic guideline of 0.8g protein per kilogram of bodyweight was established decades ago simply to prevent clinical nitrogen deficiency in non-exercising populations.

      For resistance-trained athletes and individuals actively pursuing muscular hypertrophy or fat loss preservation, meta-analyses consistently show that optimal adaptations occur between 1.6g and 2.2g of high-biological-value protein per kilogram of bodyweight.

      Timing also plays a significant role. Muscle protein synthesis (MPS) is maximized when 25g to 40g of protein rich in essential amino acids (specifically ~3g of leucine) is ingested every 3 to 4 hours, creating sustained intracellular signaling for repair.
    `,
  },
  {
    id: "creatine-guide",
    category: "PERFORMANCE SCIENCE",
    readTime: "6 MIN READ",
    headline: "CREATINE MONOHYDRATE: THE 200-MESH CREAPURE® PROTOCOL",
    snippet: "Debunking myths around water retention and kidney load. Why 3g-5g of micronized Creapure® daily maximizes cellular ATP recycling.",
    relatedProductSlug: "provana-creapure-creatine-monohydrate-250g",
    relatedProductName: "Provana Creatine Monohydrate",
    img: "/assets/images/creatine_creapure.jpg",
    content: `
      Creatine monohydrate remains the single most researched ergogenic aid in sports science. It increases intramuscular phosphocreatine reserves, facilitating rapid adenosine triphosphate (ATP) resynthesis during maximal anaerobic exertion.

      An aggressive high-dose loading phase is not mandatory. Taking 3g to 5g of pure micronized 200-mesh Creapure® daily saturates skeletal muscle phosphocreatine levels within 21 to 28 days with zero gastrointestinal discomfort.
    `,
  },
  {
    id: "whey-vs-isolate",
    category: "NUTRITION SCIENCE",
    readTime: "4 MIN READ",
    headline: "WHEY CONCENTRATE VS CFM ISOLATE: WHEN PURITY MATTERS",
    snippet: "Understand cross-flow microfiltration (CFM), lactose reduction, and when 90%+ pure protein concentration makes a tangible difference.",
    relatedProductSlug: "provana-pure-iso-whey-protein-1kg",
    relatedProductName: "Provana Pure Iso Whey Protein",
    img: "/assets/images/cat_oats.jpg",
    content: `
      While both concentrate and isolate are derived from fresh dairy whey, the refinement process differentiates their macro ratios. Whey isolate undergoes low-temperature ceramic Cross-Flow Microfiltration (CFM).

      This non-chemical filtration strips out practically all residual lactose, fat, and carbohydrates, resulting in 90%+ protein density with near-instantaneous gastric emptying and zero bloating.
    `,
  },
];

export default function LearnNutritionSection() {
  const [activeArticle, setActiveArticle] = useState<typeof ARTICLES[0] | null>(null);

  const featured = ARTICLES[0];
  const smallArticles = [ARTICLES[1], ARTICLES[2]];

  return (
    <section
      style={{
        padding: "clamp(80px, 11vw, 150px) 0",
        backgroundColor: "#0B0C0E",
        position: "relative",
      }}
      id="learn-nutrition"
    >
      <div className="site-container">
        {/* Section Header */}
        <div style={{ marginBottom: "clamp(40px, 5vw, 60px)" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: "800",
              color: "#8FB8D8",
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: "10px",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ width: "28px", height: "1px", backgroundColor: "#8FB8D8" }} />
            <span>ATHLETE KNOWLEDGE BASE</span>
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
            LEARN YOUR NUTRITION
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
            Empower your athletic trajectory with peer-reviewed sports physiology and macronutrient science.
          </p>
        </div>

        {/* Editorial Nutrition Magazine Layout (1 Large Featured 60-70% visual weight + 2 Smaller Articles) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "clamp(32px, 5vw, 56px)",
            alignItems: "start",
          }}
        >
          {/* 1. Large Featured Article (60-70% visual dominance) */}
          <article
            onClick={() => setActiveArticle(featured)}
            style={{
              cursor: "pointer",
              gridColumn: "span 1",
            }}
          >
            {/* Large Editorial Image */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "clamp(280px, 38vw, 420px)",
                borderRadius: "10px",
                overflow: "hidden",
                backgroundColor: "#16191E",
                marginBottom: "24px",
              }}
            >
              <Image
                src={featured.img}
                alt={featured.headline}
                fill
                sizes="(max-width: 768px) 100vw, 700px"
                style={{
                  objectFit: "cover",
                  transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(9, 10, 12, 0.1) 0%, rgba(9, 10, 12, 0.65) 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "20px",
                  left: "20px",
                  fontSize: "11px",
                  fontWeight: "800",
                  color: "#8FB8D8",
                  backgroundColor: "rgba(9, 10, 12, 0.8)",
                  backdropFilter: "blur(8px)",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                }}
              >
                {featured.category} • {featured.readTime}
              </div>
            </div>

            {/* Below Image: Typography & CTA */}
            <div>
              <h3
                className="font-display"
                style={{
                  fontSize: "clamp(32px, 3.5vw, 48px)",
                  color: "#FFFFFF",
                  letterSpacing: "1px",
                  lineHeight: "1.05",
                  marginBottom: "14px",
                  textTransform: "uppercase",
                }}
              >
                {featured.headline}
              </h3>

              <p
                style={{
                  fontSize: "14.5px",
                  color: "#94A3B8",
                  lineHeight: "1.65",
                  marginBottom: "22px",
                  maxWidth: "600px",
                }}
              >
                {featured.snippet}
              </p>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  fontWeight: "800",
                  color: "#8FB8D8",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  transition: "gap 0.25s ease, color 0.25s ease",
                }}
              >
                <span>READ ARTICLE</span>
                <span>→</span>
              </div>
            </div>
          </article>

          {/* 2. Two Smaller Articles Stacked Vertically */}
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(32px, 4vw, 44px)" }}>
            {smallArticles.map((article) => (
              <article
                key={article.id}
                onClick={() => setActiveArticle(article)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 1fr",
                  gap: "20px",
                  cursor: "pointer",
                  alignItems: "center",
                }}
              >
                {/* Article Image */}
                <div
                  style={{
                    position: "relative",
                    width: "140px",
                    height: "120px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    backgroundColor: "#16191E",
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={article.img}
                    alt={article.headline}
                    fill
                    sizes="160px"
                    style={{
                      objectFit: "cover",
                      transition: "transform 0.5s ease",
                    }}
                  />
                </div>

                {/* Details */}
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "800",
                      color: "#8FB8D8",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                    }}
                  >
                    {article.category}
                  </div>

                  <h4
                    className="font-display"
                    style={{
                      fontSize: "clamp(20px, 1.8vw, 24px)",
                      color: "#FFFFFF",
                      letterSpacing: "0.6px",
                      lineHeight: "1.15",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                    }}
                  >
                    {article.headline}
                  </h4>

                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "800",
                      color: "#64748B",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      transition: "color 0.2s ease",
                    }}
                  >
                    READ MORE →
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Reader Modal Overlay */}
      {activeArticle && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.88)",
            backdropFilter: "blur(12px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
          onClick={() => setActiveArticle(null)}
        >
          <div
            style={{
              backgroundColor: "#111318",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              maxWidth: "680px",
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "40px",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveArticle(null)}
              aria-label="Close reader"
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "none",
                color: "#FFFFFF",
                fontSize: "16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>

            <div style={{ fontSize: "11px", fontWeight: "800", color: "#8FB8D8", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>
              {activeArticle.category} • {activeArticle.readTime}
            </div>

            <h3 className="font-display" style={{ fontSize: "36px", color: "#FFFFFF", letterSpacing: "1px", marginBottom: "18px", textTransform: "uppercase", lineHeight: "1.05" }}>
              {activeArticle.headline}
            </h3>

            <div style={{ fontSize: "15px", color: "#CBD5E1", lineHeight: "1.8", whiteSpace: "pre-line", marginBottom: "32px" }}>
              {activeArticle.content.trim()}
            </div>

            <div style={{ padding: "18px 24px", backgroundColor: "#090A0C", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "11px", color: "#64748B", textTransform: "uppercase", fontWeight: "800", letterSpacing: "1px" }}>Recommended Formula</div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#FFFFFF" }}>{activeArticle.relatedProductName}</div>
              </div>
              <Link
                href={`/products/${activeArticle.relatedProductSlug}`}
                onClick={() => setActiveArticle(null)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#8FB8D8",
                  color: "#090A0C",
                  fontWeight: "800",
                  fontSize: "12px",
                  letterSpacing: "0.8px",
                  borderRadius: "4px",
                  textDecoration: "none",
                }}
              >
                VIEW FORMULA →
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
