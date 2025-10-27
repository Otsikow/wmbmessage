-- Create daily_content table for daily verse and quote feature
CREATE TABLE IF NOT EXISTS public.daily_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bible_book TEXT NOT NULL,
  bible_chapter INTEGER NOT NULL,
  bible_verse INTEGER NOT NULL,
  sermon_paragraph_id UUID NOT NULL REFERENCES public.sermon_paragraphs(id) ON DELETE CASCADE,
  date_generated DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(date_generated)
);

-- Create index for faster date lookups
CREATE INDEX idx_daily_content_date ON public.daily_content(date_generated DESC);

-- Enable Row Level Security
ALTER TABLE public.daily_content ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access to daily_content"
  ON public.daily_content FOR SELECT
  TO public
  USING (true);

-- Create policy for authenticated users to insert daily content
CREATE POLICY "Allow authenticated users to insert daily_content"
  ON public.daily_content FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to generate random daily content
CREATE OR REPLACE FUNCTION public.generate_daily_content()
RETURNS public.daily_content
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bible_books TEXT[] := ARRAY[
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
    '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
    'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes',
    'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
    'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
    'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke',
    'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
    'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter',
    '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
  ];
  v_max_chapters INTEGER[] := ARRAY[
    50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42, 150, 31,
    12, 8, 66, 52, 5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4, 28, 16, 24, 21,
    28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1, 22
  ];
  v_random_book_idx INTEGER;
  v_random_book TEXT;
  v_random_chapter INTEGER;
  v_random_verse INTEGER;
  v_random_paragraph_id UUID;
  v_new_record public.daily_content;
BEGIN
  -- Check if today's content already exists
  SELECT * INTO v_new_record
  FROM public.daily_content
  WHERE date_generated = CURRENT_DATE;
  
  IF FOUND THEN
    RETURN v_new_record;
  END IF;

  -- Select a random Bible book, chapter, and verse
  v_random_book_idx := 1 + floor(random() * 66)::INTEGER;
  v_random_book := v_bible_books[v_random_book_idx];
  v_random_chapter := 1 + floor(random() * v_max_chapters[v_random_book_idx])::INTEGER;
  v_random_verse := 1 + floor(random() * 30)::INTEGER; -- Most chapters have at least 30 verses

  -- Select a random sermon paragraph
  SELECT id INTO v_random_paragraph_id
  FROM public.sermon_paragraphs
  ORDER BY random()
  LIMIT 1;

  -- If no sermon paragraphs exist, raise an exception
  IF v_random_paragraph_id IS NULL THEN
    RAISE EXCEPTION 'No sermon paragraphs available';
  END IF;

  -- Insert new daily content
  INSERT INTO public.daily_content (
    bible_book,
    bible_chapter,
    bible_verse,
    sermon_paragraph_id,
    date_generated
  ) VALUES (
    v_random_book,
    v_random_chapter,
    v_random_verse,
    v_random_paragraph_id,
    CURRENT_DATE
  )
  RETURNING * INTO v_new_record;

  RETURN v_new_record;
END;
$$;
