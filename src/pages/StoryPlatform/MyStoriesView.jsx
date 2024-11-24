import React, { useState } from 'react';
import { 
  BookOpen, 
  Edit3, 
  Trash2, 
  Globe, 
  Lock,
  Copy,
  Archive
} from 'lucide-react';
import StoryCard from '../../components/story/StoryCard';

const MyStoriesView = ({ onStoryRead, onLike, onSave, onShare, onEdit }) => {

  // Demo data for my stories
  const [myStories, setMyStories] = useState([
    {
      id: 'my-story-1',
      title: "The Digital Labyrinth",
      author: "Current User",
      authorBadge: "Creator",
      excerpt: "A mind-bending journey through a virtual maze where reality and code intertwine...",
      likes: 3421,
      views: 12567,
      forks: 234,
      thumbnail: "/api/placeholder/800/400",
      tags: ["Sci-Fi", "Technology", "Mystery"],
      readTime: "25 min",
      rating: 4.6,
      reviewCount: 342,
      completionRate: 78,
      achievements: ["Rising Star"],
      comments: 156,
      lastActive: "1 hour ago",
      isPrivate: false,
      status: 'published'
    },
    {
      id: 'my-story-2',
      title: "Quantum Dreams",
      author: "Current User",
      authorBadge: "Creator",
      excerpt: "Explore the boundaries of consciousness in a world where quantum computing meets human imagination...",
      likes: 1234,
      views: 8901,
      forks: 123,
      thumbnail: "/api/placeholder/800/400",
      tags: ["Sci-Fi", "Philosophy"],
      readTime: "15 min",
      rating: 4.8,
      reviewCount: 234,
      completionRate: 92,
      achievements: ["Editor's Pick"],
      comments: 89,
      lastActive: "3 days ago",
      isPrivate: true,
      status: 'draft'
    }
  ]);

  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'published', 'draft', 'archived'

  // Story management handlers
  const handleDeleteStory = (storyId) => {
    if (window.confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      setMyStories(stories => stories.filter(story => story.id !== storyId));
    }
  };

  const handleDuplicateStory = (storyId) => {
    const originalStory = myStories.find(story => story.id === storyId);
    if (originalStory) {
      const duplicatedStory = {
        ...originalStory,
        id: `${storyId}-copy-${Date.now()}`,
        title: `${originalStory.title} (Copy)`,
        views: 0,
        likes: 0,
        comments: 0,
        forks: 0,
        status: 'draft',
        isPrivate: true
      };
      setMyStories(stories => [...stories, duplicatedStory]);
    }
  };

  const handleTogglePrivacy = (storyId) => {
    setMyStories(stories =>
      stories.map(story =>
        story.id === storyId
          ? { ...story, isPrivate: !story.isPrivate }
          : story
      )
    );
  };

  const handleArchiveStory = (storyId) => {
    setMyStories(stories =>
      stories.map(story =>
        story.id === storyId
          ? { ...story, status: 'archived' }
          : story
      )
    );
  };

  const filteredStories = myStories.filter(story => {
    if (activeFilter === 'all') return true;
    return story.status === activeFilter;
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">  {/* Account for Navigation height */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Stories</h1>
          </div>
          <button
            onClick={() => onEdit()} 
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
            <div key={story.id} className="relative">
              <StoryCard
                story={story}
                isLiked={false}
                isSaved={false}
                onLike={() => onLike(story.id)}
                onSave={() => onSave(story.id)}
                onShare={() => onShare(story)}
                onReadClick={() => onStoryRead(story)}
              />
              
              {/* Action Icons */}
              <div className="absolute bottom-4 left-4 flex items-center space-x-3">
                <button
                  onClick={() => handleTogglePrivacy(story.id)}
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
                  onClick={() => onEdit(story)}
                  className="hover:scale-110 transition-transform"
                  title="Edit Story"
                >
                  <Edit3 className="w-5 h-5 text-purple-600" />
                </button>
                <button
                  onClick={() => handleDuplicateStory(story.id)}
                  className="hover:scale-110 transition-transform"
                  title="Duplicate Story"
                >
                  <Copy className="w-5 h-5 text-purple-600" />
                </button>
                <button
                  onClick={() => handleArchiveStory(story.id)}
                  className="hover:scale-110 transition-transform"
                  title="Archive Story"
                >
                  <Archive className="w-5 h-5 text-purple-600" />
                </button>
                <button
                  onClick={() => handleDeleteStory(story.id)}
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