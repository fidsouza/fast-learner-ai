import axios from 'axios';
import { CreateLessonData, Lesson, Word, VocabularyStats, DifficultyLevel } from '../types';
import { supabase } from './supabase';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';


const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  // Add OpenAI API key for AI-related requests
  const isAIRequest = config.url?.includes('/ai/') || 
                     config.url?.includes('/translate') ||
                     config.url?.includes('/vocabulary/translate');
  
  if (isAIRequest) {
    const userApiKey = sessionStorage.getItem('openai-api-key');
    if (userApiKey) {
      config.headers['X-OpenAI-API-Key'] = userApiKey;
    }
  }
  
  return config;
});


export const lessonsAPI = {
  getAll: async (): Promise<{ lessons: Lesson[] }> => {
    const response = await api.get('/lessons');
    return response.data;
  },

  getByStatus: async (status: 'new' | 'opened'): Promise<{ lessons: Lesson[] }> => {
    const response = await api.get('/lessons', { params: { status } });
    return response.data;
  },

  getById: async (id: string): Promise<{ lesson: Lesson }> => {
    const response = await api.get(`/lessons/${id}`);
    return response.data;
  },

  create: async (data: CreateLessonData): Promise<{ lesson: Lesson }> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('language', data.language);
    
    if (data.audio_file) {
      formData.append('audio_file', data.audio_file);
    }

    const response = await api.post('/lessons', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateSync: async (id: string, syncData: any) => {
    const response = await api.put(`/lessons/${id}/sync`, { audio_sync_data: syncData });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/lessons/${id}`);
    return response.data;
  },

};

export const vocabularyAPI = {
  getAll: async (params?: { status?: string; language?: string }): Promise<{ words: Word[] }> => {
    const response = await api.get('/vocabulary', { params });
    return response.data;
  },

  getKnown: async (language?: string): Promise<{ words: Array<{ text_content: string; translation: string; item_type: 'word' | 'sentence' }> }> => {
    const response = await api.get('/vocabulary/known', { params: { language } });
    return response.data;
  },

  create: async (data: Partial<Word>): Promise<{ word: Word }> => {
    const response = await api.post('/vocabulary', data);
    return response.data;
  },

  updateStatus: async (id: string, status: 'new' | 'learning' | 'known'): Promise<{ word: Word }> => {
    const response = await api.put(`/vocabulary/${id}/status`, { status });
    return response.data;
  },

  update: async (id: string, data: Partial<Word>): Promise<{ word: Word }> => {
    const response = await api.put(`/vocabulary/${id}`, data);
    return response.data;
  },

  getStats: async (): Promise<{ stats: VocabularyStats }> => {
    const response = await api.get('/vocabulary/stats');
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/vocabulary/${id}`);
    return response.data;
  },

  translate: async (text: string, sourceLanguage: 'english' | 'french'): Promise<{ 
    translation: string; 
    originalText: string; 
    sourceLanguage: string; 
    targetLanguage: string; 
  }> => {
    const response = await api.post('/vocabulary/translate', { text, sourceLanguage });
    return response.data;
  },
};

export interface AIGenerateTextRequest {
  language: 'english' | 'french';
  topic?: string;
  level?: DifficultyLevel;
}

export interface AIGenerateTextResponse {
  text: string;
  language: string;
  topic?: string;
  level?: string;
}

export interface AIGenerateLessonRequest extends AIGenerateTextRequest {
  title?: string;
}

export interface AIGenerateLessonResponse {
  lesson: Lesson;
  generationData: {
    topic?: string;
    level?: string;
  };
}

export const aiAPI = {
  generateText: async (data: AIGenerateTextRequest): Promise<AIGenerateTextResponse> => {
    const response = await api.post('/lessons/ai/generate-text', data);
    return response.data;
  },

  generateLesson: async (data: AIGenerateLessonRequest): Promise<AIGenerateLessonResponse> => {
    const response = await api.post('/lessons/ai/generate-lesson', data);
    return response.data;
  },

  generateAudio: async (text: string, language: 'english' | 'french'): Promise<{ audioUrl: string; fileName: string }> => {
    const response = await api.post('/lessons/ai/generate-audio', { text, language });
    return response.data;
  },
};