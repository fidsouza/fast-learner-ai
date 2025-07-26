import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest, CreateLessonRequest } from '../types';
import { AIService, GenerateTextRequest } from '../services/aiService';
import { imageGenerationService } from '../services/imageGenerationService';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to get authenticated Supabase client
const getAuthenticatedSupabaseClient = (req: AuthRequest) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
};

router.use(authenticateToken);


router.get('/', async (req: AuthRequest, res) => {
  try {
    const { status } = req.query; // 'new', 'opened', or undefined for all
    const authenticatedClient = getAuthenticatedSupabaseClient(req);
    
    // Get lessons with progress information
    const { data: lessonsWithProgress, error } = await authenticatedClient
      .from('lessons')
      .select(`
        *,
        user_lesson_progress!left (
          is_opened,
          last_opened_at,
          progress_percentage
        )
      `)
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get lessons error:', error);
      return res.status(400).json({ error: error.message });
    }

    // Transform the data to include progress info directly
    let lessons = lessonsWithProgress?.map(lesson => ({
      ...lesson,
      is_opened: lesson.user_lesson_progress?.[0]?.is_opened || false,
      last_opened_at: lesson.user_lesson_progress?.[0]?.last_opened_at || null,
      progress_percentage: lesson.user_lesson_progress?.[0]?.progress_percentage || 0,
      user_lesson_progress: undefined // Remove the nested object
    })) || [];

    // Filter by status if specified
    if (status === 'new') {
      lessons = lessons.filter(lesson => !lesson.is_opened);
    } else if (status === 'opened') {
      lessons = lessons.filter(lesson => lesson.is_opened);
      // Sort opened lessons by last_opened_at (most recent first)
      lessons.sort((a, b) => {
        if (!a.last_opened_at) return 1;
        if (!b.last_opened_at) return -1;
        return new Date(b.last_opened_at).getTime() - new Date(a.last_opened_at).getTime();
      });
    }

    return res.json({ lessons });
  } catch (error) {
    console.error('Get lessons error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const authenticatedClient = getAuthenticatedSupabaseClient(req);
    const { data: lesson, error } = await authenticatedClient
      .from('lessons')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Mark lesson as opened (create or update progress)
    try {
      await authenticatedClient.rpc('create_lesson_progress_if_not_exists', {
        p_user_id: req.user!.id,
        p_lesson_id: id
      });
    } catch (progressError) {
      console.error('Error updating lesson progress:', progressError);
      // Don't fail the request if progress update fails
    }

    return res.json({ lesson });
  } catch (error) {
    console.error('Get lesson error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', upload.single('audio_file'), async (req: AuthRequest, res) => {
  try {
    const { title, content, language }: CreateLessonRequest = req.body;
    const audioFile = req.file;

    let audioUrl: string | undefined;

    if (audioFile) {
      const fileName = `${req.user!.id}/${uuidv4()}.${audioFile.originalname.split('.').pop()}`;
      const authenticatedClientUpload = getAuthenticatedSupabaseClient(req);
      const { error: uploadError } = await authenticatedClientUpload.storage
        .from('audio-files')
        .upload(fileName, audioFile.buffer, {
          contentType: audioFile.mimetype,
        });

      if (uploadError) {
        console.error('Audio upload error:', uploadError);
      } else {
        const { data: publicUrlData } = authenticatedClientUpload.storage
          .from('audio-files')
          .getPublicUrl(fileName);
        audioUrl = publicUrlData.publicUrl;
      }
    }

    // Generate cover image for manually created lessons too
    let coverImageUrl: string | null = null;
    if (imageGenerationService) {
      try {
        const imageResult = await imageGenerationService.generateLessonCover({
          title,
          language,
          content
        });
        coverImageUrl = imageResult.storedUrl;
      } catch (imageError) {
        console.error('Cover image generation failed for manual lesson:', {
          title,
          language,
          error: imageError instanceof Error ? imageError.message : imageError,
          stack: imageError instanceof Error ? imageError.stack : undefined
        });
        // Continue without cover image - don't fail the entire lesson creation
      }
    }

    const authenticatedClientForInsert = getAuthenticatedSupabaseClient(req);
    const { data: lesson, error } = await authenticatedClientForInsert
      .from('lessons')
      .insert({
        title,
        content,
        language,
        audio_url: audioUrl,
        cover_image_url: coverImageUrl,
        user_id: req.user!.id,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ lesson });
  } catch (error) {
    console.error('Create lesson error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/sync', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { audio_sync_data } = req.body;

    const authenticatedClient = getAuthenticatedSupabaseClient(req);
    const { data: lesson, error } = await authenticatedClient
      .from('lessons')
      .update({ audio_sync_data })
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ lesson });
  } catch (error) {
    console.error('Update lesson sync error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const authenticatedClient = getAuthenticatedSupabaseClient(req);
    const { error } = await authenticatedClient
      .from('lessons')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user!.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// AI-powered lesson generation endpoints
router.post('/ai/generate-text', async (req: AuthRequest, res) => {
  try {
    const { language, topic, level }: GenerateTextRequest = req.body;
    const userApiKey = req.headers['x-openai-api-key'] as string;

    if (!language || !['english', 'french'].includes(language)) {
      return res.status(400).json({ error: 'Valid language (english or french) is required' });
    }

    const result = await AIService.generateText({ language, topic, level, userApiKey });
    
    return res.json(result);
  } catch (error) {
    console.error('AI text generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate text with AI';
    return res.status(500).json({ error: errorMessage });
  }
});

router.post('/ai/generate-lesson', async (req: AuthRequest, res) => {
  try {
    const { language, topic, level, title }: GenerateTextRequest & { title?: string } = req.body;
    const userApiKey = req.headers['x-openai-api-key'] as string;

    if (!language || !['english', 'french'].includes(language)) {
      return res.status(400).json({ error: 'Valid language (english or french) is required' });
    }

    // Validate level parameter
    const validLevels = ['beginner', 'intermediate', 'advanced'];
    const difficultyLevel = level && validLevels.includes(level) ? level : 'beginner';

    // Generate text content
    const textResult = await AIService.generateText({ language, topic, level: difficultyLevel, userApiKey });
    
    // Generate audio from the text
    const audioBuffer = await AIService.generateAudio(textResult.text, language, userApiKey);
    
    // Upload audio to Supabase Storage (organized by user)
    const fileName = `${req.user!.id}/ai-generated-${uuidv4()}.mp3`;
    const storageClient = getAuthenticatedSupabaseClient(req);
    const { error: uploadError } = await storageClient.storage
      .from('audio-files')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
      });

    if (uploadError) {
      console.error('Audio upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload generated audio' });
    }

    const { data: publicUrlData } = storageClient.storage
      .from('audio-files')
      .getPublicUrl(fileName);

    const generatedTitle = title || `AI Generated - ${topic || 'General'} (${difficultyLevel})`;
    
    // Generate cover image for the lesson (async, non-blocking)
    let coverImageUrl: string | null = null;
    if (imageGenerationService) {
      try {
        const imageResult = await imageGenerationService.generateLessonCover({
          title: generatedTitle,
          language,
          content: textResult.text,
          topic: textResult.topic
        });
        coverImageUrl = imageResult.storedUrl;
      } catch (imageError) {
        console.error('Cover image generation failed for AI lesson:', {
          title: generatedTitle,
          language,
          topic: textResult.topic,
          error: imageError instanceof Error ? imageError.message : imageError,
          stack: imageError instanceof Error ? imageError.stack : undefined
        });
        // Continue without cover image - don't fail the entire lesson creation
      }
    }
    
    // Save lesson to database
    const authenticatedClient = getAuthenticatedSupabaseClient(req);
    const { data: lesson, error: lessonError } = await authenticatedClient
      .from('lessons')
      .insert({
        title: generatedTitle,
        content: textResult.text,
        language,
        audio_url: publicUrlData.publicUrl,
        cover_image_url: coverImageUrl,
        difficulty_level: difficultyLevel,
        user_id: req.user!.id,
        ai_generated: true,
        ai_topic: textResult.topic,
        ai_level: textResult.level, // Keep for backward compatibility
        ai_model: 'openai-gpt-4',
      })
      .select()
      .single();

    if (lessonError) {
      return res.status(400).json({ error: lessonError.message });
    }

    return res.status(201).json({ 
      lesson,
      generationData: {
        topic: textResult.topic,
        level: difficultyLevel
      }
    });
  } catch (error) {
    console.error('AI lesson generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate lesson with AI';
    return res.status(500).json({ error: errorMessage });
  }
});

router.post('/ai/generate-audio', async (req: AuthRequest, res) => {
  try {
    const { text, language } = req.body;
    const userApiKey = req.headers['x-openai-api-key'] as string;

    if (!text || !language || !['english', 'french'].includes(language)) {
      return res.status(400).json({ error: 'Text and valid language (english or french) are required' });
    }

    const audioBuffer = await AIService.generateAudio(text, language, userApiKey);
    
    // Upload audio to Supabase Storage (organized by user)
    const fileName = `${req.user!.id}/ai-generated-${uuidv4()}.mp3`;
    const audioStorageClient = getAuthenticatedSupabaseClient(req);
    const { error: uploadError } = await audioStorageClient.storage
      .from('audio-files')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
      });

    if (uploadError) {
      console.error('Audio upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload generated audio' });
    }

    const { data: publicUrlData } = audioStorageClient.storage
      .from('audio-files')
      .getPublicUrl(fileName);

    return res.json({ 
      audioUrl: publicUrlData.publicUrl,
      fileName 
    });
  } catch (error) {
    console.error('AI audio generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate audio with AI';
    return res.status(500).json({ error: errorMessage });
  }
});

export { router as lessonRoutes };