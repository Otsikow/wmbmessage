-- Ensure user_notes has all app-required columns
DO $$
BEGIN
  -- Create enum for note sources if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'note_source_type') THEN
    CREATE TYPE public.note_source_type AS ENUM ('bible', 'sermon');
  END IF;
END $$;

-- Add missing columns with safe defaults
ALTER TABLE public.user_notes
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS sermon_title TEXT;
