-- Create sermons table for William Branham's messages
CREATE TABLE IF NOT EXISTS public.sermons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create sermon_paragraphs table to store the actual content
CREATE TABLE IF NOT EXISTS public.sermon_paragraphs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sermon_id UUID NOT NULL REFERENCES public.sermons(id) ON DELETE CASCADE,
  paragraph_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(sermon_id, paragraph_number)
);

-- Create indexes for better search performance
CREATE INDEX idx_sermon_paragraphs_sermon_id ON public.sermon_paragraphs(sermon_id);
CREATE INDEX idx_sermon_paragraphs_content ON public.sermon_paragraphs USING gin(to_tsvector('english', content));

-- Enable Row Level Security
ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sermon_paragraphs ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to sermons"
  ON public.sermons FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to sermon_paragraphs"
  ON public.sermon_paragraphs FOR SELECT
  TO public
  USING (true);

-- Create policies for authenticated users to manage sermons
CREATE POLICY "Allow authenticated users to insert sermons"
  ON public.sermons FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update sermons"
  ON public.sermons FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete sermons"
  ON public.sermons FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert sermon_paragraphs"
  ON public.sermon_paragraphs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update sermon_paragraphs"
  ON public.sermon_paragraphs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete sermon_paragraphs"
  ON public.sermon_paragraphs FOR DELETE
  TO authenticated
  USING (true);

-- Function to search sermons by content
CREATE OR REPLACE FUNCTION search_sermon_content(search_query TEXT, result_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  sermon_id UUID,
  sermon_title TEXT,
  sermon_date DATE,
  sermon_location TEXT,
  paragraph_number INTEGER,
  content TEXT,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as sermon_id,
    s.title as sermon_title,
    s.date as sermon_date,
    s.location as sermon_location,
    sp.paragraph_number,
    sp.content,
    ts_rank(to_tsvector('english', sp.content), plainto_tsquery('english', search_query)) as relevance
  FROM public.sermon_paragraphs sp
  JOIN public.sermons s ON s.id = sp.sermon_id
  WHERE to_tsvector('english', sp.content) @@ plainto_tsquery('english', search_query)
     OR s.title ILIKE '%' || search_query || '%'
  ORDER BY relevance DESC, s.date DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;
