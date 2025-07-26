import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

interface GenerateImageRequest {
  title: string;
  language: 'english' | 'french';
  content?: string;
  topic?: string;
}

interface GenerateImageResponse {
  imageUrl: string;
  storedUrl: string;
}

export class ImageGenerationService {
  private openai: OpenAI;
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY environment variable is not set');
      throw new Error('OPENAI_API_KEY is required for image generation');
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      console.error('SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables are not set');
      throw new Error('Supabase configuration is required for image storage');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

  }

  async generateLessonCover(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    try {
      // Generate prompt for DALL-E based on lesson data
      const prompt = this.createImagePrompt(request);
      
      // Generate image using DALL-E 3
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid"
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No image data returned from OpenAI');
      }

      const imageUrl = response.data[0].url;
      if (!imageUrl) {
        throw new Error('No image URL returned from OpenAI');
      }

      // Download and store image in Supabase Storage
      const storedUrl = await this.storeImageInSupabase(imageUrl, request);

      return {
        imageUrl,
        storedUrl
      };
    } catch (error) {
      console.error('Error generating lesson cover:', error);
      throw new Error('Failed to generate lesson cover image');
    }
  }

  private createImagePrompt(request: GenerateImageRequest): string {
    const { title, language, content, topic } = request;
    
    // Extract key themes from content (first 100 characters for context)
    const contentPreview = content ? content.substring(0, 100) : '';
    const languageName = language === 'english' ? 'English' : 'French';
    
    // Base prompt focusing on educational, clean, and appealing design
    let prompt = `Create a modern, educational illustration for a ${languageName} language lesson titled "${title}".`;
    
    // Add topic-specific elements if available
    if (topic) {
      prompt += ` The lesson focuses on ${topic}.`;
    } else if (contentPreview) {
      prompt += ` The lesson content includes themes from: "${contentPreview}".`;
    }

    // Add style guidelines
    prompt += ` The image should be:
    - Clean and minimalist design
    - Educational and professional looking
    - Suitable for language learning
    - Use soft, appealing colors
    - Include subtle ${languageName} cultural elements if appropriate
    - No text or letters in the image
    - Abstract or symbolic representation of the lesson theme
    - Suitable as a cover image for a digital lesson`;

    return prompt;
  }

  private async storeImageInSupabase(imageUrl: string, request: GenerateImageRequest): Promise<string> {
    try {
      // Download image from OpenAI
      const response = await fetch(imageUrl);
      const imageBuffer = await response.arrayBuffer();
      
      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedTitle = request.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const filename = `lesson_covers/${timestamp}_${sanitizedTitle}.png`;

      // Upload to Supabase Storage
      const { error } = await this.supabase.storage
        .from('audio-files') // Reusing existing bucket
        .upload(filename, imageBuffer, {
          contentType: 'image/png',
          cacheControl: '3600'
        });

      if (error) {
        console.error('Error uploading image to Supabase:', error);
        throw error;
      }

      // Get public URL
      const { data: publicData } = this.supabase.storage
        .from('audio-files')
        .getPublicUrl(filename);

      return publicData.publicUrl;
    } catch (error) {
      console.error('Error storing image in Supabase:', error);
      // Return original OpenAI URL as fallback
      return imageUrl;
    }
  }

  // Helper method to generate a simple prompt for quick testing
  static createSimplePrompt(title: string, language: string): string {
    const languageName = language === 'english' ? 'English' : 'French';
    return `A clean, modern educational illustration for a ${languageName} lesson about "${title}". Minimalist design, soft colors, no text, suitable for language learning app.`;
  }
}

// Image generation service is disabled - users must provide their own OpenAI keys
// Cover images will not be generated automatically
let imageGenerationService: ImageGenerationService | null = null;

console.warn('⚠️ ImageGenerationService is disabled - users must provide their own OpenAI keys');
console.warn('⚠️ Cover image generation will be disabled');

export { imageGenerationService };