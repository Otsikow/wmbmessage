-- Create bible_verses table for storing Bible content
CREATE TABLE public.bible_verses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_verse UNIQUE (book, chapter, verse)
);

-- Create index for faster lookups
CREATE INDEX idx_bible_verses_book_chapter ON public.bible_verses(book, chapter);
CREATE INDEX idx_bible_verses_search ON public.bible_verses USING gin(to_tsvector('english', text));

-- Create user_highlights table for storing user verse highlights
CREATE TABLE public.user_highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_id UUID REFERENCES public.bible_verses(id) ON DELETE CASCADE,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  color TEXT NOT NULL DEFAULT 'yellow',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_verse_highlight UNIQUE (user_id, book, chapter, verse)
);

-- Create user_bookmarks table for storing user verse bookmarks
CREATE TABLE public.user_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_bookmark UNIQUE (user_id, book, chapter, verse)
);

-- Enable Row Level Security
ALTER TABLE public.bible_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Policies for bible_verses (public read, admin write)
CREATE POLICY "Anyone can view Bible verses"
ON public.bible_verses
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage Bible verses"
ON public.bible_verses
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Policies for user_highlights
CREATE POLICY "Users can view their own highlights"
ON public.user_highlights
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own highlights"
ON public.user_highlights
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own highlights"
ON public.user_highlights
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own highlights"
ON public.user_highlights
FOR DELETE
USING (auth.uid() = user_id);

-- Policies for user_bookmarks
CREATE POLICY "Users can view their own bookmarks"
ON public.user_bookmarks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
ON public.user_bookmarks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks"
ON public.user_bookmarks
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
ON public.user_bookmarks
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_highlights_updated_at
BEFORE UPDATE ON public.user_highlights
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
