-- ============================================================
-- BlueFlow — Initial Schema
-- Run in Supabase SQL editor or via supabase db push
-- ============================================================

-- ─── EXTENSIONS ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS ───────────────────────────────────────────────────
CREATE TABLE public.users (
  id                         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                      TEXT NOT NULL,
  full_name                  TEXT,
  avatar_url                 TEXT,
  trading_style              TEXT NOT NULL DEFAULT 'swing'
                               CHECK (trading_style IN ('scalping', 'day', 'swing', 'position')),
  subscription_tier          TEXT NOT NULL DEFAULT 'free'
                               CHECK (subscription_tier IN ('free', 'pro', 'elite')),
  analyses_used_this_month   INTEGER NOT NULL DEFAULT 0,
  monthly_reset_date         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stripe_customer_id         TEXT,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ANALYSES ────────────────────────────────────────────────
CREATE TABLE public.analyses (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  image_url            TEXT NOT NULL,
  trend                TEXT,
  key_levels           JSONB,
  pattern              TEXT,
  bias                 TEXT CHECK (bias IN ('bullish', 'bearish', 'neutral')),
  confidence_score     INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
  pre_trade_checklist  JSONB,
  raw_analysis         TEXT,
  trading_style        TEXT CHECK (trading_style IN ('scalping', 'day', 'swing', 'position')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SUBSCRIPTIONS ───────────────────────────────────────────
CREATE TABLE public.subscriptions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_subscription_id   TEXT UNIQUE NOT NULL,
  stripe_price_id          TEXT NOT NULL,
  status                   TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing')),
  tier                     TEXT NOT NULL CHECK (tier IN ('pro', 'elite')),
  current_period_start     TIMESTAMPTZ NOT NULL,
  current_period_end       TIMESTAMPTZ NOT NULL,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ────────────────────────────────────────────────
CREATE INDEX idx_analyses_user_id     ON public.analyses(user_id);
CREATE INDEX idx_analyses_created_at  ON public.analyses(created_at DESC);
CREATE INDEX idx_subscriptions_user   ON public.subscriptions(user_id);
CREATE INDEX idx_users_stripe         ON public.users(stripe_customer_id);

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── AUTO-CREATE USER PROFILE ON SIGNUP ─────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- users: read/update own row only
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- analyses: full CRUD on own rows
CREATE POLICY "analyses_select_own" ON public.analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "analyses_insert_own" ON public.analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "analyses_delete_own" ON public.analyses
  FOR DELETE USING (auth.uid() = user_id);

-- subscriptions: read own rows
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- ─── STORAGE BUCKET ──────────────────────────────────────────
-- Run these in Supabase Dashboard > Storage OR via CLI:
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('charts', 'charts', false);
--
-- CREATE POLICY "charts_upload_own" ON storage.objects
--   FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'charts' AND (storage.foldername(name))[1] = auth.uid()::text);
--
-- CREATE POLICY "charts_select_own" ON storage.objects
--   FOR SELECT TO authenticated
--   USING (bucket_id = 'charts' AND (storage.foldername(name))[1] = auth.uid()::text);
--
-- CREATE POLICY "charts_delete_own" ON storage.objects
--   FOR DELETE TO authenticated
--   USING (bucket_id = 'charts' AND (storage.foldername(name))[1] = auth.uid()::text);
