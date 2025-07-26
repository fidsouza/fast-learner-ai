import React from 'react';
import { useNavigate } from 'react-router-dom';
import AILessonGenerator from '../components/AILessonGenerator';

export const AIGenerationPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLessonCreated = (lessonId: string) => {
    navigate(`/lesson/${lessonId}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Lesson Generator</h1>
        <p className="mt-2 text-gray-600">
          Generate personalized content for language learning with AI. Create lessons with text and audio adapted to your learning level and interests.
        </p>
      </div>

      <AILessonGenerator onLessonCreated={handleLessonCreated} />
    </div>
  );
};