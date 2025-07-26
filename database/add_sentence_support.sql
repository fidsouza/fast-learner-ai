-- Add support for sentences in vocabulary
-- This migration modifies the words table to support both words and sentences

-- Add new columns to support sentences
ALTER TABLE words ADD COLUMN item_type TEXT CHECK (item_type IN ('word', 'sentence')) DEFAULT 'word';
ALTER TABLE words ADD COLUMN start_char_index INTEGER;
ALTER TABLE words ADD COLUMN end_char_index INTEGER;

-- Rename word column to text_content to be more generic
ALTER TABLE words RENAME COLUMN word TO text_content;

-- Update existing records to have item_type = 'word'
UPDATE words SET item_type = 'word' WHERE item_type IS NULL;

-- Make item_type NOT NULL after setting default values
ALTER TABLE words ALTER COLUMN item_type SET NOT NULL;

-- Update the unique constraint to include item_type
ALTER TABLE words DROP CONSTRAINT words_word_language_user_id_key;
ALTER TABLE words ADD CONSTRAINT words_text_content_language_user_id_item_type_key 
  UNIQUE(text_content, language, user_id, item_type);

-- Add index for better performance on item_type
CREATE INDEX idx_words_item_type ON words(item_type);

-- Add index for character position queries (for context retrieval)
CREATE INDEX idx_words_char_positions ON words(lesson_id, start_char_index, end_char_index) 
  WHERE lesson_id IS NOT NULL AND start_char_index IS NOT NULL AND end_char_index IS NOT NULL;