-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create message_churches table for the directory
CREATE TABLE public.message_churches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_name TEXT NOT NULL,
  message_affiliation TEXT NOT NULL DEFAULT 'message_of_the_hour',
  pastor_or_contact_name TEXT NOT NULL,
  pastor_title TEXT,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state_region TEXT,
  postal_code TEXT,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  email TEXT,
  website TEXT,
  service_times TEXT,
  description TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_by_admin_id UUID,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PUBLISHED', 'REJECTED', 'ARCHIVED')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create message_church_submissions table for new church submissions
CREATE TABLE public.message_church_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submitted_church_payload JSONB NOT NULL,
  affirmation_checkbox BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  submitter_user_id UUID,
  submitter_email TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.message_churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_church_submissions ENABLE ROW LEVEL SECURITY;

-- Message churches - anyone can view published churches
CREATE POLICY "Anyone can view published churches"
ON public.message_churches
FOR SELECT
USING (status = 'PUBLISHED');

-- Admins can do everything on message_churches
CREATE POLICY "Admins can manage all churches"
ON public.message_churches
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Message church submissions - anyone can submit
CREATE POLICY "Anyone can submit a church"
ON public.message_church_submissions
FOR INSERT
WITH CHECK (true);

-- Users can view their own submissions
CREATE POLICY "Users can view their own submissions"
ON public.message_church_submissions
FOR SELECT
USING (submitter_user_id = auth.uid());

-- Admins can manage all submissions
CREATE POLICY "Admins can manage all submissions"
ON public.message_church_submissions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create indexes for better query performance
CREATE INDEX idx_message_churches_status ON public.message_churches(status);
CREATE INDEX idx_message_churches_verified ON public.message_churches(verified);
CREATE INDEX idx_message_churches_country ON public.message_churches(country_code);
CREATE INDEX idx_message_church_submissions_status ON public.message_church_submissions(status);

-- Create trigger for automatic timestamp updates on message_churches
CREATE TRIGGER update_message_churches_updated_at
BEFORE UPDATE ON public.message_churches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on message_church_submissions
CREATE TRIGGER update_message_church_submissions_updated_at
BEFORE UPDATE ON public.message_church_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();