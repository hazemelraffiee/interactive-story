import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen,
  Loader
} from 'lucide-react';
import StoryCard from '../../components/common/StoryCard';
import NotificationToast from '../../components/common/NotificationToast';
import storyService from '../../services/storyService';

// Filter configuration for story status tabs
const STATUS_FILTERS = [
  { id: 'all', label: 'All Stories' },
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Drafts' },
  { id: 'archived', label: 'Archived' }
];

const MyStoriesView = () => {
  // Core state management
  const [myStories, setMyStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [notification, setNotification] = useState(null);
  
  const navigate = useNavigate();

  // Fetch stories when component mounts
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setIsLoading(true);
        const stories = await storyService.getMyStories();
        setMyStories(stories);
      } catch (error) {
        console.error('Failed to fetch stories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, []);


  const handleStoryUpdate = (update, deletedId) => {
    if (deletedId) {
      // Handle deletion
      setMyStories(stories => stories.filter(story => story._id !== deletedId));
    } else if (update) {
      setMyStories(stories => {
        if (update.id) {
          // Handle state change or other updates
          return stories.map(story => {
            if (story._id === update.id) {
              // Create new story object with all updates
              return {
                ...story,
                ...update,
                status: update.status, // Explicitly update status
                updatedAt: update.updatedAt
              };
            }
            return story;
          });
        }
        // Handle new story addition (e.g., after duplication)
        return [...stories, update];
      });
    }
  };

  // Navigation handlers
  const handleCreateNew = () => navigate('/create');
  

  // Filter stories based on active filter
  const filteredStories = myStories.filter(story => {
    if (activeFilter === 'all') return true;
    return story.status === activeFilter;
  });

  // Show loading state while fetching stories
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* Notification Toast */}
      {notification && (
        <NotificationToast
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Stories</h1>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
                     transition-colors duration-200"
          >
            Create New Story
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-8 border-b border-gray-200">
          {STATUS_FILTERS.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px 
                transition-colors duration-200 ${
                activeFilter === filter.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Stories Grid */}
        <div className="space-y-6">
          {filteredStories.map(story => (
            <StoryCard
              key={story._id}
              story={story}
              onUpdate={handleStoryUpdate}
            />
          ))}

          {/* Empty State */}
          {filteredStories.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No stories found
              </h3>
              <p className="text-gray-500">
                {activeFilter === 'all'
                  ? "You haven't created any stories yet. Click 'Create New Story' to get started!"
                  : `You don't have any ${activeFilter} stories yet.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyStoriesView;