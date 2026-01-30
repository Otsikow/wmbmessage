-- Create enums for testimonies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'testimony_status') THEN
    CREATE TYPE public.testimony_status AS ENUM ('pending', 'approved', 'rejected', 'archived');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'testimony_category') THEN
    CREATE TYPE public.testimony_category AS ENUM (
      'healing',
      'financial_breakthrough',
      'family_marriage',
      'salvation_growth',
      'deliverance',
      'career_education',
      'other'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'testimony_identity') THEN
    CREATE TYPE public.testimony_identity AS ENUM ('full_name', 'first_name', 'anonymous');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'testimony_engagement_type') THEN
    CREATE TYPE public.testimony_engagement_type AS ENUM ('encouraged', 'prayed');
  END IF;
END $$;

-- Core testimonies table
CREATE TABLE IF NOT EXISTS public.testimonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  status public.testimony_status NOT NULL DEFAULT 'pending',
  category public.testimony_category NOT NULL,
  situation_before TEXT NOT NULL,
  change_summary TEXT NOT NULL,
  happened_at DATE NOT NULL,
  identity_preference public.testimony_identity NOT NULL DEFAULT 'full_name',
  display_name TEXT,
  consent_public BOOLEAN NOT NULL DEFAULT false,
  excerpt TEXT,
  comments_locked BOOLEAN NOT NULL DEFAULT false,
  flagged_sensitive BOOLEAN NOT NULL DEFAULT false,
  auto_flagged BOOLEAN NOT NULL DEFAULT false,
  auto_flag_reasons TEXT[],
  moderation_notes TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT testimonies_consent_required CHECK (consent_public = true),
  CONSTRAINT testimonies_display_name_required CHECK (
    identity_preference = 'anonymous' OR length(coalesce(display_name, '')) > 0
  )
);

-- Audio metadata
CREATE TABLE IF NOT EXISTS public.testimony_audio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  testimony_id UUID NOT NULL REFERENCES public.testimonies(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT testimony_audio_max_duration CHECK (duration_seconds <= 180)
);

-- Audio transcripts
CREATE TABLE IF NOT EXISTS public.testimony_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  testimony_audio_id UUID NOT NULL REFERENCES public.testimony_audio(id) ON DELETE CASCADE,
  transcript TEXT NOT NULL,
  is_auto_generated BOOLEAN NOT NULL DEFAULT true,
  edited_by_user BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments table (restricted)
CREATE TABLE IF NOT EXISTS public.testimony_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  testimony_id UUID NOT NULL REFERENCES public.testimonies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT testimony_comment_length CHECK (char_length(content) <= 180)
);

-- Engagements table
CREATE TABLE IF NOT EXISTS public.testimony_engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  testimony_id UUID NOT NULL REFERENCES public.testimonies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  engagement_type public.testimony_engagement_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT testimony_engagement_unique UNIQUE (testimony_id, user_id, engagement_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_testimonies_status ON public.testimonies (status);
CREATE INDEX IF NOT EXISTS idx_testimonies_category ON public.testimonies (category);
CREATE INDEX IF NOT EXISTS idx_testimonies_created_at ON public.testimonies (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimony_audio_testimony_id ON public.testimony_audio (testimony_id);
CREATE INDEX IF NOT EXISTS idx_testimony_transcripts_audio_id ON public.testimony_transcripts (testimony_audio_id);
CREATE INDEX IF NOT EXISTS idx_testimony_comments_testimony_id ON public.testimony_comments (testimony_id);
CREATE INDEX IF NOT EXISTS idx_testimony_engagements_testimony_id ON public.testimony_engagements (testimony_id);

-- Enable Row Level Security
ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimony_audio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimony_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimony_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimony_engagements ENABLE ROW LEVEL SECURITY;

-- Public can view approved testimonies
CREATE POLICY "Public can view approved testimonies"
  ON public.testimonies FOR SELECT
  TO public
  USING (status = 'approved' AND consent_public = true);

-- Public can submit testimonies (pending by default)
CREATE POLICY "Public can submit testimonies"
  ON public.testimonies FOR INSERT
  TO public
  WITH CHECK (consent_public = true);

-- Admin manage testimonies
CREATE POLICY "Admins can manage testimonies"
  ON public.testimonies FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public can view audio + transcripts for approved testimonies
CREATE POLICY "Public can view testimony audio"
  ON public.testimony_audio FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.testimonies t
      WHERE t.id = testimony_audio.testimony_id
        AND t.status = 'approved'
        AND t.consent_public = true
    )
  );

CREATE POLICY "Public can view testimony transcripts"
  ON public.testimony_transcripts FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.testimony_audio ta
      JOIN public.testimonies t ON t.id = ta.testimony_id
      WHERE ta.id = testimony_transcripts.testimony_audio_id
        AND t.status = 'approved'
        AND t.consent_public = true
    )
  );

-- Comments policies
CREATE POLICY "Public can view testimony comments"
  ON public.testimony_comments FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.testimonies t
      WHERE t.id = testimony_comments.testimony_id
        AND t.status = 'approved'
        AND t.consent_public = true
    )
  );

CREATE POLICY "Public can add testimony comments"
  ON public.testimony_comments FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.testimonies t
      WHERE t.id = testimony_comments.testimony_id
        AND t.status = 'approved'
        AND t.consent_public = true
        AND t.comments_locked = false
    )
  );

-- Engagement policies
CREATE POLICY "Public can view testimony engagements"
  ON public.testimony_engagements FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.testimonies t
      WHERE t.id = testimony_engagements.testimony_id
        AND t.status = 'approved'
        AND t.consent_public = true
    )
  );

CREATE POLICY "Public can add testimony engagements"
  ON public.testimony_engagements FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.testimonies t
      WHERE t.id = testimony_engagements.testimony_id
        AND t.status = 'approved'
        AND t.consent_public = true
    )
  );

-- Admin policies for audio, transcripts, comments, engagements
CREATE POLICY "Admins can manage testimony audio"
  ON public.testimony_audio FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage testimony transcripts"
  ON public.testimony_transcripts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage testimony comments"
  ON public.testimony_comments FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage testimony engagements"
  ON public.testimony_engagements FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_testimonies_updated_at
BEFORE UPDATE ON public.testimonies
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_testimony_transcripts_updated_at
BEFORE UPDATE ON public.testimony_transcripts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
