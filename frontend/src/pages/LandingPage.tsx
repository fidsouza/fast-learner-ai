import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  BookOpenIcon, 
  SparklesIcon, 
  SpeakerWaveIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
  HeartIcon,
  PlayIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

export const LandingPage: React.FC = () => {
  const { user } = useAuthStore();
  const features = [
    {
      icon: AcademicCapIcon,
      title: "User Authentication & Management",
      description: "Secure user registration, login, and personalized learning profiles"
    },
    {
      icon: BookOpenIcon,
      title: "Lesson Creation & Import",
      description: "Create custom lessons or import existing content with audio support"
    },
    {
      icon: SparklesIcon,
      title: "AI-Powered Lesson Generation",
      description: "Generate lessons with GPT-4, including text, audio, and cover images with difficulty levels"
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: "Smart Vocabulary System",
      description: "Save words/sentences, track learning status, and get instant translations with highlights"
    },
    {
      icon: PlayIcon,
      title: "Lesson Carousel Organization",
      description: "Organized lessons in carousels: New Lessons and Opened Lessons for easy navigation"
    },
    {
      icon: SpeakerWaveIcon,
      title: "Synchronized Audio System",
      description: "Audio-text synchronization for immersive language learning experience"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpenIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Fast Learner AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/fidsouza/fast-learner-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <CodeBracketIcon className="h-5 w-5 mr-2" />
                View on GitHub
              </a>
              <Link
                to={user ? "/dashboard" : "/auth"}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                {user ? "Go to Dashboard" : "Start Learning Now"}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered Language Learning
              <span className="block text-blue-600">Made Open Source</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Fast Learner AI is a modern language learning platform featuring AI-generated lessons, 
              smart vocabulary management, and synchronized audio-text learning. Built with React, Node.js, 
              and powered by OpenAI - completely open source and free to use.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link
                to={user ? "/dashboard" : "/auth"}
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <RocketLaunchIcon className="h-6 w-6 mr-2" />
                {user ? "Go to Dashboard" : "Launch App"}
              </Link>
              <a
                href="https://github.com/fidsouza/fast-learner-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 border border-gray-300 text-lg font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <CodeBracketIcon className="h-6 w-6 mr-2" />
                View Source Code
              </a>
            </div>
          </div>

          {/* Open Source Badge */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-green-100 text-green-800 font-medium">
            <HeartIcon className="h-5 w-5 mr-2" />
            100% Open Source • MIT License • Free Forever
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Language Learning
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to create, study, and master new languages with the help of AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="ml-3 text-lg font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built with Modern Technology
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Fast Learner AI leverages cutting-edge technologies to provide a seamless learning experience
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-lg p-6 mb-4">
                <span className="text-2xl font-bold">React</span>
              </div>
              <p className="text-blue-100">Frontend Framework</p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-lg p-6 mb-4">
                <span className="text-2xl font-bold">Node.js</span>
              </div>
              <p className="text-blue-100">Backend Runtime</p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-lg p-6 mb-4">
                <span className="text-2xl font-bold">OpenAI</span>
              </div>
              <p className="text-blue-100">AI Integration</p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-lg p-6 mb-4">
                <span className="text-2xl font-bold">Supabase</span>
              </div>
              <p className="text-blue-100">Database & Auth</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Fast Learner AI?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckIcon className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">User-Controlled AI Keys</h3>
                    <p className="text-gray-600">You control your own OpenAI API keys - no hidden costs or limitations</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Completely Open Source</h3>
                    <p className="text-gray-600">Full source code available - modify, improve, and contribute to the platform</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Modern Learning Experience</h3>
                    <p className="text-gray-600">AI-generated content with synchronized audio and intelligent vocabulary tracking</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="h-6 w-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Privacy-First Design</h3>
                    <p className="text-gray-600">Your API keys and learning data remain under your control</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
              <div className="text-center">
                <SparklesIcon className="h-16 w-16 text-blue-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Start Learning?
                </h3>
                <p className="text-gray-600 mb-6">
                  Join thousands of learners using AI-powered language learning. 
                  Get started in minutes with your own OpenAI API key.
                </p>
                <Link
                  to={user ? "/dashboard" : "/auth"}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  {user ? "Go to Dashboard" : "Start Learning Now"}
                  <RocketLaunchIcon className="h-5 w-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BookOpenIcon className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">Fast Learner AI</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Open-source AI-powered language learning platform. 
                Built with React, Node.js, and OpenAI integration.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link to={user ? "/dashboard" : "/auth"} className="block text-gray-400 hover:text-white transition-colors">
                  {user ? "Go to Dashboard" : "Launch App"}
                </Link>
                <a
                  href="https://github.com/fidsouza/fast-learner-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  GitHub Repository
                </a>
                <a
                  href="https://github.com/fidsouza/fast-learner-ai/blob/main/README.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Documentation
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Technology</h3>
              <div className="space-y-2 text-gray-400">
                <p>Frontend: React + TypeScript</p>
                <p>Backend: Node.js + Express</p>
                <p>Database: Supabase PostgreSQL</p>
                <p>AI: OpenAI GPT-4 + DALL-E</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              © 2024 Fast Learner AI. Open source under MIT License. 
              Built with <HeartIcon className="h-4 w-4 inline mx-1" /> for language learners worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};