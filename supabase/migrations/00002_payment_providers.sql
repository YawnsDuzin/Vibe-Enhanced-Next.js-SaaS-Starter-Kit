-- Migration: Add support for multiple payment providers (Stripe + Toss)
-- Run this after 00001_initial_schema.sql

-- ===========================================
-- Payment Provider Enum
-- ===========================================

CREATE TYPE payment_provider AS ENUM ('stripe', 'toss');
CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELED');

-- ===========================================
-- Update Subscriptions Table
-- ===========================================

-- Add payment provider column
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS payment_provider payment_provider DEFAULT 'stripe';

-- Add external_id for Toss payment key (Stripe uses stripe_subscription_id)
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS external_id TEXT;

-- Add canceled_at column
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ;

-- Create index for external_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_external_id ON subscriptions(external_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_provider ON subscriptions(payment_provider);

-- ===========================================
-- Payment History Table
-- ===========================================

CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'KRW',
    status payment_status DEFAULT 'PENDING',
    payment_provider payment_provider NOT NULL,
    external_id TEXT, -- paymentKey for Toss, payment_intent for Stripe
    order_id TEXT,
    plan plan_type,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own payment history"
    ON payment_history FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Service role can insert payment history"
    ON payment_history FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can update payment history"
    ON payment_history FOR UPDATE
    USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_history_user ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_external_id ON payment_history(external_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_order_id ON payment_history(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_created ON payment_history(created_at);

-- Trigger for updated_at
CREATE TRIGGER update_payment_history_updated_at
    BEFORE UPDATE ON payment_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Billing Key Storage (for Toss recurring payments)
-- ===========================================

CREATE TABLE IF NOT EXISTS billing_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    payment_provider payment_provider NOT NULL,
    billing_key TEXT NOT NULL,
    customer_key TEXT,
    card_company TEXT,
    card_number TEXT, -- masked, e.g., "****1234"
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE billing_keys ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own billing keys"
    ON billing_keys FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Service role can manage billing keys"
    ON billing_keys FOR ALL
    USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_billing_keys_user ON billing_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_keys_active ON billing_keys(is_active);

-- Trigger for updated_at
CREATE TRIGGER update_billing_keys_updated_at
    BEFORE UPDATE ON billing_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Comments for documentation
-- ===========================================

COMMENT ON TABLE payment_history IS 'Stores all payment transactions for both Stripe and Toss';
COMMENT ON COLUMN payment_history.external_id IS 'Payment identifier: paymentKey for Toss, payment_intent_id for Stripe';
COMMENT ON COLUMN payment_history.order_id IS 'Order identifier: format is {userId}_{plan}_{timestamp}';

COMMENT ON TABLE billing_keys IS 'Stores billing keys for recurring payments (mainly for Toss)';
COMMENT ON COLUMN billing_keys.billing_key IS 'Toss billingKey or Stripe payment_method_id';
COMMENT ON COLUMN billing_keys.card_number IS 'Masked card number for display purposes';
