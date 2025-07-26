-- Extension to the lessons table for AI-generated content metadata
-- Run this after the main schema.sql

-- Add optional metadata columns for AI-generated lessons
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS ai_topic TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS ai_level TEXT CHECK (ai_level IN ('beginner', 'intermediate', 'advanced'));
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS ai_model TEXT; -- e.g., 'openai-gpt-3.5-turbo', 'google-gemini-pro'

-- Update existing manual lessons to mark them as not AI-generated
UPDATE lessons SET ai_generated = FALSE WHERE ai_generated IS NULL;

-- Add index for AI-generated lessons filtering
CREATE INDEX IF NOT EXISTS idx_lessons_ai_generated ON lessons(ai_generated);
CREATE INDEX IF NOT EXISTS idx_lessons_ai_topic ON lessons(ai_topic);
CREATE INDEX IF NOT EXISTS idx_lessons_ai_level ON lessons(ai_level);