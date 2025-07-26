import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest, UpdateWordStatusRequest } from '../types';
import { translationService, TranslationRequest } from '../services/translationService';

const router = Router();

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
    const { status, language } = req.query;
    
    const authenticatedClient = getAuthenticatedSupabaseClient(req);
    let query = authenticatedClient
      .from('words')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (language) {
      query = query.eq('language', language);
    }

    const { data: words, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ words });
  } catch (error) {
    console.error('Get vocabulary error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get known vocabulary for highlighting
router.get('/known', async (req: AuthRequest, res) => {
  try {
    const { language } = req.query;
    
    const authenticatedClient = getAuthenticatedSupabaseClient(req);
    let query = authenticatedClient
      .from('words')
      .select('text_content, translation, item_type')
      .eq('user_id', req.user!.id)
      .in('status', ['learning', 'known']);

    if (language) {
      query = query.eq('language', language);
    }

    const { data: words, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ words });
  } catch (error) {
    console.error('Get known vocabulary error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { 
      text_content, 
      word, // backward compatibility 
      language, 
      lesson_id, 
      translation, 
      definition, 
      item_type = 'word',
      start_char_index,
      end_char_index,
      status = 'new'
    } = req.body;

    // Support both old 'word' field and new 'text_content' field
    const content = text_content || word;
    if (!content) {
      return res.status(400).json({ error: 'text_content or word is required' });
    }

    const authenticatedClient = getAuthenticatedSupabaseClient(req);
    
    // Check for existing item with same content, language, user, and type
    const { data: existingWord } = await authenticatedClient
      .from('words')
      .select('id')
      .eq('text_content', item_type === 'word' ? content.toLowerCase() : content)
      .eq('language', language)
      .eq('user_id', req.user!.id)
      .eq('item_type', item_type)
      .single();

    if (existingWord) {
      const itemName = item_type === 'sentence' ? 'Sentence' : 'Word';
      return res.status(409).json({ error: `${itemName} already exists in vocabulary` });
    }

    // Generate automatic translation if no translation provided and translation service is available
    let autoTranslation = translation;
    if (!translation && translationService && ['english', 'french'].includes(language)) {
      try {
        const userApiKey = req.headers['x-openai-api-key'] as string;
        const translationRequest: TranslationRequest = {
          text: content,
          sourceLanguage: language as 'english' | 'french',
          targetLanguage: 'portuguese',
          userApiKey
        };
        
        const result = await translationService.translateText(translationRequest);
        autoTranslation = result.translatedText;
      } catch (translationError) {
        console.warn('Failed to auto-translate vocabulary item:', translationError);
        // Continue without translation - don't fail the vocabulary creation
      }
    }

    const insertData: any = {
      text_content: item_type === 'word' ? content.toLowerCase() : content,
      language,
      status,
      item_type,
      translation: autoTranslation,
      definition,
      user_id: req.user!.id,
      lesson_id,
    };

    // Add character indices if provided (for sentences)
    if (start_char_index !== undefined) {
      insertData.start_char_index = start_char_index;
    }
    if (end_char_index !== undefined) {
      insertData.end_char_index = end_char_index;
    }

    const { data: newWord, error } = await authenticatedClient
      .from('words')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ word: newWord });
  } catch (error) {
    console.error('Create vocabulary item error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/status', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status }: UpdateWordStatusRequest = req.body;

    const authenticatedClient = getAuthenticatedSupabaseClient(req);
    const { data: word, error } = await authenticatedClient
      .from('words')
      .update({ status })
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ word });
  } catch (error) {
    console.error('Update word status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { translation, definition, status } = req.body;

    // Only allow updating these specific fields
    const updateData: any = {};
    if (translation !== undefined) updateData.translation = translation;
    if (definition !== undefined) updateData.definition = definition;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const authenticatedClient = getAuthenticatedSupabaseClient(req);
    const { data: word, error } = await authenticatedClient
      .from('words')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ word });
  } catch (error) {
    console.error('Update word error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const authenticatedClient = getAuthenticatedSupabaseClient(req);
    const { data: stats, error } = await authenticatedClient
      .from('words')
      .select('status')
      .eq('user_id', req.user!.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const wordStats = {
      total: stats.length,
      new: stats.filter(w => w.status === 'new').length,
      learning: stats.filter(w => w.status === 'learning').length,
      known: stats.filter(w => w.status === 'known').length,
    };

    return res.json({ stats: wordStats });
  } catch (error) {
    console.error('Get vocabulary stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const authenticatedClient = getAuthenticatedSupabaseClient(req);
    const { error } = await authenticatedClient
      .from('words')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user!.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: 'Word deleted successfully' });
  } catch (error) {
    console.error('Delete word error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint for translating text using OpenAI
router.post('/translate', async (req: AuthRequest, res) => {
  try {
    const { text, sourceLanguage }: { text: string; sourceLanguage: 'english' | 'french' } = req.body;
    const userApiKey = req.headers['x-openai-api-key'] as string;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text to translate is required' });
    }

    if (!sourceLanguage || !['english', 'french'].includes(sourceLanguage)) {
      return res.status(400).json({ error: 'Valid source language (english or french) is required' });
    }

    if (!translationService) {
      return res.status(503).json({ 
        error: 'Translation service is not available',
        message: 'OpenAI translation service is not configured'
      });
    }

    try {
      const translationRequest: TranslationRequest = {
        text: text.trim(),
        sourceLanguage,
        targetLanguage: 'portuguese',
        userApiKey
      };

      const result = await translationService.translateText(translationRequest);

      return res.json({
        translation: result.translatedText,
        originalText: result.sourceText,
        sourceLanguage: result.sourceLanguage,
        targetLanguage: result.targetLanguage
      });
    } catch (translationError) {
      console.error('Translation service error:', translationError);
      
      // Return a graceful error that doesn't break the user flow
      const errorMessage = translationError instanceof Error ? translationError.message : 'Translation temporarily unavailable';
      return res.status(500).json({
        error: errorMessage,
        message: 'Please try again later or add translation manually',
        translation: null // Frontend can handle null translation
      });
    }
  } catch (error) {
    console.error('Translation endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as vocabularyRoutes };