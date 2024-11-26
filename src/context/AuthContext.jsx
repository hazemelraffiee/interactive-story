// ./src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check both localStorage and sessionStorage for token
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear tokens if there's an error
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const forgotPassword = async (email) => {
    try {
      const response = await authService.forgotPassword(email);
      return { success: true, message: response.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to process request'
      };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await authService.resetPassword(token, password);
      return { success: true, message: response.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reset password'
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};