import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader } from 'lucide-react';
import authService from '../../services/authService';

const ProtectedRoute = ({ children }) => {
  const { user, loading, updateUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Check if there's stored auth data but no user in context
    if (!user && authService.isAuthenticated()) {
      const storedUser = authService.getCurrentUser();
      if (storedUser) {
        updateUser(storedUser);
      }
    }
  }, [user, updateUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!user && !authService.isAuthenticated()) {
    // Redirect them to the login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;