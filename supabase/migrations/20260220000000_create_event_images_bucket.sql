-- Create a storage bucket for event images
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own event images
CREATE POLICY "Users can upload their event images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own event images
CREATE POLICY "Users can view their event images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'event-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own event images
CREATE POLICY "Users can update their event images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'event-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own event images
CREATE POLICY "Users can delete their event images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access for event images
CREATE POLICY "Event images are viewable by everyone"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'event-images');
