ALTER TABLE public.affiliate_applications
  ADD COLUMN IF NOT EXISTS handle TEXT;
