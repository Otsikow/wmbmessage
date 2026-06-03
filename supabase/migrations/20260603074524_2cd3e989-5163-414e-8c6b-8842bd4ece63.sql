
CREATE TABLE public.message_study_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  topic TEXT NOT NULL DEFAULT 'General',
  body TEXT NOT NULL,
  excerpt TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  author_id UUID,
  search_tsv TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.message_study_notes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.message_study_notes TO authenticated;
GRANT ALL ON public.message_study_notes TO service_role;

ALTER TABLE public.message_study_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published notes are viewable by everyone"
  ON public.message_study_notes FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can view all study notes"
  ON public.message_study_notes FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert study notes"
  ON public.message_study_notes FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update study notes"
  ON public.message_study_notes FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete study notes"
  ON public.message_study_notes FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.message_study_notes_tsv_trigger()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.search_tsv :=
    setweight(to_tsvector('english', coalesce(NEW.title,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.topic,'')), 'B') ||
    setweight(to_tsvector('english', array_to_string(coalesce(NEW.tags,'{}'::text[]), ' ')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.excerpt,'')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.body,'')), 'D');
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER message_study_notes_tsv_update
BEFORE INSERT OR UPDATE ON public.message_study_notes
FOR EACH ROW EXECUTE FUNCTION public.message_study_notes_tsv_trigger();

CREATE INDEX message_study_notes_search_idx ON public.message_study_notes USING GIN (search_tsv);
CREATE INDEX message_study_notes_topic_idx ON public.message_study_notes (topic);
CREATE INDEX message_study_notes_status_idx ON public.message_study_notes (status);
