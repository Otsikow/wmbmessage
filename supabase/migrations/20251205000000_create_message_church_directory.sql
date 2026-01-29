-- Create enums for message church directory
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_church_status') THEN
    CREATE TYPE public.message_church_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_church_submission_status') THEN
    CREATE TYPE public.message_church_submission_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVIEW');
  END IF;
END $$;

-- Create message churches table
CREATE TABLE IF NOT EXISTS public.message_churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_name TEXT NOT NULL,
  message_affiliation TEXT NOT NULL DEFAULT 'Message of the Hour',
  pastor_or_contact_name TEXT NOT NULL,
  pastor_title TEXT,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state_region TEXT,
  postal_code TEXT,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  whatsapp_number TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  services_schedule_text TEXT,
  notes_public TEXT,
  status public.message_church_status NOT NULL DEFAULT 'DRAFT',
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by_admin_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT message_church_affiliation_check CHECK (message_affiliation = 'Message of the Hour'),
  CONSTRAINT message_church_whatsapp_format CHECK (whatsapp_number ~ '^\\+[1-9]\\d{6,14}$'),
  CONSTRAINT message_church_email_format CHECK (contact_email IS NULL OR contact_email ~* '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'),
  CONSTRAINT message_church_phone_format CHECK (contact_phone IS NULL OR contact_phone ~ '^\\+[1-9]\\d{6,14}$')
);

-- Create message church submissions table
CREATE TABLE IF NOT EXISTS public.message_church_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_church_payload JSONB NOT NULL,
  submitter_name TEXT,
  submitter_email TEXT,
  submitter_whatsapp TEXT,
  affirmation_checkbox BOOLEAN NOT NULL,
  status public.message_church_submission_status NOT NULL DEFAULT 'PENDING',
  admin_notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT submission_affirmation_required CHECK (affirmation_checkbox = true),
  CONSTRAINT submission_email_format CHECK (submitter_email IS NULL OR submitter_email ~* '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'),
  CONSTRAINT submission_whatsapp_format CHECK (submitter_whatsapp IS NULL OR submitter_whatsapp ~ '^\\+[1-9]\\d{6,14}$'),
  CONSTRAINT submission_payload_whatsapp_required CHECK ((submitted_church_payload ? 'whatsapp_number') AND (submitted_church_payload->>'whatsapp_number') ~ '^\\+[1-9]\\d{6,14}$'),
  CONSTRAINT submission_payload_message_affiliation CHECK ((submitted_church_payload->>'message_affiliation') = 'Message of the Hour'),
  CONSTRAINT submission_payload_church_name CHECK (length(coalesce(submitted_church_payload->>'church_name', '')) > 0),
  CONSTRAINT submission_payload_pastor_name CHECK (length(coalesce(submitted_church_payload->>'pastor_or_contact_name', '')) > 0),
  CONSTRAINT submission_payload_address CHECK (length(coalesce(submitted_church_payload->>'address_line_1', '')) > 0),
  CONSTRAINT submission_payload_city CHECK (length(coalesce(submitted_church_payload->>'city', '')) > 0),
  CONSTRAINT submission_payload_country CHECK (length(coalesce(submitted_church_payload->>'country_code', '')) > 0 AND length(coalesce(submitted_church_payload->>'country_name', '')) > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_message_churches_name ON public.message_churches (church_name);
CREATE INDEX IF NOT EXISTS idx_message_churches_city ON public.message_churches (city);
CREATE INDEX IF NOT EXISTS idx_message_churches_country ON public.message_churches (country_code, country_name);
CREATE INDEX IF NOT EXISTS idx_message_churches_pastor ON public.message_churches (pastor_or_contact_name);
CREATE INDEX IF NOT EXISTS idx_message_churches_whatsapp ON public.message_churches (whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_message_churches_status_verified ON public.message_churches (status, verified);
CREATE INDEX IF NOT EXISTS idx_message_church_submissions_status ON public.message_church_submissions (status);
CREATE INDEX IF NOT EXISTS idx_message_church_submissions_payload_whatsapp ON public.message_church_submissions ((submitted_church_payload->>'whatsapp_number'));

-- Enable Row Level Security
ALTER TABLE public.message_churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_church_submissions ENABLE ROW LEVEL SECURITY;

-- Public access to verified, published churches
CREATE POLICY "Public can view verified message churches"
  ON public.message_churches FOR SELECT
  TO public
  USING (verified = true AND status = 'PUBLISHED');

-- Admin policies for message churches
CREATE POLICY "Admins can manage message churches"
  ON public.message_churches FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public submission policy
CREATE POLICY "Public can submit message churches"
  ON public.message_church_submissions FOR INSERT
  TO public
  WITH CHECK (affirmation_checkbox = true);

-- Admin policies for submissions
CREATE POLICY "Admins can view message church submissions"
  ON public.message_church_submissions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update message church submissions"
  ON public.message_church_submissions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_message_churches_updated_at
BEFORE UPDATE ON public.message_churches
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_message_church_submissions_updated_at
BEFORE UPDATE ON public.message_church_submissions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
