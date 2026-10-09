"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";
import { PROVANA_PRODUCTS } from "@/data/products";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  recommendedProduct?: typeof PROVANA_PRODUCTS[0];
}

const QUICK_PROMPTS = [
  "Lean Muscle Protein under ₹3000",
  "How to take Creatine Monohydrate?",
  "Best Pre-Workout for Energy",
  "Plant Protein for Sensitive Stomach",
];

export default function AiAdvisorWidget() {
  const { addToCart, buyNow } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const idCounterRef = React.useRef(10);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "bot",
      text: "Hello athlete! I am your PROVANA Nutrition & Protocol Advisor. What is your training goal today?",
    },
  ]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    idCounterRef.current += 1;
    const userMsg: ChatMessage = {
      id: "u-" + idCounterRef.current,
      sender: "user",
      text: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal("");

    setTimeout(() => {
      const q = text.toLowerCase();
      let botResponse = "I can guide you through our clinical sports nutrition range. Could you specify if your focus is muscle building, explosive strength, or daily recovery?";
      let recProd: typeof PROVANA_PRODUCTS[0] | undefined;

      if (q.includes("lean") || q.includes("whey") || q.includes("isolate") || q.includes("3000")) {
        const prod = PROVANA_PRODUCTS.find((p) => p.id === "pv-whey-isolate");
        botResponse = "For maximum lean muscle hypertrophy with near-zero fat and lactose, our 100% Pure Whey Isolate is cold microfiltered and delivers 27g protein per scoop.";
        recProd = prod;
      } else if (q.includes("creatine") || q.includes("strength") || q.includes("power")) {
        const prod = PROVANA_PRODUCTS.find((p) => p.id === "pv-creatine-mono");
        botResponse = "Creatine Monohydrate (Creapure® 99.99%) accelerates cellular ATP regeneration. A daily maintenance scoop of 3g with water or your protein shake ensures peak strength output.";
        recProd = prod;
      } else if (q.includes("pre") || q.includes("energy") || q.includes("pump")) {
        const prod = PROVANA_PRODUCTS.find((p) => p.id === "pv-pre-workout");
        botResponse = "Our Pre-Workout Matrix combines 300mg clean caffeine with 6g L-citrulline malate and beta-alanine for skin-splitting pumps with zero crash.";
        recProd = prod;
      } else if (q.includes("plant") || q.includes("vegan") || q.includes("stomach")) {
        const prod = PROVANA_PRODUCTS.find((p) => p.id === "pv-plant-protein");
        botResponse = "Our Organic Superfood Plant Protein blends organic pea and brown rice with supergreens and DigeZyme® enzymes for effortless, bloat-free digestion.";
        recProd = prod;
      }

      idCounterRef.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: "b-" + idCounterRef.current,
          sender: "bot",
          text: botResponse,
          recommendedProduct: recProd,
        },
      ]);
    }, 400);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "28px",
          right: "28px",
          zIndex: 9999,
          backgroundColor: "#141720",
          border: "1.5px solid var(--color-accent)",
          borderRadius: "9999px",
          padding: "10px 18px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7), 0 0 16px rgba(148, 163, 184, 0.25)",
          cursor: "pointer",
          transition: "transform 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <span style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: "18px" }}>🤖</span>
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              width: "8px",
              height: "8px",
              backgroundColor: "#10B981",
              borderRadius: "50%",
            }}
          />
        </span>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#FFF", letterSpacing: "0.4px" }}>
            AI NUTRITION ADVISOR
          </div>
          <div style={{ fontSize: "10px", color: "#10B981", fontWeight: "700" }}>● ONLINE &amp; GROUNDED</div>
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "86px",
            right: "28px",
            width: "380px",
            height: "520px",
            backgroundColor: "#141720",
            border: "1.5px solid var(--color-border)",
            borderRadius: "var(--radius-modal)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.9)",
            display: "flex",
            flexDirection: "column",
            zIndex: 99999,
            overflow: "hidden",
            animation: "fadeIn 0.2s ease-out forwards",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              backgroundColor: "#0D1016",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>🤖</span>
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#FFF" }}>PROVANA AI Advisor</h4>
                <span style={{ fontSize: "11px", color: "var(--color-accent)", fontWeight: "600" }}>
                  Grounded in PROVANA Catalog
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#CBD5E1",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  backgroundColor: m.sender === "user" ? "var(--color-accent)" : "#1C2331",
                  color: m.sender === "user" ? "#0B0C0E" : "#FFFFFF",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  fontWeight: m.sender === "user" ? "700" : "500",
                }}
              >
                <div>{m.text}</div>

                {/* Inline Product Card Recommendation */}
                {m.recommendedProduct && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "10px",
                      backgroundColor: "#0D1016",
                      border: "1px solid var(--color-border)",
                      borderRadius: "6px",
                      color: "#FFF",
                    }}
                  >
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ position: "relative", width: "40px", height: "40px", flexShrink: 0, backgroundColor: "#141720", borderRadius: "4px" }}>
                        <Image src={m.recommendedProduct.img} alt={m.recommendedProduct.name} fill style={{ objectFit: "contain", padding: "2px" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "12px", fontWeight: "800", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {m.recommendedProduct.name}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--color-accent)", fontWeight: "700" }}>
                          ₹{m.recommendedProduct.price.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => addToCart(m.recommendedProduct!)}
                        style={{
                          flex: 1,
                          height: "30px",
                          backgroundColor: "#E2E8F0",
                          color: "#0B0C0E",
                          fontSize: "11px",
                          fontWeight: "800",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        ADD TO CART 🛒
                      </button>
                      <button
                        onClick={() => buyNow(m.recommendedProduct!)}
                        style={{
                          flex: 1,
                          height: "30px",
                          backgroundColor: "#374151",
                          color: "#FFF",
                          fontSize: "11px",
                          fontWeight: "800",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        BUY NOW ⚡
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div style={{ padding: "8px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: "6px", overflowX: "auto" }}>
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                style={{
                  whiteSpace: "nowrap",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  backgroundColor: "#0D1016",
                  border: "1px solid #2B3342",
                  color: "#CBD5E1",
                  fontSize: "11px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: "12px 14px",
              backgroundColor: "#0D1016",
              borderTop: "1px solid var(--color-border)",
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              type="text"
              placeholder="Ask about protein, creatine, stacks..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              style={{
                flex: 1,
                height: "38px",
                padding: "0 12px",
                borderRadius: "6px",
                fontSize: "12.5px",
                backgroundColor: "#161B24",
                border: "1px solid #2B3342",
                color: "#FFF",
              }}
            />
            <button
              type="submit"
              style={{
                width: "42px",
                height: "38px",
                borderRadius: "6px",
                backgroundColor: "var(--color-accent)",
                color: "#0B0C0E",
                fontWeight: "800",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
