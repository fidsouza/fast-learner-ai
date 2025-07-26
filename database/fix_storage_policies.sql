-- Fix storage policies for audio files upload
-- Run this in your Supabase SQL editor

-- First, drop existing policies
DROP POLICY IF EXISTS "Users can upload audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own audio files" ON storage.objects;

-- Create new, more permissive policies for authenticated users
CREATE POLICY "Authenticated users can upload audio files" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'audio-files' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can view audio files" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'audio-files' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete own audio files" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'audio-files' 
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Also ensure the bucket exists and is public for reading
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio-files', 'audio-files', true) 
ON CONFLICT (id) DO UPDATE SET public = true;