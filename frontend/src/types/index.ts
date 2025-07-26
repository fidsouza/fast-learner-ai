export interface User {
  id: string;
  email: string;
  name: string;
  learning_language: 'english' | 'french';
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Lesson {
  id: string;
  title: string;
  content: string;
  language: 'english' | 'french';
  audio_url?: string;
  audio_sync_data?: AudioSyncData[];
  cover_image_url?: string;
  difficulty_level?: DifficultyLevel;
  user_id: string;
  created_at: string;
  updated_at: string;
  // AI generation metadata
  ai_generated?: boolean;
  ai_topic?: string;
  ai_level?: string; // Deprecated: use difficulty_level instead
  ai_model?: string;
  // Progress tracking
  is_opened?: boolean;
  last_opened_at?: string;
  progress_percentage?: number;
}

export interface AudioSyncData {
  word: string;
  start_time: number;
  end_time: number;
  word_index: number;
}

export interface Word {
  id: string;
  text_content: string;
  word?: string; // Backward compatibility - alias for text_content
  language: 'english' | 'french';
  status: 'new' | 'learning' | 'known';
  item_type?: 'word' | 'sentence'; // Optional for backward compatibility
  translation?: string;
  definition?: string;
  user_id: string;
  lesson_id: string;
  start_char_index?: number;
  end_char_index?: number;
  created_at: string;
  updated_at: string;
}

export interface VocabularyStats {
  total: number;
  new: number;
  learning: number;
  known: number;
}

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  learning_language?: 'english' | 'french';
}

export interface CreateLessonData {
  title: string;
  content: string;
  language: 'english' | 'french';
  audio_file?: File;
}