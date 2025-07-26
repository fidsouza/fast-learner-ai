import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { vocabularyAPI } from '../services/api';
import { isApiKeyConfigured } from '../utils/apiKeyUtils';
import { Word } from '../types';

interface WordModalProps {
  isOpen: boolean;
  onClose: () => void;
  word: string;
  language: 'english' | 'french';
  lessonId: string;
  selectionRange?: {start: number, end: number} | null;
  onWordSaved: (word: Word) => void;
}

export const WordModal: React.FC<WordModalProps> = ({
  isOpen,
  onClose,
  word,
  language,
  lessonId,
  selectionRange,
  onWordSaved,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    translation: '',
    definition: '',
    status: 'new' as 'new' | 'learning' | 'known',
  });

  useEffect(() => {
    if (isOpen && word) {
      setFormData({
        translation: '',
        definition: '',
        status: 'new',
      });
      setError('');
      
      // Get automatic translation using OpenAI
      loadTranslation();
    }
  }, [isOpen, word, language]);

  const loadTranslation = async () => {
    if (!word || !['english', 'french'].includes(language)) {
      return;
    }

    // Check if API key is configured
    if (!isApiKeyConfigured()) {
      setFormData(prev => ({
        ...prev,
        translation: `Configure your OpenAI key for automatic translation`,
      }));
      return;
    }

    setIsLoadingTranslation(true);
    try {
      const result = await vocabularyAPI.translate(word, language);
      setFormData(prev => ({
        ...prev,
        translation: result.translation,
      }));
    } catch (error) {
      console.warn('Failed to get automatic translation:', error);
      // Use fallback if automatic translation fails
      const itemType = word.includes(' ') ? 'sentence' : 'word';
      setFormData(prev => ({
        ...prev,
        translation: `Manual translation needed for "${word}"`,
      }));
    } finally {
      setIsLoadingTranslation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const isSentence = word.includes(' ') || (selectionRange && selectionRange.end - selectionRange.start > word.length);
      
      const wordData = {
        text_content: word,
        language,
        lesson_id: lessonId,
        item_type: isSentence ? 'sentence' as const : 'word' as const,
        start_char_index: selectionRange?.start,
        end_char_index: selectionRange?.end,
        translation: formData.translation,
        definition: formData.definition,
        status: formData.status,
      };

      const response = await vocabularyAPI.create(wordData);
      onWordSaved(response.word);
      onClose();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('This word is already in your vocabulary');
      } else {
        setError(err.response?.data?.error || 'Error saving word');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-red-100 text-red-800';
      case 'learning':
        return 'bg-yellow-100 text-yellow-800';
      case 'known':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return 'New';
      case 'learning':
        return 'Learning';
      case 'known':
        return 'Known';
      default:
        return status;
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Dialog.Title className="text-lg font-medium text-gray-900">
                Add to Vocabulary
              </Dialog.Title>
              <div className="flex items-center mt-2 space-x-2">
                <span className="text-2xl font-bold text-primary-600">{word}</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(formData.status)}`}>
                  {getStatusLabel(formData.status)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="new">New</option>
                <option value="learning">Learning</option>
                <option value="known">Known</option>
              </select>
            </div>

            <div>
              <label htmlFor="translation" className="block text-sm font-medium text-gray-700">
                Translation
                {isLoadingTranslation && (
                  <span className="ml-2 text-xs text-blue-600">(Generating automatic translation...)</span>
                )}
              </label>
              <input
                type="text"
                id="translation"
                name="translation"
                value={formData.translation}
                onChange={handleInputChange}
                disabled={isLoadingTranslation}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder={isLoadingTranslation ? "Generating translation..." : "Enter translation..."}
              />
              {!isLoadingTranslation && formData.translation && (
                <p className="mt-1 text-xs text-gray-500">✨ Automatically generated translation - you can edit it</p>
              )}
            </div>

            <div>
              <label htmlFor="definition" className="block text-sm font-medium text-gray-700">
                Definition
              </label>
              <textarea
                id="definition"
                name="definition"
                rows={3}
                value={formData.definition}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Enter definition or context..."
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Sentence'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};