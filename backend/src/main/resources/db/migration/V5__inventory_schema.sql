-- ========================================================
-- PROVANA V5__inventory_schema.sql
-- Inventory, Stock Tracking & Movement Audit Schema
-- ========================================================

-- 1. INVENTORY TABLE
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku_id UUID NOT NULL UNIQUE REFERENCES skus(id) ON DELETE CASCADE,
    available_quantity INT NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
    reserved_quantity INT NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    sold_quantity INT NOT NULL DEFAULT 0 CHECK (sold_quantity >= 0),
    low_stock_threshold INT NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'IN_STOCK',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_inventory_sku_id ON inventory(sku_id);
CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_inventory_low_stock ON inventory(available_quantity, low_stock_threshold);

-- 2. INVENTORY MOVEMENTS AUDIT TABLE
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    previous_quantity INT NOT NULL,
    new_quantity INT NOT NULL,
    reason VARCHAR(255),
    reference_type VARCHAR(50),
    reference_id VARCHAR(100),
    performed_by VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_inventory_movements_sku_id ON inventory_movements(sku_id);
CREATE INDEX idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX idx_inventory_movements_created_at ON inventory_movements(created_at DESC);

-- 3. SEED INITIAL INVENTORY FOR EXISTING SKUS
INSERT INTO inventory (id, sku_id, available_quantity, reserved_quantity, sold_quantity, low_stock_threshold, status)
SELECT 
    gen_random_uuid(),
    s.id,
    100,
    0,
    0,
    10,
    'IN_STOCK'
FROM skus s
ON CONFLICT (sku_id) DO NOTHING;

-- 4. SEED INITIAL STOCK_RECEIVED MOVEMENTS
INSERT INTO inventory_movements (id, sku_id, movement_type, quantity, previous_quantity, new_quantity, reason, reference_type, performed_by)
SELECT 
    gen_random_uuid(),
    s.id,
    'STOCK_RECEIVED',
    100,
    0,
    100,
    'Initial inventory baseline load',
    'SYSTEM_INIT',
    'SYSTEM'
FROM skus s
WHERE NOT EXISTS (
    SELECT 1 FROM inventory_movements im WHERE im.sku_id = s.id
);
