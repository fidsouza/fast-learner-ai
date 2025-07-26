import React, { useState } from 'react';
import { aiAPI, AIGenerateTextRequest, AIGenerateTextResponse } from '../services/api';
import { validateApiKeyBeforeAction, isApiKeyConfigured } from '../utils/apiKeyUtils';
import AudioPlayer from './AudioPlayer';

interface AILessonGeneratorProps {
  onLessonCreated?: (lessonId: string) => void;
}

const AILessonGenerator: React.FC<AILessonGeneratorProps> = ({ onLessonCreated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<AIGenerateTextResponse | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<AIGenerateTextRequest & { title?: string }>({
    language: 'english',
    topic: '',
    level: 'beginner',
    title: ''
  });

  const apiKeyConfigured = isApiKeyConfigured();

  const handleGenerate = async () => {
    if (isGenerating) return;
    
    if (!validateApiKeyBeforeAction('generate content with AI')) {
      return;
    }

    setIsGenerating(true);
    setGeneratedContent(null);
    setAudioUrl(null);

    try {
      const result = await aiAPI.generateText({
        language: formData.language,
        topic: formData.topic || undefined,
        level: formData.level
      });
      
      setGeneratedContent(result);

      // Generate audio for the text
      const audioResult = await aiAPI.generateAudio(result.text, formData.language);
      setAudioUrl(audioResult.audioUrl);
    } catch (error) {
      console.error('Failed to generate content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleSaveLesson = async () => {
    if (!generatedContent) return;
    
    if (!validateApiKeyBeforeAction('save lesson')) {
      return;
    }

    setIsGenerating(true);
    try {
      const result = await aiAPI.generateLesson({
        language: formData.language,
        topic: formData.topic || undefined,
        level: formData.level,
        title: formData.title || undefined
      });

      alert('Lesson saved successfully!');
      if (onLessonCreated) {
        onLessonCreated(result.lesson.id);
      }
      
      // Reset form
      setGeneratedContent(null);
      setAudioUrl(null);
      setFormData({
        language: 'english',
        topic: '',
        level: 'beginner',
        title: ''
      });
    } catch (error) {
      console.error('Failed to save lesson:', error);
      alert('Failed to save lesson. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDiscard = () => {
    setGeneratedContent(null);
    setAudioUrl(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Generate Lesson with AI</h2>
      
      {!apiKeyConfigured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-yellow-800 font-semibold">API Key Required</h3>
              <p className="text-yellow-700 text-sm mt-1">
                To use AI features, you need to configure your OpenAI API key. 
                Go to <strong>Settings → Configure OpenAI Key</strong> in the menu.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Language
          </label>
          <select
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value as 'english' | 'french' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={isGenerating}
          >
            <option value="english">English</option>
            <option value="french">French</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Topic (Optional)
          </label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="e.g.: travel, food, daily routine..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={isGenerating}
          />
          <p className="mt-1 text-sm text-gray-500">
            Leave empty for general content
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <div className="space-y-3">
            {[
              { 
                value: 'beginner', 
                label: 'Beginner', 
                description: 'Basic vocabulary, simple phrases, present tense' 
              },
              { 
                value: 'intermediate', 
                label: 'Intermediate', 
                description: 'Expanded vocabulary, varied tenses, connectors' 
              },
              { 
                value: 'advanced', 
                label: 'Advanced', 
                description: 'Rich vocabulary, complex structures, idiomatic expressions' 
              }
            ].map((level) => (
              <label key={level.value} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="level"
                  value={level.value}
                  checked={formData.level === level.value}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  disabled={isGenerating}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{level.label}</div>
                  <div className="text-sm text-gray-500">{level.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Custom Title (Optional)
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Custom lesson title..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={isGenerating}
          />
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !apiKeyConfigured}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating && !generatedContent ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {generatedContent && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Content</h3>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="mb-2">
              <span className="text-sm text-gray-600">
                Language: <span className="font-medium">{generatedContent.language === 'english' ? 'English' : 'French'}</span>
                {generatedContent.topic && (
                  <span className="ml-4">
                    Topic: <span className="font-medium">{generatedContent.topic}</span>
                  </span>
                )}
                {generatedContent.level && (
                  <span className="ml-4">
                    Level: <span className="font-medium">
                      {generatedContent.level === 'beginner' ? 'Beginner' :
                       generatedContent.level === 'intermediate' ? 'Intermediate' :
                       'Advanced'}
                    </span>
                  </span>
                )}
              </span>
            </div>
            <p className="text-gray-800 leading-relaxed">{generatedContent.text}</p>
          </div>

          {audioUrl && (
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-700 mb-2">Audio</h4>
              <AudioPlayer src={audioUrl} text={generatedContent.text} />
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleRegenerate}
              disabled={isGenerating || !apiKeyConfigured}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Regenerating...' : 'Regenerate'}
            </button>
            <button
              onClick={handleSaveLesson}
              disabled={isGenerating || !apiKeyConfigured}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Saving...' : 'Save Lesson'}
            </button>
            <button
              onClick={handleDiscard}
              disabled={isGenerating}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AILessonGenerator;