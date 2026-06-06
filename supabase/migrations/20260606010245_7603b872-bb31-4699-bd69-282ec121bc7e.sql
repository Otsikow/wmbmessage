-- Tighten prayer_requests INSERT policy
DROP POLICY IF EXISTS "Anyone can submit prayer requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users can create prayer requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Public can insert prayer requests" ON public.prayer_requests;

CREATE POLICY "Submit prayer requests with pending status"
ON public.prayer_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND (user_id IS NULL OR user_id = auth.uid())
);

-- Restore EXECUTE on has_role to anon/authenticated so RLS policies referencing it
-- via PostgREST work (previous revoke was too aggressive and broke the Data API).
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;