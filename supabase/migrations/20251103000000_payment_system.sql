-- =====================================================
-- PAYMENT SYSTEM MIGRATION (Stripe Integration)
-- =====================================================
-- This migration implements complete payment and subscription management.
-- Supports both mock mode (development) and real Stripe payments (production).
--
-- TABLES:
-- - subscriptions: User subscription status and billing info
-- - invoices: Billing history and payment records
-- - payment_methods: Saved payment methods (cards, etc.)
--
-- SECURITY:
-- - RLS policies ensure users can only access their own payment data
-- - Indexes optimize subscription status checks and billing queries
-- - Foreign keys maintain referential integrity
-- =====================================================

-- =====================================================
-- 1. CREATE SUBSCRIPTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Stripe IDs (NULL in mock mode)
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,

  -- Subscription details
  plan_name TEXT NOT NULL DEFAULT 'student', -- 'student', 'teacher', 'admin'
  status TEXT NOT NULL DEFAULT 'trialing', -- 'active', 'trialing', 'canceled', 'past_due', 'incomplete'

  -- Billing period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,

  -- Trial period
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,

  -- Pricing
  amount_cents INTEGER NOT NULL DEFAULT 1999, -- $19.99 in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  billing_interval TEXT NOT NULL DEFAULT 'month', -- 'month' or 'year'

  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  canceled_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_plan_name CHECK (plan_name IN ('student', 'teacher', 'admin')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'trialing', 'canceled', 'past_due', 'incomplete', 'unpaid')),
  CONSTRAINT valid_currency CHECK (currency IN ('usd', 'eur', 'gbp')),
  CONSTRAINT valid_billing_interval CHECK (billing_interval IN ('month', 'year'))
);

-- Indexes for subscriptions table
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX idx_subscriptions_trial_end ON subscriptions(trial_end) WHERE trial_end IS NOT NULL;
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end) WHERE current_period_end IS NOT NULL;

-- Enable RLS on subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 2. CREATE INVOICES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

  -- Stripe IDs (NULL in mock mode)
  stripe_invoice_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,

  -- Invoice details
  amount_paid INTEGER NOT NULL, -- in cents
  amount_due INTEGER NOT NULL, -- in cents
  amount_remaining INTEGER DEFAULT 0, -- in cents
  currency TEXT NOT NULL DEFAULT 'usd',

  -- Status
  status TEXT NOT NULL DEFAULT 'paid', -- 'paid', 'open', 'void', 'uncollectible', 'draft'

  -- Invoice metadata
  invoice_number TEXT, -- e.g., "INV-2024-001"
  description TEXT,

  -- URLs (Stripe-hosted)
  invoice_pdf TEXT, -- URL to PDF
  hosted_invoice_url TEXT, -- URL to Stripe-hosted invoice page

  -- Billing period
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,

  -- Timestamps
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('paid', 'open', 'void', 'uncollectible', 'draft')),
  CONSTRAINT valid_currency CHECK (currency IN ('usd', 'eur', 'gbp')),
  CONSTRAINT valid_amounts CHECK (amount_paid >= 0 AND amount_due >= 0 AND amount_remaining >= 0)
);

-- Indexes for invoices table
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_subscription_id ON invoices(subscription_id) WHERE subscription_id IS NOT NULL;
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id) WHERE stripe_invoice_id IS NOT NULL;
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);
CREATE INDEX idx_invoices_paid_at ON invoices(paid_at DESC) WHERE paid_at IS NOT NULL;

-- Enable RLS on invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. CREATE PAYMENT METHODS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Stripe IDs (NULL in mock mode)
  stripe_payment_method_id TEXT UNIQUE,

  -- Payment method details
  type TEXT NOT NULL DEFAULT 'card', -- 'card', 'bank_account', 'paypal', etc.

  -- Card details (if type = 'card')
  card_brand TEXT, -- 'visa', 'mastercard', 'amex', 'discover', etc.
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  card_country TEXT,

  -- Bank account details (if type = 'bank_account')
  bank_name TEXT,
  bank_last4 TEXT,

  -- Status
  is_default BOOLEAN DEFAULT FALSE,
  is_expired BOOLEAN DEFAULT FALSE,

  -- Metadata
  billing_name TEXT, -- Cardholder name
  billing_email TEXT,
  billing_address JSONB, -- {line1, line2, city, state, postal_code, country}

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_type CHECK (type IN ('card', 'bank_account', 'paypal')),
  CONSTRAINT valid_card_exp_month CHECK (card_exp_month IS NULL OR (card_exp_month >= 1 AND card_exp_month <= 12)),
  CONSTRAINT valid_card_exp_year CHECK (card_exp_year IS NULL OR card_exp_year >= 2024)
);

