-- Create bible_verses table to store Bible content
CREATE TABLE IF NOT EXISTS public.bible_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  translation TEXT DEFAULT 'KJV' NOT NULL,
  is_jesus_words BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_verse UNIQUE (book, chapter, verse, translation)
);

-- Create indexes for faster lookups
CREATE INDEX idx_bible_verses_book ON public.bible_verses(book);
CREATE INDEX idx_bible_verses_chapter ON public.bible_verses(book, chapter);
CREATE INDEX idx_bible_verses_verse ON public.bible_verses(book, chapter, verse);
CREATE INDEX idx_bible_verses_text ON public.bible_verses USING gin(to_tsvector('english', text));

-- Enable Row Level Security
ALTER TABLE public.bible_verses ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to bible_verses"
  ON public.bible_verses FOR SELECT
  TO public
  USING (true);

-- Create policies for admin write access
CREATE POLICY "Allow admins to insert bible_verses"
  ON public.bible_verses FOR INSERT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Allow admins to update bible_verses"
  ON public.bible_verses FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Allow admins to delete bible_verses"
  ON public.bible_verses FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to search Bible verses by content
CREATE OR REPLACE FUNCTION search_bible_verses(search_query TEXT, result_limit INTEGER DEFAULT 100)
RETURNS TABLE (
  id UUID,
  book TEXT,
  chapter INTEGER,
  verse INTEGER,
  text TEXT,
  translation TEXT,
  is_jesus_words BOOLEAN,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bv.id,
    bv.book,
    bv.chapter,
    bv.verse,
    bv.text,
    bv.translation,
    bv.is_jesus_words,
    ts_rank(to_tsvector('english', bv.text), plainto_tsquery('english', search_query)) as relevance
  FROM public.bible_verses bv
  WHERE to_tsvector('english', bv.text) @@ plainto_tsquery('english', search_query)
     OR bv.book ILIKE '%' || search_query || '%'
  ORDER BY relevance DESC, bv.book, bv.chapter, bv.verse
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_bible_verses_updated_at
BEFORE UPDATE ON public.bible_verses
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
