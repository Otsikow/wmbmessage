-- Add DELETE policy for profiles table
-- This allows users to delete their own profile data, supporting GDPR compliance

CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);