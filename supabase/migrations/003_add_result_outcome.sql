-- Add fields the UI expects
ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS result JSONB,
  ADD COLUMN IF NOT EXISTS outcome TEXT NOT NULL DEFAULT 'pending'
    CHECK (outcome IN ('pending', 'won', 'lost')),
  ADD COLUMN IF NOT EXISTS chart_image_url TEXT;

-- Allow UPDATE policy for outcome tracking
DROP POLICY IF EXISTS "analyses_update_own" ON public.analyses;
CREATE POLICY "analyses_update_own" ON public.analyses
  FOR UPDATE USING (auth.uid() = user_id);

-- Relax trading_style constraint to allow smc/price_action
ALTER TABLE public.analyses DROP CONSTRAINT IF EXISTS analyses_trading_style_check;
ALTER TABLE public.analyses ADD CONSTRAINT analyses_trading_style_check
  CHECK (trading_style IN ('scalping', 'day', 'swing', 'position', 'smc', 'price_action'));

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_trading_style_check;
ALTER TABLE public.users ADD CONSTRAINT users_trading_style_check
  CHECK (trading_style IN ('scalping', 'day', 'swing', 'position', 'smc', 'price_action'));

-- image_url is NOT NULL but may be empty string when storage upload fails
ALTER TABLE public.analyses ALTER COLUMN image_url DROP NOT NULL;
