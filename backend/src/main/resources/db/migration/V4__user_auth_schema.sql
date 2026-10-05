-- ========================================================
-- PROVANA V4__user_auth_schema.sql
-- User Authentication & Role-Based Access Control Schema
-- ========================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(active);

-- Baseline Seed Accounts (BCrypt hash for 'Password@123': $2a$10$G0x4qXhQk6xT54f1Y41Fz.4PZk4R4yQe6uV4.7A4K7S1H7Z3G7Q7m)
-- Additional programmatic accounts initialized by DataInitializer for exact credentials
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, active)
VALUES 
    ('10000000-0000-0000-0000-000000000001', 'admin@provana.com', '$2a$10$w09ZkCUG8qR64Nq8YkYk4e0z6O5.jNl8eRz1f7s8L5A4N6m8K1qYe', 'Admin', 'Provana', '+919876543210', 'ADMIN', true),
    ('10000000-0000-0000-0000-000000000002', 'pm@provana.com', '$2a$10$w09ZkCUG8qR64Nq8YkYk4e0z6O5.jNl8eRz1f7s8L5A4N6m8K1qYe', 'Product', 'Manager', '+919876543211', 'PRODUCT_MANAGER', true),
    ('10000000-0000-0000-0000-000000000003', 'customer@provana.com', '$2a$10$w09ZkCUG8qR64Nq8YkYk4e0z6O5.jNl8eRz1f7s8L5A4N6m8K1qYe', 'Aarav', 'Sharma', '+919876543212', 'CUSTOMER', true)
ON CONFLICT (email) DO NOTHING;
