-- CryptoVision AI Database Schema for Supabase
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid TEXT UNIQUE NOT NULL, -- Auth user ID from Supabase Auth
    email TEXT UNIQUE NOT NULL,
    credits INTEGER DEFAULT 6,
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expires_at TIMESTAMPTZ,
    subscription_type TEXT,
    payment_id TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Predictions history table
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid TEXT NOT NULL,
    stock TEXT NOT NULL,
    days INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (uid) REFERENCES users (uid) ON DELETE CASCADE
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    credits INTEGER DEFAULT 0,
    premium_days INTEGER DEFAULT 0,
    max_uses INTEGER DEFAULT 1,
    uses INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_by TEXT NOT NULL
);

-- Coupon redemptions table
CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL,
    uid TEXT NOT NULL,
    redeemed_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (coupon_id) REFERENCES coupons (id) ON DELETE CASCADE,
    FOREIGN KEY (uid) REFERENCES users (uid) ON DELETE CASCADE,
    UNIQUE (coupon_id, uid)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_uid ON users (uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_predictions_uid ON predictions (uid);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions (created_at);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons (code);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_uid ON coupon_redemptions (uid);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (auth.uid()::text = uid);

CREATE POLICY "Users can update their own data"
    ON users FOR UPDATE
    USING (auth.uid()::text = uid);

-- RLS Policies for predictions table
CREATE POLICY "Users can view their own predictions"
    ON predictions FOR SELECT
    USING (auth.uid()::text = uid);

CREATE POLICY "Users can insert their own predictions"
    ON predictions FOR INSERT
    WITH CHECK (auth.uid()::text = uid);

-- RLS Policies for coupons table (public read, admin write)
CREATE POLICY "Anyone can view active coupons"
    ON coupons FOR SELECT
    USING (active = TRUE);

CREATE POLICY "Admins can manage coupons"
    ON coupons FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.uid = auth.uid()::text
            AND users.is_admin = TRUE
        )
    );

-- RLS Policies for coupon redemptions
CREATE POLICY "Users can view their own redemptions"
    ON coupon_redemptions FOR SELECT
    USING (auth.uid()::text = uid);

CREATE POLICY "Users can redeem coupons"
    ON coupon_redemptions FOR INSERT
    WITH CHECK (auth.uid()::text = uid);

-- Create admin user function
CREATE OR REPLACE FUNCTION check_admin_email()
RETURNS TRIGGER AS $$
BEGIN
    -- Set is_admin to true for specific email
    IF NEW.email = 'ayushnema2468@gmail.com' THEN
        NEW.is_admin = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-set admin status
DROP TRIGGER IF EXISTS set_admin_on_insert ON users;
CREATE TRIGGER set_admin_on_insert
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION check_admin_email();

-- Create function to check premium expiration
CREATE OR REPLACE FUNCTION check_premium_expiration()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-expire premium if expired
    IF NEW.is_premium = TRUE 
       AND NEW.premium_expires_at IS NOT NULL 
       AND NEW.premium_expires_at < NOW() THEN
        NEW.is_premium = FALSE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check premium on read
DROP TRIGGER IF EXISTS check_premium_on_select ON users;
CREATE TRIGGER check_premium_on_select
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION check_premium_expiration();

COMMENT ON TABLE users IS 'User accounts with credits and premium status';
COMMENT ON TABLE predictions IS 'History of all predictions made by users';
COMMENT ON TABLE coupons IS 'Coupon codes for credits and premium access';
COMMENT ON TABLE coupon_redemptions IS 'Track which users redeemed which coupons';
