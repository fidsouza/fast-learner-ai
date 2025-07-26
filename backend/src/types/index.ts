export interface User {
  id: string;
  email: string;
  name: string;
  learning_language: 'english' | 'french';
  created_at: string;
  updated_at: string;
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Lesson {
  id: string;
  title: string;
  content: string;
  language: 'english' | 'french';
  audio_url?: string;
  audio_sync_data?: AudioSyncData[];
  difficulty_level?: DifficultyLevel;
  user_id: string;
  created_at: string;
  updated_at: string;
  // AI generation metadata
  ai_generated?: boolean;
  ai_topic?: string;
  ai_level?: string; // Deprecated: use difficulty_level instead
  ai_model?: string;
  cover_image_url?: string;
}

export interface AudioSyncData {
  word: string;
  start_time: number;
  end_time: number;
  word_index: number;
}

export interface Word {
  id: string;
  word: string;
  language: 'english' | 'french';
  status: 'new' | 'learning' | 'known';
  translation?: string;
  definition?: string;
  user_id: string;
  lesson_id: string;
  created_at: string;
  updated_at: string;
}

import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: User;
}

export interface CreateLessonRequest {
  title: string;
  content: string;
  language: 'english' | 'french';
  audio_file?: Express.Multer.File;
}

export interface UpdateWordStatusRequest {
  status: 'new' | 'learning' | 'known';
}