import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Edit3, 
  Trash2, 
  Globe, 
  Lock,
  Copy,
  Archive,
  Loader
} from 'lucide-react';
import StoryCard from '../../components/story/StoryCard';
import NotificationToast from '../../components/common/NotificationToast';
import storyService from '../../services/storyService';

const MyStoriesView = () => {
  const navigate = useNavigate();
  const [myStories, setMyStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [notification, setNotification] = useState(null);
  
  // Fetch stories on mount
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setIsLoading(true);
        const stories = await storyService.getMyStories();
        setMyStories(stories);
      } catch (error) {
        showNotification('Error', 'Failed to fetch stories');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStories();
  }, []);

  const showNotification = (title, message) => {
    setNotification({ title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCreateNew = () => {
    navigate('/create');
  };

  const handleEdit = (story) => {
    navigate('/create', { state: { storyId: story._id } });
  };

  const handleDeleteStory = async (storyId) => {
    if (!window.confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return;
    }

    try {
      await storyService.deleteStory(storyId);
      setMyStories(stories => stories.filter(story => story._id !== storyId));
      showNotification('Success', 'Story deleted successfully');
    } catch (error) {
      showNotification('Error', 'Failed to delete story');
    }
  };

  const handleDuplicateStory = async (storyId) => {
    try {
      const duplicatedStory = await storyService.duplicateStory(storyId);
      setMyStories(stories => [...stories, duplicatedStory]);
      showNotification('Success', 'Story duplicated successfully');
    } catch (error) {
      showNotification('Error', 'Failed to duplicate story');
    }
  };

  const handleTogglePrivacy = async (story) => {
    try {
      const updatedStory = await storyService.updateStory(story._id, {
        ...story,
        isPrivate: !story.isPrivate
      });
      
      setMyStories(stories =>
        stories.map(s =>
          s._id === story._id ? updatedStory : s
        )
      );
      
      showNotification(
        'Success', 
        `Story is now ${updatedStory.isPrivate ? 'private' : 'public'}`
      );
    } catch (error) {
      showNotification('Error', 'Failed to update story privacy');
    }
  };

  const handleArchiveStory = async (story) => {
    try {
      await storyService.updateStoryStatus(story._id, 'archived');
      setMyStories(stories =>
        stories.map(s =>
          s._id === story._id ? { ...s, status: 'archived' } : s
        )
      );
      showNotification('Success', 'Story archived successfully');
    } catch (error) {
      showNotification('Error', 'Failed to archive story');
    }
  };

  const handleStoryRead = (story) => {
    navigate(`/story/${story._id}`);
  };

  const filteredStories = myStories.filter(story => {
    if (activeFilter === 'all') return true;
    return story.status === activeFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {notification && (
        <NotificationToast
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Stories</h1>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Create New Story
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-8 border-b border-gray-200">
          {[
            { id: 'all', label: 'All Stories' },
            { id: 'published', label: 'Published' },
            { id: 'draft', label: 'Drafts' },
            { id: 'archived', label: 'Archived' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
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
            <div key={story._id} className="relative">
              <StoryCard
                story={story}
                onReadClick={() => handleStoryRead(story)}
                onShare={() => {}} // Implement share functionality if needed
              />
              
              {/* Action Icons */}
              <div className="absolute bottom-4 left-4 flex items-center space-x-3">
                <button
                  onClick={() => handleTogglePrivacy(story)}
                  className="hover:scale-110 transition-transform"
                  title={story.isPrivate ? "Make Public" : "Make Private"}
                >
                  {story.isPrivate ? (
                    <Lock className="w-5 h-5 text-purple-600" />
                  ) : (
                    <Globe className="w-5 h-5 text-purple-600" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(story)}
                  className="hover:scale-110 transition-transform"
                  title="Edit Story"
                >
                  <Edit3 className="w-5 h-5 text-purple-600" />
                </button>
                <button
                  onClick={() => handleDuplicateStory(story._id)}
                  className="hover:scale-110 transition-transform"
                  title="Duplicate Story"
                >
                  <Copy className="w-5 h-5 text-purple-600" />
                </button>
                <button
                  onClick={() => handleArchiveStory(story)}
                  className="hover:scale-110 transition-transform"
                  title="Archive Story"
                >
                  <Archive className="w-5 h-5 text-purple-600" />
                </button>
                <button
                  onClick={() => handleDeleteStory(story._id)}
                  className="hover:scale-110 transition-transform"
                  title="Delete Story"
                >
                  <Trash2 className="w-5 h-5 text-purple-600" />
                </button>
              </div>
            </div>
          ))}
        </div>

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
  );
};

export default MyStoriesView;