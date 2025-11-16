-- Ensure study notes capture titles and Bible references
ALTER TABLE public.user_notes
  ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Untitled Note',
  ADD COLUMN IF NOT EXISTS verse_reference TEXT;

-- Keep updated_at current when existing rows are touched
UPDATE public.user_notes
SET updated_at = NOW()
WHERE TRUE;
