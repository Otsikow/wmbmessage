-- Create testimonies table for storing user testimonies
CREATE TABLE public.testimonies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  situation_before TEXT NOT NULL,
  change_summary TEXT NOT NULL,
  excerpt TEXT,
  happened_at DATE NOT NULL,
  identity_preference TEXT NOT NULL DEFAULT 'full_name',
  display_name TEXT,
  consent_public BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table for storing user-submitted events
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  time_zone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  maps_link TEXT,
  format TEXT NOT NULL,
  registration_link TEXT,
  entry_type TEXT NOT NULL,
  contact_name TEXT,
  contact_info TEXT,
  visibility TEXT NOT NULL DEFAULT 'Public',
  region_city TEXT,
  region_country TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  discussion_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prayer_requests table for storing user prayer requests
CREATE TABLE public.prayer_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  identity_preference TEXT NOT NULL DEFAULT 'full_name',
  display_name TEXT,
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  prayer_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

-- Testimonies RLS policies
CREATE POLICY "Anyone can view approved testimonies" ON public.testimonies
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view their own testimonies" ON public.testimonies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can submit a testimony" ON public.testimonies
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own pending testimonies" ON public.testimonies
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can manage all testimonies" ON public.testimonies
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Events RLS policies
CREATE POLICY "Anyone can view approved events" ON public.events
  FOR SELECT USING (status = 'APPROVED');

CREATE POLICY "Users can view their own events" ON public.events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can submit an event" ON public.events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own pending events" ON public.events
  FOR UPDATE USING (auth.uid() = user_id AND status = 'PENDING');

CREATE POLICY "Users can delete their own pending events" ON public.events
  FOR DELETE USING (auth.uid() = user_id AND status = 'PENDING');

CREATE POLICY "Admins can manage all events" ON public.events
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Prayer requests RLS policies
CREATE POLICY "Anyone can view approved prayer requests" ON public.prayer_requests
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view their own prayer requests" ON public.prayer_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can submit a prayer request" ON public.prayer_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own pending prayer requests" ON public.prayer_requests
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can manage all prayer requests" ON public.prayer_requests
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_testimonies_updated_at
  BEFORE UPDATE ON public.testimonies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_prayer_requests_updated_at
  BEFORE UPDATE ON public.prayer_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();