import React, { useState, useEffect } from 'react';
import { vocabularyAPI } from '../services/api';
import { Word } from '../types';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export const VocabularyPage: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [editingTranslation, setEditingTranslation] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    loadVocabulary();
  }, []);

  useEffect(() => {
    filterWords();
  }, [words, searchTerm, statusFilter, languageFilter, typeFilter]);

  const loadVocabulary = async () => {
    try {
      const response = await vocabularyAPI.getAll();
      setWords(response.words);
    } catch (error) {
      console.error('Error loading vocabulary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterWords = () => {
    let filtered = words;

    if (searchTerm) {
      filtered = filtered.filter(word =>
        (word.text_content || word.word || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.translation?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(word => word.status === statusFilter);
    }

    if (languageFilter !== 'all') {
      filtered = filtered.filter(word => word.language === languageFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(word => (word.item_type || 'word') === typeFilter);
    }

    setFilteredWords(filtered);
  };

  const handleStatusChange = async (wordId: string, newStatus: 'new' | 'learning' | 'known') => {
    try {
      await vocabularyAPI.updateStatus(wordId, newStatus);
      setWords(prev => prev.map(word =>
        word.id === wordId ? { ...word, status: newStatus } : word
      ));
    } catch (error) {
      console.error('Error updating word status:', error);
    }
  };

  const handleDeleteWord = async (wordId: string) => {
    const item = words.find(w => w.id === wordId);
    const itemType = (item?.item_type || 'word') === 'sentence' ? 'sentence' : 'word';
    
    if (!window.confirm(`Are you sure you want to remove this ${itemType} from vocabulary?`)) {
      return;
    }

    try {
      await vocabularyAPI.delete(wordId);
      setWords(prev => prev.filter(word => word.id !== wordId));
    } catch (error) {
      console.error('Error deleting word:', error);
    }
  };

  const handleEditTranslation = (wordId: string, currentTranslation: string) => {
    setEditingTranslation(wordId);
    setEditingText(currentTranslation || '');
  };

  const handleSaveTranslation = async (wordId: string) => {
    try {
      await vocabularyAPI.update(wordId, { translation: editingText });
      setWords(prev => prev.map(word =>
        word.id === wordId ? { ...word, translation: editingText } : word
      ));
      setEditingTranslation(null);
      setEditingText('');
    } catch (error) {
      console.error('Error updating translation:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingTranslation(null);
    setEditingText('');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vocabulary</h1>
        <p className="mt-2 text-gray-600">Manage your words and track your progress</p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search words..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="all">All statuses</option>
                <option value="new">New</option>
                <option value="learning">Learning</option>
                <option value="known">Known</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="all">All languages</option>
                <option value="english">English</option>
                <option value="french">French</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="all">Words and Sentences</option>
                <option value="word">Words Only</option>
                <option value="sentence">Sentences Only</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center text-sm text-gray-500">
            <FunnelIcon className="h-4 w-4 mr-2" />
            Showing {filteredWords.length} of {words.length} items
          </div>
        </div>

        {filteredWords.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {words.length === 0 ? 'No items in vocabulary' : 'No items found with applied filters'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredWords.map((word) => (
              <li key={word.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-semibold text-gray-900">
                        {word.text_content || word.word}
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(word.status)}`}>
                        {getStatusLabel(word.status)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {word.language === 'english' ? 'English' : 'French'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        (word.item_type || 'word') === 'sentence' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {(word.item_type || 'word') === 'sentence' ? 'Sentence' : 'Word'}
                      </span>
                    </div>
                    
                    <div className="mt-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <strong>Translation:</strong>
                        {editingTranslation === word.id ? (
                          <div className="flex items-center space-x-2 flex-1">
                            <input
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                              placeholder="Enter translation..."
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveTranslation(word.id)}
                              className="text-green-600 hover:text-green-700 p-1"
                              title="Save translation"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-700 p-1"
                              title="Cancel edit"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 flex-1">
                            <span className="flex-1">
                              {word.translation || 'No translation'}
                            </span>
                            <button
                              onClick={() => handleEditTranslation(word.id, word.translation || '')}
                              className="text-gray-500 hover:text-gray-700 p-1"
                              title="Edit translation"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {word.definition && (
                      <div className="mt-1 text-sm text-gray-600">
                        <strong>Definition:</strong> {word.definition}
                      </div>
                    )}
                    
                    <div className="mt-2 text-xs text-gray-400">
                      Added on {new Date(word.created_at).toLocaleDateString('en-US')}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={word.status}
                      onChange={(e) => handleStatusChange(word.id, e.target.value as 'new' | 'learning' | 'known')}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="new">New</option>
                      <option value="learning">Learning</option>
                      <option value="known">Conhecida</option>
                    </select>

                    <button
                      onClick={() => handleDeleteWord(word.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title={`Remove ${(word.item_type || 'word') === 'sentence' ? 'sentence' : 'word'}`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};