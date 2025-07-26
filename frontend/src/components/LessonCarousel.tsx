import React from 'react';
import { Link } from 'react-router-dom';
import { Lesson } from '../types';
import { PlayIcon, BookOpenIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface LessonCarouselProps {
  title: string;
  lessons: Lesson[];
  className?: string;
}

export const LessonCarousel: React.FC<LessonCarouselProps> = ({ title, lessons, className = '' }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (lessons.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={scrollLeft}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={scrollRight}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-6">
        <div
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              to={`/lesson/${lesson.id}`}
              className="flex-shrink-0 w-64 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="relative">
                {lesson.cover_image_url ? (
                  <img
                    src={lesson.cover_image_url}
                    alt={lesson.title}
                    className="w-full h-32 object-cover rounded-t-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-t-lg flex items-center justify-center">
                    <BookOpenIcon className="h-12 w-12 text-white opacity-80" />
                  </div>
                )}
                
                {lesson.audio_url && (
                  <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-1">
                    <PlayIcon className="h-4 w-4 text-primary-600" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-900 truncate" title={lesson.title}>
                  {lesson.title}
                </h4>
                <p className="mt-1 text-xs text-gray-500">
                  {lesson.language === 'english' ? 'English' : 'French'}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(lesson.created_at).toLocaleDateString('en-US')}
                </p>
                
                <div className="mt-2 flex flex-wrap gap-1">
                  {lesson.ai_generated && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      IA
                    </span>
                  )}
                  {lesson.difficulty_level && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      lesson.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                      lesson.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {lesson.difficulty_level === 'beginner' ? 'Beginner' :
                       lesson.difficulty_level === 'intermediate' ? 'Intermediate' :
                       'Advanced'}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};