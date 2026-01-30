-- Events module core tables
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'Convention',
      'Special Retreat',
      'Revival Meeting',
      'Marriage Ceremony',
      'Conference',
      'Youth Program',
      'Prayer Summit',
      'Other'
    )
  ),
  short_description TEXT NOT NULL CHECK (char_length(short_description) <= 300),
  full_description TEXT,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  time_zone TEXT NOT NULL,
  location_address TEXT NOT NULL,
  location_city TEXT NOT NULL,
  location_country TEXT NOT NULL,
  location_google_maps_url TEXT,
  event_format TEXT NOT NULL CHECK (event_format IN ('PHYSICAL', 'ONLINE', 'HYBRID')),
  registration_link TEXT,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('FREE', 'PAID')),
  contact_name TEXT,
  contact_contact TEXT,
  visibility TEXT NOT NULL CHECK (visibility IN ('PUBLIC', 'GROUP', 'REGION')),
  visibility_group_id UUID,
  visibility_city TEXT,
  visibility_country TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  discussion_locked BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID,
  registration_status TEXT NOT NULL DEFAULT 'REGISTERED' CHECK (registration_status IN ('REGISTERED', 'CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.event_engagements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID,
  engagement_type TEXT NOT NULL CHECK (engagement_type IN ('INTERESTED', 'GOING')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE TABLE public.event_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID,
  body TEXT NOT NULL CHECK (char_length(body) <= 180),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.event_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID,
  notification_type TEXT NOT NULL,
  message TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_starts_at ON public.events(starts_at);
CREATE INDEX idx_events_location_country ON public.events(location_country);
CREATE INDEX idx_events_location_city ON public.events(location_city);
CREATE INDEX idx_events_event_type ON public.events(event_type);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX idx_event_engagements_event_id ON public.event_engagements(event_id);
CREATE INDEX idx_event_comments_event_id ON public.event_comments(event_id);
CREATE INDEX idx_event_notifications_event_id ON public.event_notifications(event_id);

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_comments_updated_at
BEFORE UPDATE ON public.event_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
