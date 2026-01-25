-- Add full text search indexes for better performance

-- Ensure existing content indexes are present (re-declaring with IF NOT EXISTS for safety)
CREATE INDEX IF NOT EXISTS idx_sermon_paragraphs_content ON public.sermon_paragraphs USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_bible_verses_text ON public.bible_verses USING gin(to_tsvector('english', text));

-- Sermons title
CREATE INDEX IF NOT EXISTS idx_sermons_title_fts ON public.sermons USING gin(to_tsvector('english', title));

-- User notes content and title
CREATE INDEX IF NOT EXISTS idx_user_notes_content_fts ON public.user_notes USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_user_notes_title_fts ON public.user_notes USING gin(to_tsvector('english', title));

-- User highlights note
CREATE INDEX IF NOT EXISTS idx_user_highlights_note_fts ON public.user_highlights USING gin(to_tsvector('english', note));

-- Bible verses book (for searching by book name efficiently using FTS)
CREATE INDEX IF NOT EXISTS idx_bible_verses_book_fts ON public.bible_verses USING gin(to_tsvector('english', book));

-- Update search_sermon_content to use FTS on title
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
     OR to_tsvector('english', s.title) @@ plainto_tsquery('english', search_query)
  ORDER BY relevance DESC, s.date DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Update search_bible_verses to use FTS on book
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
     OR to_tsvector('english', bv.book) @@ plainto_tsquery('english', search_query)
  ORDER BY relevance DESC, bv.book, bv.chapter, bv.verse
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;
