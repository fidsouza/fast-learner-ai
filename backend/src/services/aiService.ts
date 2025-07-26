import OpenAI from 'openai';

export interface GenerateTextRequest {
  language: 'english' | 'french';
  topic?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  userApiKey?: string;
}

export interface GenerateTextResponse {
  text: string;
  language: string;
  topic?: string;
  level?: string;
}

export class AIService {
  static buildLevelSpecificPrompt(language: 'english' | 'french', topic: string | undefined, level: 'beginner' | 'intermediate' | 'advanced'): string {
    const languageMap = {
      english: 'English',
      french: 'French'
    };

    const targetLanguage = languageMap[language];
    const baseTopicText = topic ? `about "${topic}"` : 'for everyday communication';
    
    // Define specific prompts for each level
    const levelPrompts = {
      beginner: {
        instructions: `Generate a simple text in ${targetLanguage} ${baseTopicText} for absolute beginners.

REQUIREMENTS:
- Use only basic, common vocabulary (most frequent 500-1000 words)
- Write short, simple sentences (5-10 words each)
- Use present tense primarily, avoid complex verb forms
- Include repetition of key vocabulary
- Text length: 80-120 words
- Use basic sentence structures (Subject + Verb + Object)
- Avoid idioms, slang, or cultural references
- Focus on practical, everyday situations`,
        
        example: topic ? 
          `Example: If topic is "food", use words like: eat, food, good, like, want, have, table, etc.` :
          `Focus on: greetings, family, daily activities, basic needs`
      },

      intermediate: {
        instructions: `Generate a moderately complex text in ${targetLanguage} ${baseTopicText} for intermediate learners.

REQUIREMENTS:
- Use expanded vocabulary (2000-3000 most common words)
- Mix simple and compound sentences (8-15 words each)
- Include past and future tenses, conditional forms
- Introduce some connecting words (because, although, however)
- Text length: 120-180 words
- Add descriptive adjectives and adverbs
- Include some cultural context when relevant
- Use varied sentence structures`,
        
        example: topic ?
          `Example: If topic is "food", include: ingredients, cooking methods, preferences, cultural dishes, etc.` :
          `Include: opinions, experiences, comparisons, explanations`
      },

      advanced: {
        instructions: `Generate a sophisticated text in ${targetLanguage} ${baseTopicText} for advanced learners.

REQUIREMENTS:
- Use rich, varied vocabulary including less common words
- Write complex sentences with multiple clauses (12-20 words each)
- Include all verb tenses, subjunctive mood, passive voice
- Use sophisticated connectors (nevertheless, consequently, furthermore)
- Text length: 180-250 words
- Include idiomatic expressions and nuanced language
- Add cultural references and abstract concepts
- Use literary or academic tone when appropriate`,
        
        example: topic ?
          `Example: If topic is "food", discuss: culinary traditions, gastronomic experiences, social implications, etc.` :
          `Include: abstract ideas, cultural analysis, sophisticated argumentation`
      }
    };

    const levelConfig = levelPrompts[level];
    
    return `${levelConfig.instructions}

${levelConfig.example}

The text should be natural, engaging, and suitable for language learning. Make it interesting and informative while strictly adhering to the vocabulary and grammar level specified.`;
  }

  static async generateText(request: GenerateTextRequest): Promise<GenerateTextResponse> {
    const { language, topic, level = 'beginner', userApiKey } = request;
    
    const apiKey = userApiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is required. Please provide your own API key.');
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const prompt = this.buildLevelSpecificPrompt(language, topic, level);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4", // Using GPT-4 for better quality and level adherence
        messages: [
          {
            role: "system",
            content: "You are an expert language teacher who creates educational content tailored to specific proficiency levels. Always follow the level requirements precisely."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.7,
      });

      const text = completion.choices[0]?.message?.content?.trim() || '';
      
      return {
        text,
        language,
        topic,
        level
      };
    } catch (error) {
      console.error('AI text generation error:', error);
      throw new Error('Failed to generate text with AI');
    }
  }

  static async generateAudio(text: string, language: 'english' | 'french', userApiKey?: string): Promise<Buffer> {
    const apiKey = userApiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key required for text-to-speech. Please provide your own API key.');
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    try {
      const voice = language === 'english' ? 'alloy' : 'nova'; // Different voices for different languages
      
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice,
        input: text,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      return buffer;
    } catch (error) {
      console.error('TTS generation error:', error);
      throw new Error('Failed to generate audio with AI');
    }
  }
}