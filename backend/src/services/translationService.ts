import OpenAI from 'openai';

export interface TranslationRequest {
  text: string;
  sourceLanguage: 'english' | 'french';
  targetLanguage: 'portuguese';
  userApiKey?: string;
}

export interface TranslationResponse {
  translatedText: string;
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export class TranslationService {
  private createOpenAIClient(userApiKey?: string): OpenAI {
    const apiKey = userApiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is required for translation. Please provide your own API key.');
    }

    return new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * Builds a specific prompt for translation based on context and languages
   */
  private buildTranslationPrompt(text: string, sourceLanguage: 'english' | 'french', targetLanguage: 'portuguese'): string {
    const languageMap = {
      english: 'inglês',
      french: 'francês',
      portuguese: 'português'
    };

    const sourceLang = languageMap[sourceLanguage];
    const targetLang = languageMap[targetLanguage];

    return `Traduza o seguinte texto de ${sourceLang} para ${targetLang}. 

INSTRUÇÕES:
- Forneça uma tradução natural e precisa
- Mantenha o contexto e o tom original
- Se for uma palavra isolada, forneça a tradução mais comum e útil
- Se for uma frase ou sentença, mantenha a estrutura gramatical apropriada em português
- Não adicione explicações extras, apenas a tradução

Texto para traduzir: "${text}"

Tradução em ${targetLang}:`;
  }

  /**
   * Translates text using OpenAI GPT-4
   */
  async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    const { text, sourceLanguage, targetLanguage, userApiKey } = request;

    if (!text || text.trim().length === 0) {
      throw new Error('Text to translate cannot be empty');
    }

    // Validate languages
    if (!['english', 'french'].includes(sourceLanguage)) {
      throw new Error('Source language must be english or french');
    }

    if (targetLanguage !== 'portuguese') {
      throw new Error('Target language must be portuguese');
    }

    try {
      const openai = this.createOpenAIClient(userApiKey);
      const prompt = this.buildTranslationPrompt(text, sourceLanguage, targetLanguage);

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Você é um tradutor profissional especializado em traduzir textos de inglês e francês para português brasileiro. Suas traduções são sempre precisas, naturais e contextualmente apropriadas."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.3, // Lower temperature for more consistent translations
      });

      const translatedText = completion.choices[0]?.message?.content?.trim() || '';

      if (!translatedText) {
        throw new Error('No translation received from OpenAI');
      }

      return {
        translatedText,
        sourceText: text,
        sourceLanguage,
        targetLanguage
      };
    } catch (error) {
      console.error('Translation error:', error);
      
      if (error instanceof Error) {
        // Re-throw OpenAI API errors with more context
        throw new Error(`Translation failed: ${error.message}`);
      }
      
      throw new Error('Translation service unavailable');
    }
  }

  /**
   * Batch translate multiple texts (for future optimization)
   */
  async translateBatch(requests: TranslationRequest[]): Promise<TranslationResponse[]> {
    const results: TranslationResponse[] = [];
    
    // Process translations sequentially to avoid rate limits
    // In production, this could be optimized with proper queuing
    for (const request of requests) {
      try {
        const result = await this.translateText(request);
        results.push(result);
      } catch (error) {
        console.error(`Failed to translate "${request.text}":`, error);
        // Continue with other translations even if one fails
        results.push({
          translatedText: '', // Empty translation indicates failure
          sourceText: request.text,
          sourceLanguage: request.sourceLanguage,
          targetLanguage: request.targetLanguage
        });
      }
    }
    
    return results;
  }
}

// Create a single instance of the service
const translationService = new TranslationService();
console.log('✅ TranslationService initialized successfully');

export { translationService };