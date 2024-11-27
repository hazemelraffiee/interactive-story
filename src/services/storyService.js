import api from './api';

const storyService = {

  // Get all available genres
  getGenres: async () => {
    const response = await api.get('/api/stories/genres');
    return response.data.genres;
  },

  // Get all stories by current user
  getMyStories: async () => {
    const response = await api.get('/api/stories/mystories');
    return response.data;
  },

  // Get a single story
  getStory: async (storyId) => {
    const response = await api.get(`/api/stories/${storyId}`);
    return response.data;
  },

  // Create a new story
  createStory: async (storyData) => {
    const response = await api.post('/api/stories', storyData);
    return response.data;
  },

  // Update a story
  updateStory: async (storyId, storyData) => {
    const response = await api.put(`/api/stories/${storyId}`, storyData);
    return response.data;
  },

  // Duplicate a story
  duplicateStory: async (storyId) => {
    const response = await api.post(`/api/stories/${storyId}/duplicate`);
    return response.data;
  },

  // Change story status
  updateStoryStatus: async (storyId, status) => {
    const response = await api.patch(`/api/stories/${storyId}/status`, { status });
    return response.data;
  },

  // Delete a story
  deleteStory: async (storyId) => {
    await api.delete(`/api/stories/${storyId}`);
  },

  // Get public stories with optional filtering
  getPublicStories: async (genres = 'all', sort = 'trending') => {
    try {
      const response = await api.get('/api/stories/public', {
        params: {
          genres: genres === 'all' ? undefined : genres,
          sort
        }
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch stories';
      throw new Error(errorMessage);
    }
  }
};

export default storyService;