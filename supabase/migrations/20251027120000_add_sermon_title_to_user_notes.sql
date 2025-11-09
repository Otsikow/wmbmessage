-- Add sermon title support to user notes
ALTER TABLE public.user_notes
  ADD COLUMN sermon_title TEXT;
