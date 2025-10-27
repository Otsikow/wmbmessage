-- Create sermon_cross_references table for linking Bible verses to WMB sermon quotes
CREATE TABLE IF NOT EXISTS public.sermon_cross_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bible_book TEXT NOT NULL,
  bible_chapter INTEGER NOT NULL,
  bible_verse INTEGER NOT NULL,
  sermon_id UUID NOT NULL REFERENCES public.sermons(id) ON DELETE CASCADE,
  paragraph_id UUID NOT NULL REFERENCES public.sermon_paragraphs(id) ON DELETE CASCADE,
  reference_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_sermon_cross_ref UNIQUE (bible_book, bible_chapter, bible_verse, sermon_id, paragraph_id)
);

-- Create indexes for faster lookups
CREATE INDEX idx_sermon_cross_refs_bible ON public.sermon_cross_references(bible_book, bible_chapter, bible_verse);
CREATE INDEX idx_sermon_cross_refs_sermon ON public.sermon_cross_references(sermon_id);
CREATE INDEX idx_sermon_cross_refs_paragraph ON public.sermon_cross_references(paragraph_id);

-- Enable Row Level Security
ALTER TABLE public.sermon_cross_references ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to sermon_cross_references"
  ON public.sermon_cross_references FOR SELECT
  TO public
  USING (true);

-- Create policies for authenticated users to manage sermon cross-references
CREATE POLICY "Allow admins to insert sermon_cross_references"
  ON public.sermon_cross_references FOR INSERT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Allow admins to update sermon_cross_references"
  ON public.sermon_cross_references FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Allow admins to delete sermon_cross_references"
  ON public.sermon_cross_references FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sermon_cross_references_updated_at
BEFORE UPDATE ON public.sermon_cross_references
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample sermon cross-references
-- These are examples - you can add more as you identify connections
INSERT INTO public.sermon_cross_references (bible_book, bible_chapter, bible_verse, sermon_id, paragraph_id, reference_note)
SELECT 
  'John', 3, 16,
  s.id,
  sp.id,
  'Brother Branham explains the depth of God''s love in this passage'
FROM public.sermons s
JOIN public.sermon_paragraphs sp ON sp.sermon_id = s.id
WHERE s.title LIKE '%The Message%'
  AND sp.content ILIKE '%john 3:16%'
LIMIT 1
ON CONFLICT (bible_book, bible_chapter, bible_verse, sermon_id, paragraph_id) DO NOTHING;
