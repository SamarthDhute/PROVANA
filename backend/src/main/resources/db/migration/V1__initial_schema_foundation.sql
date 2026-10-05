-- ========================================================
-- PROVANA V1__initial_schema_foundation.sql
-- Database Foundation & Baseline Extensions
-- ========================================================

-- Enable UUID extension for cryptographically strong, non-enumerable primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- System Configuration & Platform Metadata table
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description VARCHAR(255),
    is_encrypted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert baseline platform metadata
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES 
    ('PLATFORM_NAME', 'PROVANA', 'Official Brand Name'),
    ('PLATFORM_STATUS', 'OPERATIONAL', 'Core E-Commerce Platform Status'),
    ('PLATFORM_VERSION', '1.0.0-PHASE0', 'Platform Implementation Milestone')
ON CONFLICT (setting_key) DO NOTHING;
