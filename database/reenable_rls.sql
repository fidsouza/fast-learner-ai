-- Re-enable RLS and ensure all policies are correct
-- Run this in your Supabase SQL editor

-- Re-enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- Ensure lessons policies are correct (recreate if needed)
DROP POLICY IF EXISTS "Users can view own lessons" ON lessons;
DROP POLICY IF EXISTS "Users can create own lessons" ON lessons;
DROP POLICY IF EXISTS "Users can update own lessons" ON lessons;
DROP POLICY IF EXISTS "Users can delete own lessons" ON lessons;

CREATE POLICY "Users can view own lessons" ON lessons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own lessons" ON lessons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lessons" ON lessons FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lessons" ON lessons FOR DELETE USING (auth.uid() = user_id);