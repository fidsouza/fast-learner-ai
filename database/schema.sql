-- Configuração do banco de dados Supabase para o LingQ MVP

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (linked to auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  learning_language TEXT CHECK (learning_language IN ('english', 'french')) DEFAULT 'english',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Lessons table
CREATE TABLE lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT CHECK (language IN ('english', 'french')) NOT NULL,
  audio_url TEXT,
  audio_sync_data JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Words table (vocabulary/LingQs)
CREATE TABLE words (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  word TEXT NOT NULL,
  language TEXT CHECK (language IN ('english', 'french')) NOT NULL,
  status TEXT CHECK (status IN ('new', 'learning', 'known')) DEFAULT 'new',
  translation TEXT,
  definition TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(word, language, user_id)
);

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Lessons policies
CREATE POLICY "Users can view own lessons" ON lessons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own lessons" ON lessons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lessons" ON lessons FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lessons" ON lessons FOR DELETE USING (auth.uid() = user_id);

-- Words policies
CREATE POLICY "Users can view own words" ON words FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own words" ON words FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own words" ON words FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own words" ON words FOR DELETE USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX idx_lessons_user_id ON lessons(user_id);
CREATE INDEX idx_lessons_language ON lessons(language);
CREATE INDEX idx_words_user_id ON words(user_id);
CREATE INDEX idx_words_language ON words(language);
CREATE INDEX idx_words_status ON words(status);
CREATE INDEX idx_words_lesson_id ON words(lesson_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_words_updated_at BEFORE UPDATE ON words
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-files', 'audio-files', true);

-- Storage policies for audio files
CREATE POLICY "Users can upload audio files" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view audio files" ON storage.objects FOR SELECT USING (
  bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own audio files" ON storage.objects FOR DELETE USING (
  bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]
);