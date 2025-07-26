import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { LessonPage } from './pages/LessonPage';
import { VocabularyPage } from './pages/VocabularyPage';
import { AIGenerationPage } from './pages/AIGenerationPage';
import APIConfigPage from './pages/APIConfigPage';
import { AuthenticatedLayout } from './components/AuthenticatedLayout';

function App() {
  const { user, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route 
            path="/" 
            element={<LandingPage />} 
          />
          <Route 
            path="/auth" 
            element={user ? <Navigate to="/dashboard" /> : <AuthPage />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <AuthenticatedLayout><DashboardPage /></AuthenticatedLayout> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/lesson/:id" 
            element={user ? <AuthenticatedLayout><LessonPage /></AuthenticatedLayout> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/vocabulary" 
            element={user ? <AuthenticatedLayout><VocabularyPage /></AuthenticatedLayout> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/ai-generation" 
            element={user ? <AuthenticatedLayout><AIGenerationPage /></AuthenticatedLayout> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/api-config" 
            element={user ? <AuthenticatedLayout><APIConfigPage /></AuthenticatedLayout> : <Navigate to="/auth" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;