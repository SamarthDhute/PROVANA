import { Product } from "@/types";

export const PROVANA_PRODUCTS: Product[] = [
  {
    id: "pv-whey-isolate",
    slug: "provana-100-pure-whey-isolate",
    name: "Provana 100% Pure Whey Isolate",
    category: "Protein",
    goal: "Build Lean Muscle",
    badge: "HIGH PROTEIN",
    highlight: "27g protein / scoop • 0g added sugar • DigeZyme®",
    price: 2999,
    mrp: 3499,
    discount: "14% OFF",
    rating: 4.8,
    reviewCount: 1291,
    img: "/assets/product-catalog/whey_isolated.png",
    minimalDesc: "Ultra-pure cross-flow microfiltered whey isolate for lean muscle synthesis and fast digestive absorption.",
    flavors: ["Belgian Chocolate", "French Vanilla", "Strawberry Swirl"],
    sizes: ["1 kg", "2 kg", "4 kg"],
    nutritionFacts: {
      servingSize: "32g (1 Scoop)",
      servingsPerContainer: 31,
      calories: 120,
      protein: "27g",
      carbs: "1.2g",
      fat: "0.5g"
    },
    claims: [
      "27g Protein per scoop",
      "6.2g BCAAs",
      "12.8g EAAs",
      "Zero Added Sugar",
      "DigeZyme® Multi-Enzyme"
    ],
    nutrition: [
      { metric: "Protein per scoop", value: "27 g" },
      { metric: "BCAA", value: "6.2 g" },
      { metric: "EAA", value: "12.8 g" },
      { metric: "Added Sugar", value: "0 g" },
      { metric: "Digestive Enzymes", value: "DigeZyme® 50mg" }
    ],
    ingredients: "Cross-Flow Microfiltered Whey Protein Isolate, Cocoa Powder, Nature-Identical Flavours, DigeZyme Multi-Enzyme Complex, Sucralose.",
    allergens: "Contains Milk. Manufactured in a facility that also processes soy and tree nuts.",
    howToUse: "Add 1 level scoop (32g) to 200-250ml of cold water or skimmed milk. Shake vigorously in a shaker for 20 seconds. Best consumed post-workout or first thing in the morning."
  },
  {
    id: "pv-creatine-mono",
    slug: "provana-micronized-creatine-monohydrate",
    name: "Provana Creatine Monohydrate",
    category: "Creatine",
    goal: "Boost Performance",
    badge: "MUSCLE SUPPORT",
    highlight: "3g pure micronized creatine / serving • 200 mesh",
    price: 1499,
    mrp: 1899,
    discount: "21% OFF",
    rating: 4.9,
    reviewCount: 983,
    img: "/assets/product-catalog/creatine_monohydrate.png",
    minimalDesc: "Micro-pulverized 99.99% pure creatine for peak ATP energy recycling, endurance and explosive strength.",
    flavors: ["Unflavoured", "Fruit Punch"],
    sizes: ["100 g", "250 g", "500 g"],
    nutritionFacts: {
      servingSize: "3g (1 Scoop)",
      servingsPerContainer: 83,
      calories: 0,
      protein: "0g",
      carbs: "0g",
      fat: "0g"
    },
    claims: [
      "100% Pure Creapure®",
      "200 Mesh Micronized",
      "Zero Fillers",
      "Zero Added Calories"
    ],
    nutrition: [
      { metric: "Creatine Monohydrate", value: "3.0 g per serving" },
      { metric: "Mesh Size", value: "200 Mesh Ultra Micronized" },
      { metric: "Creapure® Purity", value: "99.99%" },
      { metric: "Calories", value: "0 kcal" }
    ],
    ingredients: "100% Pure Micronized Creatine Monohydrate. Zero fillers, zero artificial additives.",
    allergens: "Free from common allergens. Gluten-Free and Vegan.",
    howToUse: "Mix 1 scoop (3g) with 200ml of water or your favorite protein shake or carbohydrate beverage daily."
  },
  {
    id: "pv-pre-workout",
    slug: "provana-extreme-preworkout-matrix",
    name: "Provana Pre-Workout Matrix",
    category: "Pre-Workout",
    goal: "Boost Performance",
    badge: "PERFORMANCE",
    highlight: "⚡ 300mg clean caffeine • 6g L-citrulline / serving",
    price: 1599,
    mrp: 1999,
    discount: "20% OFF",
    rating: 4.7,
    reviewCount: 742,
    img: "/assets/product-catalog/preworkout.png",
    minimalDesc: "Explosive clean energy, laser focus, and skin-splitting vascular pumps without the crash.",
    flavors: ["Blue Raspberry", "Watermelon Rush", "Green Apple"],
    sizes: ["300 g", "600 g"],
    nutritionFacts: {
      servingSize: "12g (1 Scoop)",
      servingsPerContainer: 25,
      calories: 15,
      protein: "0g",
      carbs: "3g",
      fat: "0g"
    },
    claims: [
      "300mg Caffeine Anhydrous",
      "6000mg L-Citrulline Malate",
      "3200mg Beta-Alanine",
      "1000mg L-Tyrosine"
    ],
    nutrition: [
      { metric: "Caffeine Anhydrous", value: "300 mg" },
      { metric: "L-Citrulline Malate", value: "6,000 mg" },
      { metric: "Beta-Alanine", value: "3,200 mg" },
      { metric: "L-Tyrosine", value: "1,000 mg" }
    ],
    ingredients: "L-Citrulline Malate, Beta-Alanine, Taurine, Caffeine Anhydrous, Alpha-GPC, Natural Flavors, Malic Acid, Stevia.",
    allergens: "Manufactured in a facility handling milk, soy, and wheat.",
    howToUse: "Mix 1 scoop with 250-300ml of cold water and consume 20-30 minutes before training. Avoid taking within 4 hours of bedtime."
  },
  {
    id: "pv-mass-gainer",
    slug: "provana-high-calorie-anabolic-mass-gainer",
    name: "High Calorie Anabolic Mass Gainer",
    category: "Weight Management",
    goal: "Build Lean Muscle",
    badge: "ANABOLIC GAINS",
    highlight: "⚡ 1,250 clean calories • 54g protein • 250g complex carbs",
    price: 2799,
    mrp: 3299,
    discount: "15% OFF",
    rating: 4.9,
    reviewCount: 812,
    img: "/assets/product-catalog/massgainer.png",
    minimalDesc: "Engineered high-calorie nutrient matrix for rapid muscle mass, size expansion, and glycogen reload.",
    flavors: ["Rich Chocolate Cream", "Vanilla Milkshake"],
    sizes: ["1 kg", "3 kg", "5 kg"],
    nutritionFacts: {
      servingSize: "150g (3 Scoops)",
      servingsPerContainer: 20,
      calories: 1250,
      protein: "54g",
      carbs: "250g",
      fat: "4.5g"
    },
    claims: [
      "1,250 Clean Energy Calories",
      "54g Premium Multi-Stage Protein",
      "Enriched with 3g Creatine Monohydrate",
      "MCT Oils for Clean Fat Fuel"
    ],
    nutrition: [
      { metric: "Calories per 3 scoops", value: "1,250 kcal" },
      { metric: "Complex Carbs", value: "250 g" },
      { metric: "Multi-Stage Protein", value: "54 g" },
      { metric: "Creatine per serving", value: "3 g" }
    ],
    ingredients: "Maltodextrin, Whey Protein Concentrate, Micellar Casein, Cocoa Powder, MCT Oil Powder, Creatine Monohydrate, Vitamin & Mineral Premix, Sucralose.",
    allergens: "Contains Milk and Soy.",
    howToUse: "Blend 3 scoops with 500-600ml of whole milk or water once or twice daily between meals or post-workout."
  },
  {
    id: "pv-bcaa-recovery",
    slug: "provana-ultra-bcaa-recovery-complex",
    name: "Ultra BCAA 2:1:1 Recovery Complex",
    category: "Performance",
    goal: "Boost Performance",
    badge: "INTRA-WORKOUT",
    highlight: "⚡ 7g instantized BCAAs • Coconut water electrolytes",
    price: 1499,
    mrp: 1899,
    discount: "21% OFF",
    rating: 4.8,
    reviewCount: 615,
    img: "/assets/product-catalog/bcaa.png",
    minimalDesc: "Instant intra-workout muscle repair complex to prevent catabolism and replenish cellular hydration.",
    flavors: ["Lemon Lime Surge", "Wild Berry Blast", "Mango Madness"],
    sizes: ["250 g", "400 g"],
    nutritionFacts: {
      servingSize: "10g (1 Scoop)",
      servingsPerContainer: 25,
      calories: 10,
      protein: "7g",
      carbs: "1g",
      fat: "0g"
    },
    claims: [
      "7g Plant-Fermented BCAAs",
      "Clinically Proven 2:1:1 Ratio",
      "Raw Coconut Water Powder",
      "Zero Sugar & Zero Dyes"
    ],
    nutrition: [
      { metric: "L-Leucine", value: "3,500 mg" },
      { metric: "L-Isoleucine", value: "1,750 mg" },
      { metric: "L-Valine", value: "1,750 mg" },
      { metric: "Coconut Water Powder", value: "500 mg" }
    ],
    ingredients: "Instantized BCAA 2:1:1 (L-Leucine, L-Isoleucine, L-Valine), Raw Coconut Water Powder, Electrolyte Blend, Citric Acid, Natural Flavours, Stevia Extract.",
    allergens: "Vegan. Gluten-Free.",
    howToUse: "Sip 1 scoop mixed in 500ml ice-cold water throughout your intense training session."
  },
  {
    id: "pv-plant-protein",
    slug: "provana-organic-superfood-plant-protein",
    name: "Organic Superfood Plant Protein",
    category: "Protein",
    goal: "Daily Nutrition",
    badge: "100% VEGAN",
    highlight: "⚡ 25g organic pea & brown rice protein • Supergreens",
    price: 2199,
    mrp: 2699,
    discount: "18% OFF",
    rating: 4.7,
    reviewCount: 430,
    img: "/assets/product-catalog/whey_plant_protien.png",
    minimalDesc: "Naturally sweetened organic plant protein blend infused with supergreens, antioxidant berries, and digestive probiotics.",
    flavors: ["Café Mocha", "Smooth Chocolate", "Vanilla Bean"],
    sizes: ["1 kg", "2 kg"],
    nutritionFacts: {
      servingSize: "35g (1 Scoop)",
      servingsPerContainer: 28,
      calories: 130,
      protein: "25g",
      carbs: "3g",
      fat: "1.5g"
    },
    claims: [
      "25g Complete Plant Protein",
      "Hypoallergenic & Dairy-Free",
      "5g BCAA naturally occurring",
      "Added DigeZyme® & Probiotics"
    ],
    nutrition: [
      { metric: "Protein per serving", value: "25 g" },
      { metric: "Supergreens blend", value: "1,000 mg" },
      { metric: "Dietary Fibre", value: "4 g" },
      { metric: "Sugar", value: "0 g" }
    ],
    ingredients: "Organic Yellow Pea Protein Isolate, Organic Sprouted Brown Rice Protein, Spirulina, Chlorella, Cocoa, Natural Flavors, Stevia.",
    allergens: "100% Dairy-Free, Soy-Free, Gluten-Free.",
    howToUse: "Mix 1 scoop with 300ml cold water, almond milk, or blend into your morning superfood smoothie."
  },
  {
    id: "pv-whey-belgian-chocolate",
    slug: "provana-100-whey-protein-belgian-chocolate",
    name: "100% Whey Protein Belgian Chocolate",
    category: "Protein",
    goal: "Build Lean Muscle",
    badge: "SIGNATURE FLAVOR",
    highlight: "⚡ 24g whey blend • Rich imported Belgian cocoa",
    price: 2899,
    mrp: 3399,
    discount: "15% OFF",
    rating: 4.9,
    reviewCount: 1450,
    img: "/assets/product-catalog/whey_protien_belgium_chocolate.png",
    minimalDesc: "Our award-winning signature whey blend featuring real Belgian cocoa for gourmet indulgence with zero compromises.",
    flavors: ["Belgian Chocolate Gourmet"],
    sizes: ["1 kg", "2 kg"],
    nutritionFacts: {
      servingSize: "33g (1 Scoop)",
      servingsPerContainer: 30,
      calories: 130,
      protein: "24g",
      carbs: "2.5g",
      fat: "1.8g"
    },
    claims: [
      "24g Protein per serving",
      "Real Imported Belgian Cocoa",
      "5.5g Natural BCAAs",
      "Ultra-Smooth Instantized Mixing"
    ],
    nutrition: [
      { metric: "Protein per scoop", value: "24 g" },
      { metric: "BCAA", value: "5.5 g" },
      { metric: "Glutamine", value: "4.2 g" },
      { metric: "Trans Fat", value: "0 g" }
    ],
    ingredients: "Whey Protein Isolate, Whey Protein Concentrate, Authentic Belgian Cocoa Powder, Natural Identical Flavour, Sunflower Lecithin, Sucralose.",
    allergens: "Contains Milk and Soy.",
    howToUse: "Add 1 scoop to 200ml cold water or milk. Shake for 15-20 seconds and enjoy creamy chocolate goodness."
  },
  {
    id: "pv-protein-oats",
    slug: "provana-high-protein-rolled-oats",
    name: "Provana High Protein Oats",
    category: "Healthy Foods",
    goal: "Daily Nutrition",
    badge: "DAILY NUTRITION",
    highlight: "22g protein / 100g • Beta-glucan & superseeds",
    price: 599,
    mrp: 799,
    discount: "25% OFF",
    rating: 4.8,
    reviewCount: 560,
    img: "/assets/images/hd_showcase_4.png",
    minimalDesc: "Rolled oats infused with whey isolate, roasted almonds, cranberries, and chia superseeds.",
    flavors: ["Dark Chocolate", "Original", "Strawberry Berry"],
    sizes: ["1 kg", "2 kg"],
    nutritionFacts: {
      servingSize: "50g",
      servingsPerContainer: 20,
      calories: 195,
      protein: "11g",
      carbs: "28g",
      fat: "4g"
    },
    claims: [
      "22g Protein per 100g",
      "11g Dietary Fibre",
      "Rich in Beta-Glucan",
      "No Added Refined Sugar"
    ],
    nutrition: [
      { metric: "Protein per 100g", value: "22 g" },
      { metric: "Dietary Fibre", value: "11 g" },
      { metric: "Beta-Glucan", value: "3.5 g" },
      { metric: "Omega-3", value: "750 mg" }
    ],
    ingredients: "Rolled Oats (75%), Whey Protein Isolate (15%), Chia Seeds, Pumpkin Seeds, Almonds, Freeze-Dried Cranberries, Natural Dark Cocoa.",
    allergens: "Contains Oats, Milk, and Tree Nuts.",
    howToUse: "Cook 50g in 200ml hot water or milk for 3 minutes, or soak overnight in the refrigerator for delicious overnight oats."
  },
  {
    id: "pv-gym-gear",
    slug: "provana-stainless-steel-pro-shaker",
    name: "Provana Stainless Steel Shaker",
    category: "Gym Accessories",
    goal: "Accessories",
    badge: "PREMIUM GEAR",
    highlight: "750ml double-wall insulated • Leak-proof lid",
    price: 799,
    mrp: 1199,
    discount: "33% OFF",
    rating: 4.9,
    reviewCount: 388,
    img: "/assets/images/hd_showcase_5.png",
    minimalDesc: "Food-grade 304 stainless steel shaker bottle with surgical silent mixing mesh and silicone seal.",
    flavors: ["Matte Charcoal Black", "Brushed Silver"],
    sizes: ["750 ml"],
    nutritionFacts: {
      servingSize: "1 Shaker (750ml)",
      servingsPerContainer: 1,
      calories: 0,
      protein: "0g",
      carbs: "0g",
      fat: "0g"
    },
    claims: [
      "304 Surgical Grade Stainless Steel",
      "Double-Wall Thermal Insulation",
      "100% Leak-Proof Guarantee",
      "Zero Odor Retention"
    ],
    nutrition: [
      { metric: "Capacity", value: "750 ml" },
      { metric: "Material", value: "Food-Grade 304 Steel" },
      { metric: "Thermal Retention", value: "Cold for 12 Hours" },
      { metric: "BPA Free", value: "100%" }
    ],
    ingredients: "High-grade 304 stainless steel body, BPA-free polypropylene lid with medical silicone seal.",
    allergens: "Non-toxic, BPA-Free, phthalate-free.",
    howToUse: "Wash thoroughly with warm soapy water before initial use. Hand washing recommended to preserve thermal coating."
  },
  {
    id: "pv-protein-bars",
    slug: "provana-gourmet-high-protein-bars",
    name: "Provana Gourmet Protein Bar",
    category: "Healthy Foods",
    goal: "Healthy Snacking",
    badge: "HEALTHY SNACK",
    highlight: "20g protein / bar • 7g prebiotic fiber • 0g trans fat",
    price: 699,
    mrp: 899,
    discount: "22% OFF",
    rating: 4.8,
    reviewCount: 640,
    img: "/assets/images/hd_showcase_6.png",
    minimalDesc: "Multi-layered nougat protein bar enrobed in sugar-free dark chocolate for guilt-free on-the-go fueling.",
    flavors: ["Chocolate Brownie", "Peanut Butter Crunch", "Cookies & Cream"],
    sizes: ["Pack of 6", "Pack of 12"],
    nutritionFacts: {
      servingSize: "60g (1 Bar)",
      servingsPerContainer: 6,
      calories: 210,
      protein: "20g",
      carbs: "14g",
      fat: "6g"
    },
    claims: [
      "20g Premium Protein per bar",
      "7g Prebiotic FOS Fiber",
      "Zero Added Refined Sugar",
      "Zero Hydrogenated Oils"
    ],
    nutrition: [
      { metric: "Protein per bar", value: "20 g" },
      { metric: "Prebiotic Fiber", value: "7 g" },
      { metric: "Net Carbs", value: "7 g" },
      { metric: "Trans Fat", value: "0 g" }
    ],
    ingredients: "Protein Blend (Whey Protein Isolate, Milk Protein Isolate), Prebiotic Soluble Fiber, Almond Butter, Dark Chocolate Coating (Maltitol, Cocoa Butter), Cocoa Nibs.",
    allergens: "Contains Milk, Almonds, and Soy.",
    howToUse: "Consume 1 bar whenever you need clean portable protein — between meals, at work, or pre/post-workout."
  },
  {
    id: "pv-protein-chips",
    slug: "provana-popped-crispy-protein-chips",
    name: "Provana Popped Protein Chips",
    category: "Healthy Foods",
    goal: "Healthy Snacking",
    badge: "HEALTHY SNACK",
    highlight: "15g protein / bag • 60% less fat than fried chips",
    price: 499,
    mrp: 649,
    discount: "23% OFF",
    rating: 4.6,
    reviewCount: 310,
    img: "/assets/images/hd_showcase_7.png",
    minimalDesc: "Never-fried air-popped protein chips seasoned with zesty herbs and Himalayan pink salt.",
    flavors: ["Tangy Masala", "Peri Peri Fire", "Sour Cream & Onion"],
    sizes: ["Pack of 6", "Pack of 12"],
    nutritionFacts: {
      servingSize: "40g (1 Bag)",
      servingsPerContainer: 6,
      calories: 140,
      protein: "15g",
      carbs: "12g",
      fat: "2.5g"
    },
    claims: [
      "15g Plant & Whey Protein",
      "Air-Popped Never Fried",
      "60% Less Fat than Potato Chips",
      "Made with Himalayan Pink Salt"
    ],
    nutrition: [
      { metric: "Protein per bag", value: "15 g" },
      { metric: "Fat", value: "2.5 g" },
      { metric: "Total Carbs", value: "12 g" },
      { metric: "Sodium", value: "180 mg" }
    ],
    ingredients: "Protein Blend (Soy Protein Isolate, Whey Protein Isolate, Rice Flour), High-Oleic Sunflower Oil, Natural Spices, Himalayan Pink Salt.",
    allergens: "Contains Soy and Milk.",
    howToUse: "Enjoy straight from the bag as a crunchy high-protein afternoon snack or pairing with healthy dips."
  },
  {
    id: "pv-protein-drinks",
    slug: "provana-ready-to-drink-cold-protein-shake",
    name: "Provana Ready-to-Drink Shake",
    category: "Healthy Foods",
    goal: "Daily Nutrition",
    badge: "DAILY NUTRITION",
    highlight: "20g pure whey / bottle • Lactose-free & zero sugar",
    price: 899,
    mrp: 1199,
    discount: "25% OFF",
    rating: 4.8,
    reviewCount: 430,
    img: "/assets/images/hd_showcase_8.png",
    minimalDesc: "Smooth, lactose-free ready-to-drink protein shake chilled for effortless grab-and-go nutrition.",
    flavors: ["Cold Coffee Rush", "Swiss Chocolate", "Vanilla Silk"],
    sizes: ["Pack of 6", "Pack of 12"],
    nutritionFacts: {
      servingSize: "250ml (1 Bottle)",
      servingsPerContainer: 6,
      calories: 110,
      protein: "20g",
      carbs: "2g",
      fat: "1g"
    },
    claims: [
      "20g Pure Filtered Whey Protein",
      "100% Lactose-Free Formulation",
      "Zero Added Sugar",
      "Enriched with 12 Essential Vitamins"
    ],
    nutrition: [
      { metric: "Protein per bottle", value: "20 g" },
      { metric: "Lactose", value: "0 g" },
      { metric: "Sugar", value: "0 g" },
      { metric: "Calcium", value: "450 mg" }
    ],
    ingredients: "Filtered Skimmed Milk, Whey Protein Concentrate, Lactase Enzyme, Natural Cocoa/Coffee Extract, Vitamin & Mineral Blend, Stevia.",
    allergens: "Contains Milk (Lactose-Free treated).",
    howToUse: "Shake well and drink cold. Perfect immediate recovery after sports or on morning commutes."
  }
];
