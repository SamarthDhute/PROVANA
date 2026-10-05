-- ========================================================
-- PROVANA V3__seed_catalogue_data.sql
-- Seed Official Categories, Subcategories, Brand & Products
-- ========================================================

-- 1. SEED BRAND
INSERT INTO brands (id, name, slug, description, active)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'PROVANA', 'provana', 'Premium Sports Nutrition & Athletic Performance', true)
ON CONFLICT (slug) DO NOTHING;

-- 2. SEED OFFICIAL SRS CATEGORIES
INSERT INTO categories (id, name, slug, description, sort_order, active)
VALUES 
    ('22222222-2222-2222-2222-222222222001', 'Protein', 'protein', 'Cold-filtered CFM whey isolates, whey blends, and plant proteins.', 1, true),
    ('22222222-2222-2222-2222-222222222002', 'Performance', 'performance', 'Creapure® creatine, clean-energy pre-workouts, and intra-workout amino matrices.', 2, true),
    ('22222222-2222-2222-2222-222222222003', 'Weight Management', 'weight-management', 'Anabolic mass gainers and nutrient-dense meal replacements.', 3, true),
    ('22222222-2222-2222-2222-222222222004', 'Vitamins & Wellness', 'vitamins-wellness', 'Essential multivitamins, triple-strength omega-3, and trace mineral complexes.', 4, true),
    ('22222222-2222-2222-2222-222222222005', 'Ayurveda & Herbal', 'ayurveda-herbal', 'Standardized Himalayan shilajit, KSM-66 ashwagandha, and potent herbal adaptogens.', 5, true),
    ('22222222-2222-2222-2222-222222222006', 'Healthy Foods', 'healthy-foods', 'Gourmet rolled oats, high-protein popped chips, and zero-sugar protein bars.', 6, true),
    ('22222222-2222-2222-2222-222222222007', 'Gym Accessories', 'gym-accessories', 'Stainless steel shakers, heavy-duty lifting straps, wrist wraps, and gym gear.', 7, true)
ON CONFLICT (slug) DO NOTHING;

-- 3. SEED SUBCATEGORIES
INSERT INTO subcategories (id, category_id, name, slug, sort_order, active)
VALUES
    -- Protein
    ('33333333-3333-3333-3333-333333333001', '22222222-2222-2222-2222-222222222001', 'Whey Isolate', 'whey-isolate', 1, true),
    ('33333333-3333-3333-3333-333333333002', '22222222-2222-2222-2222-222222222001', 'Whey Protein', 'whey-protein', 2, true),
    ('33333333-3333-3333-3333-333333333003', '22222222-2222-2222-2222-222222222001', 'Plant Protein', 'plant-protein', 3, true),
    -- Performance
    ('33333333-3333-3333-3333-333333333004', '22222222-2222-2222-2222-222222222002', 'Creatine', 'creatine', 1, true),
    ('33333333-3333-3333-3333-333333333005', '22222222-2222-2222-2222-222222222002', 'Pre-Workout', 'pre-workout', 2, true),
    ('33333333-3333-3333-3333-333333333006', '22222222-2222-2222-2222-222222222002', 'BCAA & EAA', 'bcaa-eaa', 3, true),
    -- Weight Management
    ('33333333-3333-3333-3333-333333333007', '22222222-2222-2222-2222-222222222003', 'Mass Gainer', 'mass-gainer', 1, true),
    -- Healthy Foods
    ('33333333-3333-3333-3333-333333333008', '22222222-2222-2222-2222-222222222006', 'Protein Oats', 'protein-oats', 1, true),
    ('33333333-3333-3333-3333-333333333009', '22222222-2222-2222-2222-222222222006', 'Protein Bars', 'protein-bars', 2, true),
    ('33333333-3333-3333-3333-333333333010', '22222222-2222-2222-2222-222222222006', 'Protein Chips', 'protein-chips', 3, true),
    -- Gym Accessories
    ('33333333-3333-3333-3333-333333333011', '22222222-2222-2222-2222-222222222007', 'Shakers', 'shakers', 1, true)
ON CONFLICT (slug) DO NOTHING;

-- 4. SEED SIGNATURE PRODUCTS (Published)

-- PRODUCT 1: Provana 100% Pure Whey Isolate
INSERT INTO products (id, name, slug, brand_id, category_id, subcategory_id, goal_tag, badge, highlight, description, minimal_desc, benefits, usage_instructions, ingredients, allergens, status, published_at)
VALUES (
    '44444444-4444-4444-4444-444444444001',
    'Provana 100% Pure Whey Isolate',
    'provana-100-pure-whey-isolate',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222001',
    '33333333-3333-3333-3333-333333333001',
    'Build Lean Muscle',
    'HIGH PROTEIN',
    '27g protein / scoop • 0g added sugar • DigeZyme®',
    'Ultra-pure cross-flow microfiltered whey isolate designed for elite athletes demanding rapid muscle protein synthesis without bloating or excess carbohydrates.',
    'Ultra-pure cross-flow microfiltered whey isolate for lean muscle synthesis and fast digestive absorption.',
    'Accelerates post-workout muscle repair; Promotes lean tissue hypertrophy; Enhanced with DigeZyme for ultra-fast digestion.',
    'Add 1 level scoop (32g) to 200-250ml of cold water or skimmed milk. Shake vigorously in a shaker for 20 seconds. Best consumed post-workout or first thing in the morning.',
    'Cross-Flow Microfiltered Whey Protein Isolate, Cocoa Powder, Nature-Identical Flavours, DigeZyme Multi-Enzyme Complex, Sucralose.',
    'Contains Milk. Manufactured in a facility that also processes soy and tree nuts.',
    'PUBLISHED',
    CURRENT_TIMESTAMP
) ON CONFLICT (slug) DO NOTHING;

