import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen,
  Loader
} from 'lucide-react';
import StoryCard from '../../components/story/StoryCard';
import NotificationToast from '../../components/common/NotificationToast';
import storyService from '../../services/storyService';

// Filter configuration for story status tabs
const STATUS_FILTERS = [
  { id: 'all', label: 'All Stories' },
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Drafts' },
  { id: 'archived', label: 'Archived' }
];

// Messages to show when story state changes
const STATE_CHANGE_MESSAGES = {
  published: {
    title: 'Story Published',
    message: 'Your story is now live and visible to readers'
  },
  draft: {
    title: 'Moved to Drafts',
    message: 'Your story has been saved as a draft'
  },
  archived: {
    title: 'Story Archived',
    message: 'Your story has been moved to the archive'
  }
};

const MyStoriesView = () => {
  // Core state management
  const [myStories, setMyStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [notification, setNotification] = useState(null);
  
  // Track which stories are currently changing state
  const [stateChanges, setStateChanges] = useState(new Map());
  
  const navigate = useNavigate();

  // Memoize the notification function to maintain a stable reference
  const showNotification = useCallback((title, message, duration = 5000) => {
    setNotification({ title, message });
    setTimeout(() => setNotification(null), duration);
  }, []); // Empty dependency array since setNotification is stable

  // Fetch stories when component mounts
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setIsLoading(true);
        const stories = await storyService.getMyStories();
        setMyStories(stories);
      } catch (error) {
        showNotification('Error', 'Failed to fetch your stories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, [showNotification]); // Now we can safely include showNotification as a dependency

  // Rest of the component remains the same...
  // Navigation handlers
  const handleCreateNew = () => navigate('/create');
  const handleEdit = (story) => navigate('/create', { state: { storyId: story._id } });
  const handleStoryRead = (story) => navigate(`/story/${story._id}`);

  // Story duplication handler
  const handleDuplicateStory = async (storyId) => {
    try {
      const duplicatedStory = await storyService.duplicateStory(storyId);
      setMyStories(stories => [...stories, duplicatedStory]);
      showNotification('Success', 'Story duplicated successfully');
    } catch (error) {
      showNotification('Error', 'Failed to duplicate story');
    }
  };

  // Story deletion handler with confirmation
  const handleDeleteStory = async (storyId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this story? This action cannot be undone.'
    );
    
    if (!confirmed) return;
  
    try {
      await storyService.deleteStory(storyId);
      setMyStories(stories => stories.filter(story => story._id !== storyId));
      showNotification('Success', 'Story deleted successfully');
    } catch (error) {
      showNotification('Error', 'Failed to delete story');
    }
  };

  // Handle story state changes (draft/published/archived)
  const handleStateChange = async (storyId, newState) => {
    // Prevent concurrent state changes for the same story
    if (stateChanges.get(storyId)) return;

    try {
      // Mark this story as having a state change in progress
      setStateChanges(prev => new Map(prev).set(storyId, true));
      
      // Call the API to update the story status
      await storyService.updateStoryStatus(storyId, newState);
      
      // Update the local state optimistically
      setMyStories(stories =>
        stories.map(story =>
          story._id === storyId ? { ...story, status: newState } : story
        )
      );
      
      // Show appropriate success message
      const { title, message } = STATE_CHANGE_MESSAGES[newState] || {
        title: 'Status Updated',
        message: 'Story status has been updated successfully'
      };
      showNotification(title, message);
      
    } catch (error) {
      showNotification('Error', 'Failed to update story status');
    } finally {
      // Clear the state change flag for this story
      setStateChanges(prev => {
        const newMap = new Map(prev);
        newMap.delete(storyId);
        return newMap;
      });
    }
  };

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
              onReadClick={handleStoryRead}
              onEdit={handleEdit}
              onDuplicate={handleDuplicateStory}
              onDelete={handleDeleteStory}
              onStateChange={handleStateChange}
              isStateChanging={stateChanges.get(story._id)}
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