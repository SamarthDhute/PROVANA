import React from "react";
import HeroSlider from "@/components/home/HeroSlider";
import EditorialStatement from "@/components/home/EditorialStatement";
import ProvanaMarquee from "@/components/home/ProvanaMarquee";
import BestSellerCarousel from "@/components/home/BestSellerCarousel";
import ProteinStackSection from "@/components/home/ProteinStackSection";
import NutritionRoutine from "@/components/home/NutritionRoutine";
import BeastModeSection from "@/components/home/BeastModeSection";
import WhyProvanaSection from "@/components/home/WhyProvanaSection";
import LearnNutritionSection from "@/components/home/LearnNutritionSection";
import CommunitySection from "@/components/home/CommunitySection";

export const metadata = {
  title: "PROVANA | Fuel A Stronger You — Premium Sports Nutrition DTC",
  description: "Cinematic sports nutrition for elite athletes. Lab-tested cold CFM whey isolates, micronized Creapure® creatine, pre-workout matrices, and high-protein nutrition.",
};

export default function HomePage() {
  return (
    <div style={{ backgroundColor: "#090A0C", minHeight: "100vh", overflowX: "hidden" }}>
      {/* 01. FULLSCREEN CINEMATIC HERO (80-90vh) */}
      <HeroSlider />

      {/* 02. FULL-BLEED EDITORIAL FITNESS STATEMENT (TRAIN HARD. RECOVER HARDER.) */}
      <EditorialStatement />

      {/* 04. PROVANA EDITORIAL TICKER MARQUEE */}
      <ProvanaMarquee />

      {/* 05. PROVANA BEST SELLERS PRODUCT CAROUSEL (PRODUCT-FIRST) */}
      <BestSellerCarousel />

      {/* 06. BUILD YOUR PROTEIN STACK (OVERLAPPING PRODUCT CAMPAIGN) */}
      <ProteinStackSection />

      {/* 07. YOUR DAILY NUTRITION ROUTINE (EDITORIAL PROTOCOL TIMELINE) */}
      <NutritionRoutine />

      {/* 08. FULL-BLEED BEAST MODE (NO SHORTCUTS. JUST PROGRESS.) */}
      <BeastModeSection />

      {/* 09. WHY PROVANA (HORIZONTAL EDITORIAL METRIC LAYOUT) */}
      <WhyProvanaSection />

      {/* 10. LEARN YOUR NUTRITION (EDITORIAL MAGAZINE) */}
      <LearnNutritionSection />

      {/* 11. COMMUNITY / LIFESTYLE ATHLETE NETWORK */}
      <CommunitySection />
    </div>
  );
}