-- PRODUCT 2: Provana Micronized Creatine Monohydrate
INSERT INTO products (id, name, slug, brand_id, category_id, subcategory_id, goal_tag, badge, highlight, description, minimal_desc, benefits, usage_instructions, ingredients, allergens, status, published_at)
VALUES (
    '44444444-4444-4444-4444-444444444002',
    'Provana Creatine Monohydrate',
    'provana-micronized-creatine-monohydrate',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222002',
    '33333333-3333-3333-3333-333333333004',
    'Boost Performance',
    'MUSCLE SUPPORT',
    '3g pure micronized creatine / serving • 200 mesh',
    'Micro-pulverized 99.99% pure pharmaceutical-grade creatine monohydrate for peak ATP energy recycling, maximum endurance, and explosive strength.',
    'Micro-pulverized 99.99% pure creatine for peak ATP energy recycling, endurance and explosive strength.',
    'Increases intramuscular phosphocreatine reserves; Enhances power output on heavy compound lifts; Accelerates between-set recovery.',
    'Mix 1 scoop (3g) with 200ml of water or your favorite protein shake or carbohydrate beverage daily.',
    '100% Pure Micronized Creatine Monohydrate. Zero fillers, zero artificial additives.',
    'Free from common allergens. Gluten-Free and Vegan.',
    'PUBLISHED',
    CURRENT_TIMESTAMP
) ON CONFLICT (slug) DO NOTHING;

-- PRODUCT 3: Provana Extreme Pre-Workout Matrix
INSERT INTO products (id, name, slug, brand_id, category_id, subcategory_id, goal_tag, badge, highlight, description, minimal_desc, benefits, usage_instructions, ingredients, allergens, status, published_at)
VALUES (
    '44444444-4444-4444-4444-444444444003',
    'Provana Pre-Workout Matrix',
    'provana-extreme-preworkout-matrix',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222002',
    '33333333-3333-3333-3333-333333333005',
    'Boost Performance',
    'PERFORMANCE',
    '⚡ 300mg clean caffeine • 6g L-citrulline / serving',
    'High-intensity pre-training formulation combining potent nitric oxide boosters, clean neuro-stimulants, and fatigue buffers for skin-splitting pumps.',
    'High-intensity pre-training formulation for laser focus, clean energy, and maximum vasodilation.',
    'Provides laser cognitive focus; Triggers powerful blood flow pumps; Delays muscular fatigue.',
    'Mix 1 scoop with 250ml cold water 20-30 minutes before heavy athletic training. Do not exceed 1 scoop in 24 hours.',
    'L-Citrulline Malate 2:1, Beta-Alanine, Anhydrous Caffeine, L-Tyrosine, Taurine, Natural & Artificial Flavours, Citric Acid, Sucralose.',
    'Contains 300mg Caffeine per serving. Not recommended for children or caffeine-sensitive individuals.',
    'PUBLISHED',
    CURRENT_TIMESTAMP
) ON CONFLICT (slug) DO NOTHING;

