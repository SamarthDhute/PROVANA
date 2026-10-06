# PROVANA — Frontend Software Requirements Specification (SRS)
**Project:** PROVANA — Sports Nutrition & Fitness E-Commerce Platform  
**Target Architecture:** Next.js 14/15 (App Router) + TypeScript + Vanilla CSS/CSS Modules + Design Tokens  
**Version:** 1.0 (Production Roadmap)  
**Date:** October 2026  
**Reference Assets:** `prototype/`, `PROVANA_Design_Tokens.md`, `docx/`  

---

## 1. Executive Summary & Vision

### 1.1 Objective
Transform the verified PROVANA customer storefront prototype into an enterprise-grade, high-performance **Next.js application** that adheres to the architectural philosophy:
> **"CMS controls content; application code controls behavior."**

The platform delivers a luxury athletic DTC e-commerce experience (Dark Charcoal + Smoky Obsidian Crystal + Athletic Grey) with sub-second page transitions, SEO-optimized Server-Side Rendering (SSR) / Static Site Generation (SSG), rigorous type safety, modular component architecture, and responsive fluid layouts.

### 1.2 Technology Stack
- **Framework:** Next.js (App Router, React Server Components + Client Components)
- **Language:** TypeScript 5.x (Strict mode enabled)
- **Styling Strategy:** Vanilla CSS + CSS Modules (`.module.css`) powered by centralized Design Tokens (`tokens.css`) without utility lock-in
- **Typography:** Google Fonts optimized via `next/font/google` (`Bebas Neue` for Display, `Manrope` for Body/UI, `Oswald` for Badges & Nutrition Metrics)
- **State Management:** Lightweight reactive client stores (Zustand or React Context with local storage persistence) for Cart, Wishlist, Filter States, and Checkout
- **Icons & Assets:** Optimized SVG icons + `next/image` with WebP/AVIF automated optimization
- **Data Validation & DTOs:** Zod schemas for runtime validation of CMS payloads, product models, and checkout forms

---

## 2. Design Token System Integration

The Next.js frontend directly implements the design tokens specified in `PROVANA_Design_Tokens.md` and proven in the prototype:

### 2.1 Color Palette
- **Canvas / Background:** `--color-bg: #0B0C0E` (Matte athletic charcoal)
- **Card Surfaces:** `--color-surface: #141720` / `--color-surface-hover: #191E28`
- **Borders & Dividers:** `--color-border: #262B35` / `--color-border-focus: #94A3B8` / `--color-border-hover: rgba(148, 163, 184, 0.5)`
- **Brand Accent:** `--color-accent: #94A3B8` (Smoky Obsidian Crystal for highlights, active tabs, badges)
- **Primary Action (Cart):** `--color-btn-cart: #E2E8F0` (Crisp light contrast)
- **Secondary Action (Buy Now):** `--color-btn-buy: #374151` / `--color-btn-buy-hover: #4B5563` (Sleek athletic titanium grey)
- **Typography Contrasts:** `--color-text-main: #FFFFFF`, `--color-text-muted: #94A3B8`, `--color-text-sub: #CBD5E1`
- **Badges & Statuses:** Success Emerald (`#10B981`), Warning Amber (`#F59E0B`), Danger Red (`#EF4444`)

### 2.2 Typography Hierarchy
- **Display & Section Headers:** `Bebas Neue`, uppercase, condensed, athletic editorial weight
- **Body, Navigation, Products:** `Manrope`, geometric, weights 400, 500, 600, 700, 800
- **Badges & Nutrition Stats:** `Oswald`, technical tabular metrics, weights 500, 600, 700

