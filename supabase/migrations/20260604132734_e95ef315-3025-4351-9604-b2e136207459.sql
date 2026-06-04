
-- Events: restrict insert
DROP POLICY IF EXISTS "Anyone can submit an event" ON public.events;
CREATE POLICY "Anyone can submit an event"
ON public.events FOR INSERT
WITH CHECK (
  status = 'PENDING'
  AND (user_id IS NULL OR user_id = auth.uid())
);

-- Testimonies: restrict insert
DROP POLICY IF EXISTS "Anyone can submit a testimony" ON public.testimonies;
CREATE POLICY "Anyone can submit a testimony"
ON public.testimonies FOR INSERT
WITH CHECK (
  status = 'pending'
  AND approved_at IS NULL
  AND approved_by IS NULL
  AND (user_id IS NULL OR user_id = auth.uid())
);

-- Message church submissions: restrict insert
DROP POLICY IF EXISTS "Anyone can submit a church" ON public.message_church_submissions;
CREATE POLICY "Anyone can submit a church"
ON public.message_church_submissions FOR INSERT
WITH CHECK (
  status = 'PENDING'
  AND admin_notes IS NULL
  AND (submitter_user_id IS NULL OR submitter_user_id = auth.uid())
);

-- user_roles: explicit restrictive policies to block non-admin writes
CREATE POLICY "Only admins can insert roles"
ON public.user_roles AS RESTRICTIVE FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles AS RESTRICTIVE FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles AS RESTRICTIVE FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Revoke public EXECUTE on SECURITY DEFINER functions; they are only needed inside RLS/triggers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
