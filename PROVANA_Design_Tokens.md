# PROVANA — Design Tokens

**Version:** 2.1 (Smoky Obsidian Crystal Baseline)  
**Status:** Approved & Implemented in Next.js Production Architecture  
**Brand:** PROVANA  
**Domain:** Nutrition · Fitness · Wellness · Healthy Foods · Gym Accessories  
**Design Theme:** **Dark Luxury Charcoal Athletic DTC with Smoky Obsidian Crystal Accents** (High-Performance Ergonomic)

---

## 1. Design Philosophy & Aesthetic Vision

PROVANA represents the pinnacle of modern sports nutrition. The visual language blends raw athletic power with pharmaceutical laboratory rigor:

```text
Deep Matte Charcoal Canvas (#0B0C0E)
              +
Precision Gunmetal Card Surfaces (#141720 / #191E28)
              +
Smoky Obsidian Crystal Accents (#94A3B8 / #CBD5E1)
              +
Athletic Titanium Grey Secondary Actions (#374151 / #4B5563)
              +
Crisp High-Contrast Primary Cart Actions (#E2E8F0 / #FFFFFF)
              +
3-Tier Performance Editorial Typography (Bebas Neue + Manrope + Oswald)
```

### Visual Rule of Hierarchy
```text
High-Resolution Product Silhouette
              ↓
Condensed High-Impact Headline (Bebas Neue)
              ↓
Engineered Macro Highlights & Badges (Oswald)
              ↓
Dual Action Triggers (ADD TO CART 🛒 + ⚡ BUY NOW)
              ↓
Evidence-Based Transparency (NABL Lab Verification & ISO Certification)
```

---

## 2. Color Tokens

### 2.1 Canvas & Surfaces

| Token | CSS Variable | Hex / Value | Semantic Intent |
|---|---|---|---|
| `color.canvas.base` | `--color-bg` | `#0B0C0E` | Main matte charcoal page canvas |
| `color.canvas.surface` | `--color-surface` | `#141720` | Base card and container surface |
| `color.canvas.surface-hover` | `--color-surface-hover` | `#191E28` | Hover state for interactive cards |
| `color.canvas.elevated` | `--color-surface-elevated` | `#1B202B` | Modals, drawers, and popovers |
| `color.canvas.subtle` | `--color-surface-subtle` | `#101319` | Alternating section backgrounds |

### 2.2 Borders & Dividers

| Token | CSS Variable | Hex / Value | Semantic Intent |
|---|---|---|---|
| `color.border.base` | `--color-border` | `#262B35` | Standard structural borders |
| `color.border.grey` | `--color-border-grey` | `#3E4756` | High-precision gunmetal border |
| `color.border.subtle` | `--color-border-subtle` | `rgba(255, 255, 255, 0.08)` | Divider lines and separators |
| `color.border.focus` | `--color-border-focus` | `#94A3B8` | Focus rings & active selection states |
| `color.border.hover` | `--color-border-hover` | `rgba(148, 163, 184, 0.5)` | Card hover glow border |

### 2.3 Brand Accents & Actions

| Token | CSS Variable | Hex / Value | Semantic Intent |
|---|---|---|---|
| `color.brand.accent` | `--color-accent` | `#94A3B8` | Smoky obsidian crystal highlights, active pills, badges |
| `color.brand.accent-hover` | `--color-accent-hover` | `#CBD5E1` | Hover state for accent buttons & active tabs |
| `color.brand.accent-dim` | `--color-accent-dim` | `rgba(148, 163, 184, 0.15)` | Badge backgrounds and subtle callouts |
| `color.action.cart-bg` | `--color-btn-cart-bg` | `#E2E8F0` | High-contrast light button for ADD TO CART |
| `color.action.cart-text` | `--color-btn-cart-text` | `#0B0C0E` | Deep charcoal text for cart button |
| `color.action.buy-bg` | `--color-btn-buy-bg` | `#374151` | Sleek athletic titanium grey for ⚡ BUY NOW |
| `color.action.buy-border`| `--color-btn-buy-border`| `#4B5563` | Contrast border for Buy Now |
| `color.action.buy-hover` | `--color-btn-buy-hover` | `#4B5563` | Hover state for Buy Now button |
| `color.action.buy-text`  | `--color-btn-buy-text`  | `#FFFFFF` | Crisp white typography for Buy Now |

### 2.4 Typography Color Contrast

| Token | CSS Variable | Hex / Value | Semantic Intent |
|---|---|---|---|
| `color.text.primary` | `--color-text-main` | `#FFFFFF` | Headlines, product titles, bold metrics |
| `color.text.secondary` | `--color-text-sub` | `#CBD5E1` | Body paragraphs, claims, specifications |
| `color.text.muted` | `--color-text-muted` | `#94A3B8` | Subtitles, metadata, reviews counts |
| `color.text.dim` | `--color-text-dim` | `#64748B` | Footnotes, legal disclaimers |
| `color.text.accent` | `--color-text-accent` | `#94A3B8` | Dynamic highlights, active states |

### 2.5 Semantic Feedback Colors

| Token | CSS Variable | Hex / Value | Usage |
|---|---|---|---|
| `color.semantic.success` | `--color-success` | `#10B981` | Free shipping unlocked, in stock, NABL passed |
| `color.semantic.warning` | `--color-warning` | `#F59E0B` | Low stock alert, 5-star rating fill |
| `color.semantic.danger` | `--color-danger` | `#EF4444` | Wishlist active heart, out of stock, errors |
| `color.semantic.info` | `--color-info` | `#3B82F6` | Info tooltips, order tracking transit |

