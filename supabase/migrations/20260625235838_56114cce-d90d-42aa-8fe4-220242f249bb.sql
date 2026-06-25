
DROP POLICY IF EXISTS "Users can update their own pending events" ON public.events;
CREATE POLICY "Users can update their own pending events" ON public.events
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status = 'PENDING')
  WITH CHECK (auth.uid() = user_id AND status = 'PENDING');

DROP POLICY IF EXISTS "Users can update their own pending prayer requests" ON public.prayer_requests;
CREATE POLICY "Users can update their own pending prayer requests" ON public.prayer_requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

DROP POLICY IF EXISTS "Users can update their own pending testimonies" ON public.testimonies;
CREATE POLICY "Users can update their own pending testimonies" ON public.testimonies
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending' AND approved_at IS NULL AND approved_by IS NULL);
