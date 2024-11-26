import { api } from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/api/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/api/auth/login', credentials);
    if (response.data.token) {
      // If "Remember Me" is checked, store in localStorage, otherwise in sessionStorage
      const storage = credentials.rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token, password) {
    const response = await api.post(`/api/auth/reset-password/${token}`, { password });
    return response.data;
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      throw error;
    }
  },

  logout() {
    // Clear both storage types to ensure complete logout
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }
};