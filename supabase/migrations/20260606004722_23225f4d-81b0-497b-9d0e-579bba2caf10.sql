GRANT SELECT ON public.message_churches TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.message_churches TO authenticated;
GRANT ALL ON public.message_churches TO service_role;