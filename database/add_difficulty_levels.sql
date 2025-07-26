-- Add difficulty level support to lessons
-- This migration adds support for difficulty levels in AI-generated lessons

-- Add difficulty_level column to lessons table
DO $$ 
BEGIN
    -- Check if column doesn't exist before adding it
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='lessons' AND column_name='difficulty_level'
    ) THEN
        ALTER TABLE lessons ADD COLUMN difficulty_level VARCHAR(20) DEFAULT 'beginner';
    END IF;
END $$;

-- Create an index for better performance when filtering by difficulty level
CREATE INDEX IF NOT EXISTS idx_lessons_difficulty_level ON lessons(difficulty_level);

-- Update existing AI-generated lessons to have 'beginner' as default level
-- (only update if they don't already have a difficulty level set)
UPDATE lessons 
SET difficulty_level = 'beginner' 
WHERE ai_generated = true AND difficulty_level IS NULL;

-- Add a comment to the column for documentation
COMMENT ON COLUMN lessons.difficulty_level IS 'Difficulty level for the lesson: beginner, intermediate, or advanced';