-- Indexes for payment_methods table
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_stripe_id ON payment_methods(stripe_payment_method_id) WHERE stripe_payment_method_id IS NOT NULL;
CREATE INDEX idx_payment_methods_is_default ON payment_methods(user_id, is_default) WHERE is_default = TRUE;

-- Enable RLS on payment_methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_methods
CREATE POLICY "Users can view own payment methods"
  ON payment_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods"
  ON payment_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods"
  ON payment_methods FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods"
  ON payment_methods FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. ADD STRIPE CUSTOMER ID TO PROFILES TABLE
-- =====================================================

-- Add stripe_customer_id to profiles table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT UNIQUE;
    CREATE INDEX idx_profiles_stripe_customer_id ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
  END IF;
END $$;

-- =====================================================
-- 5. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get user's active subscription
CREATE OR REPLACE FUNCTION get_active_subscription(p_user_id UUID)
RETURNS TABLE (
  subscription_id UUID,
  plan_name TEXT,
  status TEXT,
  is_active BOOLEAN,
  is_trialing BOOLEAN,
  days_remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS subscription_id,
    s.plan_name,
    s.status,
    s.status IN ('active', 'trialing') AS is_active,
    s.status = 'trialing' AS is_trialing,
    CASE
      WHEN s.status = 'trialing' THEN
        EXTRACT(DAY FROM (s.trial_end - NOW()))::INTEGER
      WHEN s.status = 'active' THEN
        EXTRACT(DAY FROM (s.current_period_end - NOW()))::INTEGER
      ELSE
        0
    END AS days_remaining
  FROM subscriptions s
  WHERE s.user_id = p_user_id
    AND s.status IN ('active', 'trialing')
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has access (via own subscription or teacher's subscription)
CREATE OR REPLACE FUNCTION user_has_premium_access(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_own_subscription BOOLEAN;
  v_has_teacher_access BOOLEAN;
BEGIN
  -- Check if user has active subscription
  SELECT EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = p_user_id
      AND status IN ('active', 'trialing')
  ) INTO v_has_own_subscription;

  IF v_has_own_subscription THEN
    RETURN TRUE;
  END IF;

  -- Check if user is a student in a class with a teacher who has active subscription
  SELECT EXISTS (
    SELECT 1
    FROM class_members cm
    INNER JOIN classes c ON c.id = cm.class_id
    INNER JOIN profiles teacher ON teacher.id = c.teacher_id
    INNER JOIN subscriptions teacher_sub ON teacher_sub.user_id = teacher.id
    WHERE cm.user_id = p_user_id
      AND teacher.role = 'teacher'
      AND teacher_sub.status IN ('active', 'trialing')
  ) INTO v_has_teacher_access;

  RETURN v_has_teacher_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. CREATE UPDATED_AT TRIGGER FUNCTION
-- =====================================================

-- Update updated_at timestamp on subscriptions update
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subscription_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

-- Update updated_at timestamp on payment_methods update
CREATE OR REPLACE FUNCTION update_payment_method_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_payment_method_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_method_updated_at();

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

-- Grant SELECT permission on helper functions to authenticated users
GRANT EXECUTE ON FUNCTION get_active_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_premium_access(UUID) TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Payment system migration completed successfully';
  RAISE NOTICE 'Tables created: subscriptions, invoices, payment_methods';
  RAISE NOTICE 'Helper functions created: get_active_subscription, user_has_premium_access';
  RAISE NOTICE 'RLS policies and indexes created';
END $$;
