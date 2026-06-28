
-- Restrict column-level UPDATE privileges so non-admins cannot modify admin-only fields.
-- RLS still applies on top of these column privileges.

-- events: admin-only columns
REVOKE UPDATE ON public.events FROM authenticated;
GRANT UPDATE (
  title, type, short_description, full_description, start_at, end_at, time_zone,
  address, city, country, maps_link, format, registration_link, entry_type,
  contact_name, contact_info, visibility, updated_at
) ON public.events TO authenticated;

-- prayer_requests: admin-only columns are prayer_count and status
REVOKE UPDATE ON public.prayer_requests FROM authenticated;
GRANT UPDATE (
  title, content, category, identity_preference, display_name, is_urgent, updated_at
) ON public.prayer_requests TO authenticated;

-- testimonies: admin-only columns are status, approved_at, approved_by
REVOKE UPDATE ON public.testimonies FROM authenticated;
GRANT UPDATE (
  category, situation_before, change_summary, excerpt, happened_at,
  identity_preference, display_name, consent_public, updated_at
) ON public.testimonies TO authenticated;
