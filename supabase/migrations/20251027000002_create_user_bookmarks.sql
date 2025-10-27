-- Create user_bookmarks table for sermon bookmarks
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sermon_id UUID NOT NULL REFERENCES public.sermons(id) ON DELETE CASCADE,
  paragraph_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, sermon_id, paragraph_number)
);

-- Create index for better query performance
CREATE INDEX idx_user_bookmarks_user_id ON public.user_bookmarks(user_id);
CREATE INDEX idx_user_bookmarks_sermon_id ON public.user_bookmarks(sermon_id);

-- Enable Row Level Security
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies for user bookmarks (users can only see/manage their own bookmarks)
CREATE POLICY "Users can view their own bookmarks"
  ON public.user_bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
  ON public.user_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON public.user_bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
