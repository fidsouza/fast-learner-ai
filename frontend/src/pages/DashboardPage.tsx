import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { lessonsAPI, vocabularyAPI } from '../services/api';
import { Lesson, VocabularyStats } from '../types';
import { PlusIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { CreateLessonModal } from '../components/CreateLessonModal';
import { LessonCarousel } from '../components/LessonCarousel';

export const DashboardPage: React.FC = () => {
  const [newLessons, setNewLessons] = useState<Lesson[]>([]);
  const [openedLessons, setOpenedLessons] = useState<Lesson[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [stats, setStats] = useState<VocabularyStats | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [allLessonsResponse, newLessonsResponse, openedLessonsResponse, statsResponse] = await Promise.all([
        lessonsAPI.getAll(),
        lessonsAPI.getByStatus('new'),
        lessonsAPI.getByStatus('opened'),
        vocabularyAPI.getStats()
      ]);
      
      setAllLessons(allLessonsResponse.lessons);
      setNewLessons(newLessonsResponse.lessons);
      setOpenedLessons(openedLessonsResponse.lessons);
      setStats(statsResponse.stats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLessonCreated = (newLesson: Lesson) => {
    setAllLessons(prev => [newLesson, ...prev]);
    setNewLessons(prev => [newLesson, ...prev]);
    setIsCreateModalOpen(false);
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your lessons and track your progress</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpenIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Words
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-red-500 rounded-full"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      New
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.new}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-yellow-500 rounded-full"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Learning
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.learning}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-green-500 rounded-full"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Known
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.known}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Your Lessons</h2>
          <p className="text-sm text-gray-600">Explore your lessons organized by status</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/ai-generation"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            ✨ Generate with AI
          </Link>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Lesson
          </button>
        </div>
      </div>

      {/* Carousels */}
      <div className="space-y-8">
        {/* New Lessons Carousel */}
        {newLessons.length > 0 && (
          <LessonCarousel
            title="New Lessons"
            lessons={newLessons}
            className="mb-8"
          />
        )}

        {/* Opened Lessons Carousel */}
        {openedLessons.length > 0 && (
          <LessonCarousel
            title="Open Lessons"
            lessons={openedLessons}
            className="mb-8"
          />
        )}

        {/* Empty State */}
        {allLessons.length === 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="text-center py-12">
              <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No lessons found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by creating your first lesson or generating one with AI.
              </p>
              <div className="mt-6 flex justify-center space-x-3">
                <Link
                  to="/ai-generation"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  ✨ Generate with AI
                </Link>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Lesson
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <CreateLessonModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onLessonCreated={handleLessonCreated}
      />
    </div>
  );
};