-- 5. SEED VARIANTS & SKUS FOR PRODUCT 1 (Whey Isolate)
INSERT INTO product_variants (id, product_id, name, flavor, size, sort_order, active)
VALUES 
    ('55555555-5555-5555-5555-555555555001', '44444444-4444-4444-4444-444444444001', 'Belgian Chocolate - 1 kg', 'Belgian Chocolate', '1 kg', 1, true),
    ('55555555-5555-5555-5555-555555555002', '44444444-4444-4444-4444-444444444001', 'Belgian Chocolate - 2 kg', 'Belgian Chocolate', '2 kg', 2, true),
    ('55555555-5555-5555-5555-555555555003', '44444444-4444-4444-4444-444444444001', 'French Vanilla - 1 kg', 'French Vanilla', '1 kg', 3, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO skus (id, variant_id, sku_code, price, compare_at_price, currency, available, active)
VALUES 
    ('66666666-6666-6666-6666-666666666001', '55555555-5555-5555-5555-555555555001', 'PV-WHEY-ISO-CHOC-1KG', 2999.00, 3499.00, 'INR', true, true),
    ('66666666-6666-6666-6666-666666666002', '55555555-5555-5555-5555-555555555002', 'PV-WHEY-ISO-CHOC-2KG', 5499.00, 6499.00, 'INR', true, true),
    ('66666666-6666-6666-6666-666666666003', '55555555-5555-5555-5555-555555555003', 'PV-WHEY-ISO-VAN-1KG', 2999.00, 3499.00, 'INR', true, true)
ON CONFLICT (sku_code) DO NOTHING;

-- 6. SEED VARIANTS & SKUS FOR PRODUCT 2 (Creatine)
INSERT INTO product_variants (id, product_id, name, flavor, size, sort_order, active)
VALUES 
    ('55555555-5555-5555-5555-555555555004', '44444444-4444-4444-4444-444444444002', 'Unflavoured - 250 g', 'Unflavoured', '250 g', 1, true),
    ('55555555-5555-5555-5555-555555555005', '44444444-4444-4444-4444-444444444002', 'Unflavoured - 500 g', 'Unflavoured', '500 g', 2, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO skus (id, variant_id, sku_code, price, compare_at_price, currency, available, active)
VALUES 
    ('66666666-6666-6666-6666-666666666004', '55555555-5555-5555-5555-555555555004', 'PV-CREAT-UNFL-250G', 999.00, 1299.00, 'INR', true, true),
    ('66666666-6666-6666-6666-666666666005', '55555555-5555-5555-5555-555555555005', 'PV-CREAT-UNFL-500G', 1699.00, 2199.00, 'INR', true, true)
ON CONFLICT (sku_code) DO NOTHING;

-- 7. SEED VARIANTS & SKUS FOR PRODUCT 3 (Pre-Workout)
INSERT INTO product_variants (id, product_id, name, flavor, size, sort_order, active)
VALUES 
    ('55555555-5555-5555-5555-555555555006', '44444444-4444-4444-4444-444444444003', 'Blue Raspberry - 300 g', 'Blue Raspberry', '300 g', 1, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO skus (id, variant_id, sku_code, price, compare_at_price, currency, available, active)
VALUES 
    ('66666666-6666-6666-6666-666666666006', '55555555-5555-5555-5555-555555555006', 'PV-PREW-BRASP-300G', 1599.00, 1999.00, 'INR', true, true)
ON CONFLICT (sku_code) DO NOTHING;

-- 8. SEED MEDIA
INSERT INTO product_media (id, product_id, media_type, url, alt_text, is_primary, sort_order, active)
VALUES 
    ('77777777-7777-7777-7777-777777777001', '44444444-4444-4444-4444-444444444001', 'IMAGE', '/assets/product-catalog/whey_isolated.png', 'Provana 100% Pure Whey Isolate Tub', true, 1, true),
    ('77777777-7777-7777-7777-777777777002', '44444444-4444-4444-4444-444444444002', 'IMAGE', '/assets/product-catalog/creatine_monohydrate.png', 'Provana Creatine Monohydrate 200 Mesh', true, 1, true),
    ('77777777-7777-7777-7777-777777777003', '44444444-4444-4444-4444-444444444003', 'IMAGE', '/assets/product-catalog/preworkout.png', 'Provana Extreme Pre-Workout Matrix', true, 1, true)
ON CONFLICT (id) DO NOTHING;

-- 9. SEED NUTRITION
INSERT INTO product_nutrition (id, product_id, serving_size, servings_per_container, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, metrics_json)
VALUES 
    ('88888888-8888-8888-8888-888888888001', '44444444-4444-4444-4444-444444444001', '32g (1 Scoop)', 31, 120, 27.0, 1.2, 0.5, 0.0, 0.0, 140.0, '[{"metric":"Protein per scoop","value":"27 g"},{"metric":"BCAA","value":"6.2 g"},{"metric":"EAA","value":"12.8 g"}]'),
    ('88888888-8888-8888-8888-888888888002', '44444444-4444-4444-4444-444444444002', '3g (1 Scoop)', 83, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, '[{"metric":"Creatine Monohydrate","value":"3.0 g"},{"metric":"Mesh","value":"200 Mesh"},{"metric":"Purity","value":"99.99%"}]')
ON CONFLICT (product_id) DO NOTHING;

-- 10. SEED FAQS
INSERT INTO product_faqs (id, product_id, question, answer, sort_order, active)
VALUES 
    ('99999999-9999-9999-9999-999999999001', '44444444-4444-4444-4444-444444444001', 'When is the best time to consume Whey Isolate?', 'Consume 1 scoop within 30-45 minutes post-workout to kickstart muscle protein synthesis, or in the morning to meet daily protein targets.', 1, true),
    ('99999999-9999-9999-9999-999999999002', '44444444-4444-4444-4444-444444444001', 'Is this product tested for heavy metals?', 'Yes. Every batch is third-party NABL ISO/IEC 17025 accredited tested for heavy metals, protein assay, and banned substances.', 2, true),
    ('99999999-9999-9999-9999-999999999003', '44444444-4444-4444-4444-444444444002', 'Do I need to do a loading phase with Creatine?', 'A loading phase is optional. Taking 3g daily will fully saturate muscle creatine reserves within 3-4 weeks without gastrointestinal discomfort.', 1, true)
ON CONFLICT (id) DO NOTHING;
