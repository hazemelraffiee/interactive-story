import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import StoryPlatform from './pages/StoryPlatform/StoryPlatform';

const App = () => {
  // Maintain the dark mode initialization
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes - everything under StoryPlatform */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <StoryPlatform />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;