### 2.3 Motion & Spacing
- Base 8px unit (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`)
- Micro-animations: `150ms-250ms cubic-bezier(0.22, 1, 0.36, 1)` for button hovers, card elevations, and drawer slides
- SVG S-curve connector animations between sequential showcase items

---

## 3. System Architecture & Folder Structure

```text
frontend/
├── public/
│   ├── assets/
│   │   ├── heroImages/       # High-res hero slides
│   │   ├── product-catalog/  # High-res product renders (isolate, mass gainer, bcaa, etc.)
│   │   ├── images/           # Category thumbnails, trust badges, certificates
│   │   └── brand/            # Provana logo SVG/PNG
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # Root layout (Fonts, Providers, Navbar, Footer, Drawers)
│   │   ├── page.tsx          # Homepage (Hero, Goals, Stack, Best Sellers, Learn Hub)
│   │   ├── products/
│   │   │   ├── page.tsx      # All Products Catalog Page (Search, Filter, Sort, Grid)
│   │   │   └── [slug]/
│   │   │       └── page.tsx  # Product Detail Page (SSR, Nutrition Table, Reviews)
│   │   ├── cart/
│   │   │   └── page.tsx      # Full Cart Page (Fallback for drawer)
│   │   ├── checkout/
│   │   │   └── page.tsx      # 4-Step Express Checkout
│   │   ├── track-order/
│   │   │   └── page.tsx      # Real-time Order Tracking
│   │   └── api/              # Route handlers (Mock CMS, verification, coupons)
│   ├── components/
│   │   ├── common/           # Button, Modal, Toast, Badge, StarRating, Accordion
│   │   ├── layout/           # Navbar, MegaMenu, AnnouncementBar, Footer, MobileDrawer
│   │   ├── home/             # HeroSlider, GoalCards, StackBuilder, BestSellersShowcase, LearnSection
│   │   ├── catalog/          # ProductCard, FilterPills, SortSelect, SearchToolbar
│   │   ├── pdp/              # ProductGallery, NutritionTable, VariantSelector, AllergenAccordion
│   │   ├── cart/             # CartDrawer, CartItemRow, TierProgressBar, CouponInput
│   │   ├── checkout/         # StepIndicator, AddressForm, ShippingPicker, PaymentGatewayMock
│   │   ├── trust/            # BatchVerificationModal, LabReportTable, CertificatesRibbon
│   │   └── ai/               # AiAdvisorWidget, ChatMessage, ProductRecommendationCard
│   ├── context/              # Stores / React contexts (CartStore, WishlistStore, UIStore)
│   ├── data/                 # CMS-ready product data (12 signature items, categories, articles)
│   ├── types/                # TypeScript models (Product, Variant, NutritionFact, Order, Review)
│   ├── styles/
│   │   ├── tokens.css        # Centralized CSS Custom Properties
│   │   └── globals.css       # Reset, base styles, typography utilities
│   └── lib/                  # Formatters, currency, local storage helpers, SEO schemas
├── tsconfig.json
├── next.config.mjs
└── package.json
```

---

## 4. Detailed Functional Specifications

### 4.1 Global Shell & Navigation
- **Announcement Bar:** Rotating promotional alerts (`⚡ FLAT 20% OFF FIRST ORDER`, `🔬 NABL LAB VERIFIED`, `🚚 FREE DELIVERY OVER ₹999`).
- **Navbar:** Sticky glassmorphism header with logo, category dropdown mega-menu, live autocomplete search, wishlist counter badge, and interactive cart drawer trigger.
- **Mobile Drawer:** Responsive slide-out navigation with category accordion and direct contact triggers.

### 4.2 Homepage Experience
- **Hero Slider:** Full-width cinematic banner slider with auto-advance, dot navigation, swipe support, and primary CTAs.
- **Shop By Goal Discovery:** 5 interactive goal cards (*Build Lean Muscle, Peak Strength & Power, Explosive Energy & Focus, Daily Nutrition & Health, Lean Definition*).
- **Interactive Stack Builder:** Dual cards (*Build Your Stack* + *Daily Nutrition Routine*) with live stack builder modal, 15% combo savings, free stainless shaker gift badge, and 1-click stack checkout.
- **Best Sellers Showcase:** 8 alternating layout rows with dynamic S-curve connectors, nutrition badges, macro highlights, flavor/size pickers, and dual action buttons:
  - `[ ADD TO CART 🛒 ]`
  - `[ ⚡ BUY NOW ]` (Athletic grey)
- **Learn Your Nutrition Hub:** Editorial cards with read times, categories, and full reading modal linked directly to recommended supplements.

### 4.3 Dedicated All Products Catalog (`/products`)
- Dynamic multi-filter engine:
  - Filter pills across 8 categories: *All, Protein, Creatine, Pre-Workout, Performance, Weight Management, Healthy Foods, Gym Accessories*.
  - Goal selector dropdown.
  - Sorting: *Price (Low-to-High), Price (High-to-Low), Customer Rating, Featured*.
  - Instant live keyword search.
- Product Cards: Display badges, MRP/selling prices, discounts, ratings, wishlist toggle, and dual actions (`ADD TO CART` + `⚡ BUY NOW`).

### 4.4 Product Detail Experience (`/products/[slug]`)
- **Visuals:** High-res product gallery with thumbnail switcher.
- **Buying Options:** Interactive flavor pills and size options with dynamic price updates.
- **Nutrition Accordions:**
  - Standardized FDA/FSSAI-style Nutrition Facts Table (Serving size, Servings per container, Protein, Carbs, Fat, Calories).
  - Clean Label Claims (e.g., *27g Protein, 0g Added Sugar, DigeZyme®*).
  - Ingredients & Allergen Advisory notice.
  - Usage and timing guidelines.
- **Dual CTAs:** Sticky bottom/panel `ADD TO CART` and `⚡ BUY NOW`.
- **Social Proof:** Verified customer reviews with breakdown and review submission modal.

### 4.5 Commerce & Cart Engine
- **Slide-out Cart Drawer:**
  - Real-time tier progress bar (*Add ₹X more for Free Delivery / Free Shaker*).
  - Line-item quantity steppers (`+` / `-`) and instant removals.
  - Coupon application engine (`PRO10`, `PRO25`, `PRE20`, `GYM15`) with live discount breakdown.
  - Subtotal, taxes, shipping fee calculation, and Net Payable.
- **Express Checkout Modal / Page:**
  - Step 1: Contact & Delivery Address
  - Step 2: Shipping Method (Standard vs. Express Air)
  - Step 3: Payment Method (UPI / QR Code, Cards, Net Banking, COD)
  - Step 4: Instant Confirmation & Generated Order ID (`PV-XXXXXX`)
- **Order Tracking:** Enter Order ID to inspect live shipment milestones (*Placed ➔ Confirmed ➔ Dispatched ➔ In Transit ➔ Delivered*).

### 4.6 Trust & Transparency (NABL Lab Verification)
- **Authenticity Verifier:** Enter batch number (e.g., `PV-B9402`, `PV-CREAT-1002`) to inspect certified third-party lab parameters:
  - Protein assay test results (label claim vs. actual test: 89.4%).
  - Heavy metals screening (<0.01 ppm lead, arsenic, cadmium).
  - Banned substance screen (100% WADA/NADA compliant).

### 4.7 AI Capabilities (2026 Ready)
- **AI Nutrition Advisor Widget:** Floating bottom-right widget grounded strictly in PROVANA catalog data.
- Quick query chips (*Lean Muscle, Creatine Timing, Under ₹3000 Stacks*).
- Inline product recommendation cards with 1-click cart addition.

---

## 5. Non-Functional Requirements & Production Readiness

1. **Performance:** Sub-1.5s Largest Contentful Paint (LCP), 0 Cumulative Layout Shift (CLS), target Lighthouse score > 90.
2. **SEO & Metadata:**
   - Dynamic OpenGraph & Twitter cards for every product page.
   - Structured JSON-LD schemas (`Product`, `BreadcrumbList`, `Organization`, `FAQPage`).
   - Clean canonical URLs and semantic HTML5 tags (`<main>`, `<article>`, `<header>`, `<nav>`).
3. **Security:**
   - Client-side validation with server-side price recalculation guards.
   - XSS sanitization for all rendered CMS and user-submitted review strings.
   - Secure storage handling (no sensitive payment credentials in local storage).
4. **Accessibility (WCAG 2.1 AA):**
   - High contrast ratios on dark charcoal surfaces.
   - Full keyboard navigation for modals and drawer traps.
   - Proper `aria-label`, `role`, and focus rings.

---

## 6. Phased Implementation Roadmap

```text
PHASE 1: Project Initialization, Tooling & Design System Setup
  ├── Create Next.js App (TypeScript, App Router, ESLint)
  ├── Configure Google Fonts (Bebas Neue, Manrope, Oswald)
  ├── Port Design Tokens into tokens.css & globals.css
  ├── Migrate Assets (hero images, product catalog PNGs, icons)
  └── Establish Root Layout (Header, Announcement Bar, Footer)

PHASE 2: Data Models, Types & Core State Stores
  ├── Define TypeScript interfaces (Product, Variant, Cart, Review, Order)
  ├── Port PROVANA_PRODUCTS catalog (12 complete products with nutrition facts)
  ├── Implement Zustand/Context CartStore & WishlistStore with persistence
  └── Implement Toast notification system & Modal controller

PHASE 3: Homepage Hero, Discovery & Showcase Sections
  ├── Hero Slider with autoplay and touch gestures
  ├── Shop By Goal cards
  ├── Build Your Stack & Daily Nutrition Routine components
  ├── Best Sellers alternating showcase with S-curve connectors
  └── Learn Your Nutrition hub & reader modal

PHASE 4: Dedicated All Products Screen & Filter Engine
  ├── /products catalog route with SSR/SSG
  ├── Multi-filter toolbar (category pills, goal dropdown, sort, search)
  ├── Reusable ProductCard with dual actions (Cart + Buy Now)
  └── Responsive catalog grid

PHASE 5: Product Details (PDP) & Trust Layer
  ├── /products/[slug] dynamic route
  ├── Nutrition Facts table component
  ├── Variant selector (Flavors, Sizes, Quantities)
  ├── NABL Lab Report batch verifier modal
  └── Review submission & rating accordion

PHASE 6: Cart Drawer & 4-Step Express Checkout
  ├── Slide-out Cart Drawer with tier progress bar
  ├── Coupon discount calculation engine
  ├── 1-Click "⚡ BUY NOW" direct checkout pipeline
  ├── 4-Step Checkout (Address, Shipping, Payment, Confirmation)
  └── Live Order Tracking modal & route

PHASE 7: AI Advisor, Final Polish & Production Build
  ├── Floating AI Nutrition Advisor widget
  ├── Pre-set query chips & direct recommendation cards
  ├── Responsive QA across mobile, tablet, and desktop
  └── Production bundle build validation (next build)
```
