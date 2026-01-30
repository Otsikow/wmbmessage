-- Create enums for prayer board module
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prayer_category') THEN
    CREATE TYPE public.prayer_category AS ENUM (
      'PERSONAL',
      'FAMILY',
      'HEALTH',
      'FINANCIAL',
      'IMMIGRATION_VISA',
      'CHURCH_MINISTRY',
      'THANKSGIVING',
      'URGENT'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prayer_visibility') THEN
    CREATE TYPE public.prayer_visibility AS ENUM (
      'PUBLIC',
      'GROUP_ONLY',
      'ANONYMOUS_PUBLIC',
      'PRIVATE'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prayer_status') THEN
    CREATE TYPE public.prayer_status AS ENUM (
      'ONGOING',
      'ANSWERED',
      'CONVERTED_TO_TESTIMONY'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prayer_moderation_status') THEN
    CREATE TYPE public.prayer_moderation_status AS ENUM (
      'PENDING',
      'APPROVED',
      'HIDDEN',
      'FLAGGED'
    );
  END IF;
END $$;

-- Prayer requests table
CREATE TABLE IF NOT EXISTS public.prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category public.prayer_category NOT NULL,
  visibility public.prayer_visibility NOT NULL,
  status public.prayer_status NOT NULL DEFAULT 'ONGOING',
  moderation_status public.prayer_moderation_status NOT NULL DEFAULT 'PENDING',
  prayer_count INTEGER NOT NULL DEFAULT 0,
  comments_locked BOOLEAN NOT NULL DEFAULT false,
  is_sensitive BOOLEAN NOT NULL DEFAULT false,
  blocked_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT prayer_request_title_required CHECK (length(trim(title)) > 0),
  CONSTRAINT prayer_request_description_length CHECK (length(description) <= 500)
);

-- Prayer testimonies linked to requests
CREATE TABLE IF NOT EXISTS public.prayer_testimonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (request_id)
);

-- Encouragement comments
CREATE TABLE IF NOT EXISTS public.prayer_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
  commenter_id UUID REFERENCES public.profiles(id),
  body TEXT NOT NULL,
  is_template BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT prayer_comment_body_length CHECK (length(body) <= 180)
);

-- Prayer engagements ("I prayed")
CREATE TABLE IF NOT EXISTS public.prayer_engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  prayed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  prayed_on DATE DEFAULT (timezone('utc'::text, now())::date) NOT NULL
);

-- Prayer status change history
CREATE TABLE IF NOT EXISTS public.prayer_status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES public.profiles(id),
  from_status public.prayer_status,
  to_status public.prayer_status NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for scalability
CREATE INDEX IF NOT EXISTS idx_prayer_requests_category ON public.prayer_requests (category);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_visibility ON public.prayer_requests (visibility);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_status ON public.prayer_requests (status);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_moderation ON public.prayer_requests (moderation_status);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_created_at ON public.prayer_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prayer_comments_request ON public.prayer_comments (request_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prayer_engagements_request ON public.prayer_engagements (request_id, prayed_at DESC);
CREATE INDEX IF NOT EXISTS idx_prayer_engagements_user_day ON public.prayer_engagements (user_id, prayed_on DESC);
CREATE INDEX IF NOT EXISTS idx_prayer_status_logs_request ON public.prayer_status_logs (request_id, created_at DESC);

-- Automatic blocking of sensitive content
CREATE OR REPLACE FUNCTION public.flag_prayer_request_content()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  detected_reason TEXT;
BEGIN
  detected_reason := NULL;

  IF NEW.title ~* '(donate|fundraiser|send money|wire transfer|cash app|venmo|paypal|gofundme|go fund me)'
    OR NEW.description ~* '(donate|fundraiser|send money|wire transfer|cash app|venmo|paypal|gofundme|go fund me)'
  THEN
    detected_reason := 'money solicitation';
  END IF;

  IF detected_reason IS NULL AND (
    NEW.title ~* '(visa fraud|fake visa|visa scam|fraudulent visa|bribe)'
    OR NEW.description ~* '(visa fraud|fake visa|visa scam|fraudulent visa|bribe)'
  ) THEN
    detected_reason := 'visa fraud';
  END IF;

  IF detected_reason IS NULL AND (
    NEW.title ~* '(election|vote|politic|campaign|party|government)'
    OR NEW.description ~* '(election|vote|politic|campaign|party|government)'
  ) THEN
    detected_reason := 'political content';
  END IF;

  IF detected_reason IS NOT NULL THEN
    NEW.moderation_status := 'HIDDEN';
    NEW.comments_locked := true;
    NEW.is_sensitive := true;
    NEW.blocked_reason := detected_reason;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER flag_prayer_request_content
BEFORE INSERT OR UPDATE ON public.prayer_requests
FOR EACH ROW
EXECUTE FUNCTION public.flag_prayer_request_content();

-- Enable Row Level Security
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_testimonies ENABLE ROW LEVEL SECURITY;

-- Publicly visible requests
CREATE POLICY "Public can view approved public prayer requests"
  ON public.prayer_requests FOR SELECT
  TO public
  USING (moderation_status = 'APPROVED' AND visibility IN ('PUBLIC', 'ANONYMOUS_PUBLIC'));

-- Authenticated users can submit requests
CREATE POLICY "Authenticated users can submit prayer requests"
  ON public.prayer_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can add encouragement
CREATE POLICY "Authenticated users can add prayer comments"
  ON public.prayer_comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can log prayers
CREATE POLICY "Authenticated users can log prayer engagements"
  ON public.prayer_engagements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admin policies
CREATE POLICY "Admins can manage prayer board"
  ON public.prayer_requests FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage prayer comments"
  ON public.prayer_comments FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage prayer engagements"
  ON public.prayer_engagements FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage prayer status logs"
  ON public.prayer_status_logs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage prayer testimonies"
  ON public.prayer_testimonies FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_prayer_requests_updated_at
BEFORE UPDATE ON public.prayer_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
