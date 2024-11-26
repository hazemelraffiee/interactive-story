import api from './api';

const STORAGE_KEY_TOKEN = 'token';
const STORAGE_KEY_USER = 'user';

const authService = {
  async login(credentials) {
    const response = await api.post('/api/auth/login', credentials);
    if (response.data.token) {
      const storage = credentials.rememberMe ? localStorage : sessionStorage;
      storage.setItem(STORAGE_KEY_TOKEN, response.data.token);
      storage.setItem(STORAGE_KEY_USER, JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/api/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem(STORAGE_KEY_TOKEN, response.data.token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(response.data.user));
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
    const storageUser = localStorage.getItem(STORAGE_KEY_USER) || sessionStorage.getItem(STORAGE_KEY_USER);
    return storageUser ? JSON.parse(storageUser) : null;
  },

  getToken() {
    return localStorage.getItem(STORAGE_KEY_TOKEN) || sessionStorage.getItem(STORAGE_KEY_TOKEN);
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  // Helper method to store auth data
  setAuthData(data, rememberMe = true) {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEY_TOKEN, data.token);
    storage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
  }
};

export default authService;