---

## 3. Typography System

PROVANA utilizes an engineered 3-font hierarchy configured via `next/font/google`:

```text
HEADINGS & DISPLAY:      Bebas Neue (Condensed, impactful, athletic headline powerhouse)
BODY, UI & COMMERCE:     Manrope (Geometric elegance, maximum readability, clean DTC)
BADGES & NUTRITION STATS: Oswald (Technical tabular precision, laboratory assay metrics)
```

### 3.1 Font Family Tokens
- `--font-display`: `'Bebas Neue', Impact, 'Arial Narrow', sans-serif`
- `--font-body`: `'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- `--font-stats`: `'Oswald', 'Arial Narrow', sans-serif`

### 3.2 Scale & Hierarchy

| Component | Font Token | Size (Desktop) | Size (Mobile) | Weight | Transform |
|---|---|---:|---:|---:|---|
| **Hero Display** | `--font-display` | `74–96px` | `44–52px` | 400 | UPPERCASE |
| **Section Headings** | `--font-display` | `44–52px` | `32–36px` | 400 | UPPERCASE |
| **Product Titles (PDP)** | `--font-display` | `38–44px` | `28–32px` | 400 | UPPERCASE |
| **Card Product Titles** | `--font-body` | `16–18px` | `14–16px` | 800 | Title Case |
| **Price (Current)** | `--font-body` | `22–32px` | `18–24px` | 800 | Normal |
| **Price (MRP / Strike)** | `--font-body` | `14–18px` | `13–15px` | 500 | Normal |
| **Buttons & CTAs** | `--font-body` | `12–14px` | `12px` | 800 | UPPERCASE |
| **Badges & Highlights** | `--font-stats` | `11–13px` | `10.5px` | 700 | UPPERCASE |
| **Body Paragraphs** | `--font-body` | `14–16px` | `13.5px` | 400 / 500 | Normal |

---

## 4. Spacing System (8px Grid)

| Token | CSS Variable | Value | Usage |
|---|---|---:|---|
| `space.1` | `--space-1` | `4px` | Micro-spacing, pill padding |
| `space.2` | `--space-2` | `8px` | Gap between icons and text, pill margins |
| `space.3` | `--space-3` | `12px` | Card internal element margins |
| `space.4` | `--space-4` | `16px` | Standard padding, button margins |
| `space.5` | `--space-5` | `20px` | Card padding, toolbar margins |
| `space.6` | `--space-6` | `24px` | Container horizontal padding |
| `space.8` | `--space-8` | `32px` | Showcase row vertical gap |
| `space.10` | `--space-10` | `40px` | Section sub-block margins |
| `space.12` | `--space-12` | `48px` | Desktop grid gaps |
| `space.16` | `--space-16` | `64px` | Section padding (mobile) |
| `space.20` | `--space-20` | `80px` | Major section padding (desktop) |

---

## 5. Radii & Elevation Shadows

### 5.1 Border Radii
- `--radius-xs`: `4px` (Tags, micro-pills, badges)
- `--radius-sm`: `6px` (Buttons, inputs, selector pills)
- `--radius-btn`: `6px` (Standard action buttons)
- `--radius-card`: `12px` (Product cards, discovery cards)
- `--radius-modal`: `16px` (Express checkout modal, lab report modal)
- `--radius-pill`: `9999px` (Filter pills, search bar, badges, floating AI button)

### 5.2 Shadows (Dark Charcoal Tuned)
- `--shadow-sm`: `0 2px 8px rgba(0, 0, 0, 0.35)`
- `--shadow-md`: `0 6px 20px rgba(0, 0, 0, 0.45)`
- `--shadow-lg`: `0 16px 40px rgba(0, 0, 0, 0.65)`
- `--shadow-accent`: `0 8px 24px rgba(148, 163, 184, 0.25)` (Smoky obsidian crystal glow for active CTAs)

---

## 6. Motion & Animation Tokens

- `--motion-instant`: `100ms ease`
- `--motion-fast`: `150ms cubic-bezier(0.22, 1, 0.36, 1)` (Button hovers, wishlist toggle)
- `--motion-normal`: `250ms cubic-bezier(0.22, 1, 0.36, 1)` (Card elevation, accordion slide)
- `--motion-slow`: `400ms cubic-bezier(0.22, 1, 0.36, 1)` (Hero slider crossfade, cart drawer)
- `--motion-curve`: `600ms cubic-bezier(0.22, 1, 0.36, 1)` (Showcase S-curve SVG animation)

---

## 7. Component-Specific Tokens

### 7.1 Best Sellers Bracket Frames
- Border: `1.5px solid var(--color-border)`
- Active state border: `1.5px solid var(--color-accent)`
- Background: `var(--color-surface)`
- Image box gradient: `radial-gradient(circle at center, #1C2331 0%, #0F131A 100%)`

### 7.2 AI Nutrition Advisor Widget
- Position: Fixed bottom right (`right: 24px, bottom: 24px`)
- Button surface: `#141720` with amber border and green pulsing status dot
- Chat window: `width: 380px, height: 520px`, glassmorphism backdrop blur `16px`

### 7.3 NABL Batch Verifier Table
- Container background: `#0D1016`
- Border: `1px solid rgba(16, 185, 129, 0.3)`
- Passed badge: `#10B981` with background `rgba(16, 185, 129, 0.15)`
