-- Add setup fields to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS trading_platform TEXT,
  ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN NOT NULL DEFAULT FALSE;
