-- ============================================================
-- BlueFlow — Affiliate System
-- ============================================================

-- Affiliate applications (anyone can apply; admin reviews)
CREATE TABLE public.affiliate_applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  platform      TEXT NOT NULL,
  audience_size TEXT NOT NULL,
  note          TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Approved affiliates (created by admin after approving an application)
CREATE TABLE public.affiliates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES public.users(id) ON DELETE SET NULL,
  code           TEXT UNIQUE NOT NULL,
  status         TEXT NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active', 'paused', 'suspended')),
  total_referrals INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Referral events: one row per referred user
CREATE TABLE public.affiliate_referrals (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id              UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referred_user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  -- 20% of first paid month (flagged when first invoice paid)
  first_month_commission_paid BOOLEAN NOT NULL DEFAULT FALSE,
  -- 10% recurring flagged monthly by webhook
  recurring_active          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (referred_user_id)
);

-- Track which affiliate code a user signed up with
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS referred_by_affiliate_code TEXT,
  ADD COLUMN IF NOT EXISTS referred_by_affiliate_id   UUID REFERENCES public.affiliates(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_affiliates_code          ON public.affiliates(code);
CREATE INDEX idx_affiliate_referrals_aff  ON public.affiliate_referrals(affiliate_id);
CREATE INDEX idx_users_affiliate_id       ON public.users(referred_by_affiliate_id);

-- updated_at trigger for affiliates
CREATE TRIGGER affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Helper RPC to safely increment total_referrals counter
CREATE OR REPLACE FUNCTION public.increment_affiliate_referrals(affiliate_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.affiliates
  SET total_referrals = total_referrals + 1
  WHERE id = affiliate_id;
END;
$$;

-- ─── RLS ────────────────────────────────────────────────────
ALTER TABLE public.affiliate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals    ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can submit an application
CREATE POLICY "affiliate_applications_insert_anon" ON public.affiliate_applications
  FOR INSERT WITH CHECK (TRUE);

-- Affiliates can view their own record
CREATE POLICY "affiliates_select_own" ON public.affiliates
  FOR SELECT USING (auth.uid() = user_id);

-- Affiliates can view their own referrals
CREATE POLICY "affiliate_referrals_select_own" ON public.affiliate_referrals
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
  );
