-- Add cover image support and lesson progress tracking
-- This migration adds support for AI-generated lesson covers and user progress tracking

-- Add cover_image_url column to lessons table
ALTER TABLE lessons ADD COLUMN cover_image_url TEXT;

-- Create user_lesson_progress table to track lesson interactions
CREATE TABLE user_lesson_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  is_opened BOOLEAN DEFAULT FALSE,
  last_opened_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS for user_lesson_progress
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_lesson_progress
CREATE POLICY "Users can view own lesson progress" ON user_lesson_progress 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lesson progress" ON user_lesson_progress 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lesson progress" ON user_lesson_progress 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lesson progress" ON user_lesson_progress 
FOR DELETE USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_lesson_id ON user_lesson_progress(lesson_id);
CREATE INDEX idx_user_lesson_progress_last_opened ON user_lesson_progress(last_opened_at DESC);
CREATE INDEX idx_user_lesson_progress_is_opened ON user_lesson_progress(is_opened);

-- Trigger for updated_at
CREATE TRIGGER update_user_lesson_progress_updated_at BEFORE UPDATE ON user_lesson_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create progress entry when user first accesses a lesson
CREATE OR REPLACE FUNCTION create_lesson_progress_if_not_exists(p_user_id UUID, p_lesson_id UUID)
RETURNS UUID AS $$
DECLARE
  progress_id UUID;
BEGIN
  -- Try to get existing progress
  SELECT id INTO progress_id
  FROM user_lesson_progress
  WHERE user_id = p_user_id AND lesson_id = p_lesson_id;
  
  -- If not exists, create it
  IF progress_id IS NULL THEN
    INSERT INTO user_lesson_progress (user_id, lesson_id, is_opened, last_opened_at)
    VALUES (p_user_id, p_lesson_id, TRUE, NOW())
    RETURNING id INTO progress_id;
  ELSE
    -- Update existing progress
    UPDATE user_lesson_progress
    SET is_opened = TRUE, last_opened_at = NOW()
    WHERE id = progress_id;
  END IF;
  
  RETURN progress_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;