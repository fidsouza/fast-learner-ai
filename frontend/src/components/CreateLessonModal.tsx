import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { lessonsAPI } from '../services/api';
import { Lesson } from '../types';

interface CreateLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLessonCreated: (lesson: Lesson) => void;
}

export const CreateLessonModal: React.FC<CreateLessonModalProps> = ({
  isOpen,
  onClose,
  onLessonCreated,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    language: 'english' as 'english' | 'french',
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const lessonData = {
        ...formData,
        audio_file: audioFile || undefined,
      };

      const response = await lessonsAPI.create(lessonData);
      onLessonCreated(response.lesson);
      
      setFormData({ title: '', content: '', language: 'english' });
      setAudioFile(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error creating lesson');
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Create New Lesson
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Enter lesson title"
              />
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                Language
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="english">English</option>
                <option value="french">French</option>
              </select>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Lesson Content
              </label>
              <textarea
                id="content"
                name="content"
                rows={8}
                required
                value={formData.content}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Paste or type the lesson text here..."
              />
            </div>

            <div>
              <label htmlFor="audio" className="block text-sm font-medium text-gray-700">
                Audio File (optional)
              </label>
              <input
                type="file"
                id="audio"
                accept="audio/*"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              {audioFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected file: {audioFile.name}
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
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
                {isLoading ? 'Creating...' : 'Create Lesson'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};