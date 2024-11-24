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
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
  }
};