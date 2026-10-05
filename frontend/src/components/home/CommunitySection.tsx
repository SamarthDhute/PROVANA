"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function CommunitySection() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitted(true);
    }
  };

  return (
    <section
      style={{
        position: "relative",
        padding: "clamp(90px, 12vw, 160px) 0",
        backgroundColor: "#0B0C0E",
        overflow: "hidden",
      }}
      id="provana-community"
    >
      {/* Background Documentary Lifestyle Photography */}
      <Image
        src="/assets/images/community_banner.png"
        alt="Provana Athlete Community"
        fill
        sizes="100vw"
        style={{
          objectFit: "cover",
          objectPosition: "center 35%",
          filter: "grayscale(100%) contrast(115%) brightness(0.25)",
        }}
      />

      {/* Atmospheric Gradients */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, #0B0C0E 0%, rgba(11, 12, 14, 0.7) 40%, rgba(11, 12, 14, 0.7) 60%, #070809 100%)",
          zIndex: 1,
        }}
      />

      <div className="site-container" style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: "840px" }}>
        <div
          style={{
            fontSize: "12px",
            fontWeight: "800",
            color: "#8FB8D8",
            letterSpacing: "3px",
            textTransform: "uppercase",
            marginBottom: "16px",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ width: "28px", height: "1px", backgroundColor: "#8FB8D8" }} />
          <span>COMMUNITY & CULTURE</span>
          <span style={{ width: "28px", height: "1px", backgroundColor: "#8FB8D8" }} />
        </div>

        <h2
          className="font-display"
          style={{
            fontSize: "clamp(46px, 6.5vw, 88px)",
            color: "#FFFFFF",
            letterSpacing: "2px",
            lineHeight: "0.92",
            textTransform: "uppercase",
            marginBottom: "24px",
          }}
        >
          <span style={{ display: "block" }}>FOR THOSE WHO</span>
          <span style={{ display: "block" }}>MEASURE PROGRESS</span>
          <span style={{ display: "block", color: "#8FB8D8" }}>IN THE WORK.</span>
        </h2>

        <p
          style={{
            fontSize: "15.5px",
            color: "#94A3B8",
            lineHeight: "1.65",
            maxWidth: "520px",
            margin: "0 auto 40px",
          }}
        >
          Join thousands of athletes, lifters, and competitors who reject shortcuts. Receive early formula drops, laboratory test logs, and member-exclusive protocol discounts.
        </p>

        {/* Minimalist Newsletter Form */}
        {isSubmitted ? (
          <div
            style={{
              padding: "16px 32px",
              backgroundColor: "rgba(143, 184, 216, 0.12)",
              border: "1px solid #8FB8D8",
              borderRadius: "4px",
              color: "#FFFFFF",
              fontSize: "13px",
              fontWeight: "700",
              letterSpacing: "0.5px",
              display: "inline-block",
            }}
          >
            ✓ WELCOME TO THE PROVANA COMMUNITY. CHECK YOUR INBOX FOR YOUR FIRST PROTOCOL.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              flexWrap: "wrap",
              maxWidth: "540px",
              margin: "0 auto",
            }}
          >
            <input
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address for community newsletter"
              style={{
                flex: "1 1 280px",
                height: "52px",
                backgroundColor: "rgba(22, 25, 30, 0.8)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "4px",
                padding: "0 20px",
                color: "#FFFFFF",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#8FB8D8")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)")}
            />
            <button
              type="submit"
              style={{
                height: "52px",
                padding: "0 32px",
                backgroundColor: "#8FB8D8",
                color: "#090A0C",
                fontWeight: "800",
                fontSize: "13px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
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
              JOIN THE PROVANA COMMUNITY →
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
