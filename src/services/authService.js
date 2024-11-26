import api from './api';

const STORAGE_KEY_TOKEN = 'token';
const STORAGE_KEY_USER = 'user';

const authService = {
  getCurrentStorage() {
    // Check which storage contains the auth data
    if (localStorage.getItem(STORAGE_KEY_TOKEN)) {
      return localStorage;
    }
    if (sessionStorage.getItem(STORAGE_KEY_TOKEN)) {
      return sessionStorage;
    }
    return null;
  },

  async login(credentials) {
    const response = await api.post('/api/auth/login', credentials);
    if (response.data.token) {
      const storage = credentials.rememberMe ? localStorage : sessionStorage;
      this.setAuthData(response.data, storage);
    }
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/api/auth/register', userData);
    if (response.data.token) {
      this.setAuthData(response.data, localStorage); // Always use localStorage for registration
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    sessionStorage.removeItem(STORAGE_KEY_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_USER);
  },

  async forgotPassword(email) {
    return api.post('/api/auth/forgot-password', { email });
  },

  async resetPassword(token, newPassword) {
    return api.post(`/api/auth/reset-password/${token}`, { password: newPassword });
  },

  getCurrentUser() {
    const storage = this.getCurrentStorage();
    if (!storage) return null;
    
    const userStr = storage.getItem(STORAGE_KEY_USER);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  },

  getToken() {
    const storage = this.getCurrentStorage();
    return storage ? storage.getItem(STORAGE_KEY_TOKEN) : null;
  },

  isAuthenticated() {
    return !!this.getToken() && !!this.getCurrentUser();
  },

  setAuthData(data, storage = localStorage) {
    if (data.token) {
      storage.setItem(STORAGE_KEY_TOKEN, data.token);
    }
    if (data.user) {
      storage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
    }
  },

  // Helper to check if a token exists in any storage
  hasAuthData() {
    return !!(localStorage.getItem(STORAGE_KEY_TOKEN) || sessionStorage.getItem(STORAGE_KEY_TOKEN));
  }
};

export default authService;