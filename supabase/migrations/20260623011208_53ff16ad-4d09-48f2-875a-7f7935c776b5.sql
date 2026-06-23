
-- Convert has_role to SECURITY INVOKER so it is no longer flagged as a privileged definer function.
-- The existing "Users can view their own roles" policy on public.user_roles allows the caller to
-- read their own role rows, which is the only lookup pattern used by RLS (has_role(auth.uid(), ...)).
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

-- Trigger-only functions: should never be invoked directly via the Data API. Revoke EXECUTE
-- from PostgREST roles so the security-definer linter no longer flags them as publicly callable.
-- Triggers continue to run because triggers execute as the table owner regardless of grants.
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.message_study_notes_tsv_trigger() FROM PUBLIC, anon, authenticated;

-- Drop the overly permissive prayer_requests INSERT policy (WITH CHECK true) so the strict
-- moderated policy is the sole rule: status must be 'pending' and rows must be owner-scoped.
DROP POLICY IF EXISTS "Anyone can submit a prayer request" ON public.prayer_requests;
