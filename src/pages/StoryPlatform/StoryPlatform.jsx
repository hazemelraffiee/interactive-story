import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { TrendingUp, Clock, Star } from 'lucide-react';

// Import Components
import Navigation from '../../components/layout/Navigation';
import NotificationToast from '../../components/common/NotificationToast';
import HeroSection from '../../components/sections/HeroSection';
import InteractiveStoryViewer from '../../components/story/InteractiveStoryViewer';
import StoryDesigner from '../../components/story/StoryDesigner';
import StoryCard from '../../components/story/StoryCard';
import FavoritesView from './FavoritesView';
import MyStoriesView from './MyStoriesView';

const BrowseView = ({ storyInteractionProps, showNotification, setShowNotification, searchQuery, setSearchQuery, selectedGenre, setSelectedGenre, activeFilter, setActiveFilter, featuredStories, likedStories, savedStories }) => (
  <>
    {showNotification && (
      <NotificationToast
        title="New Story Alert!"
        message='"The Quantum Paradox" just launched'
        onClose={() => setShowNotification(false)}
      />
    )}

    <HeroSection
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      selectedGenre={selectedGenre}
      onGenreSelect={setSelectedGenre}
      onFilterClick={() => console.log('Filter clicked')}
    />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Featured Stories</h2>
        <div className="flex space-x-2">
          {[
            { icon: TrendingUp, label: 'trending' },
            { icon: Clock, label: 'recent' },
            { icon: Star, label: 'top' }
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              onClick={() => setActiveFilter(label)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                activeFilter === label
                  ? 'bg-purple-100 text-purple-600'
                  : 'hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="capitalize hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {featuredStories.map(story => (
        <StoryCard
          key={story.id}
          story={story}
          isLiked={likedStories.has(story.id)}
          isSaved={savedStories.has(story.id)}
          {...storyInteractionProps}
        />
      ))}
    </div>
  </>
);

const StoryPlatform = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('trending');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [showNotification, setShowNotification] = useState(false);
  const [likedStories, setLikedStories] = useState(new Set());
  const [savedStories, setSavedStories] = useState(new Set());
  const [selectedStory, setSelectedStory] = useState(null);

  // Demo featured stories data
  const featuredStories = [
    {
      id: 'featured-1',
      title: "The Chronicles of Tomorrow",
      author: "Elena Martinez",
      authorBadge: "Bestseller",
      excerpt: "An epic tale of humanity's journey to the stars, where every decision shapes the fate of civilizations...",
      likes: 12340,
      views: 56780,
      forks: 890,
      thumbnail: "/api/placeholder/800/400",
      tags: ["Sci-Fi", "Adventure"],
      readTime: "15 min",
      isLiked: true,
      rating: 4.8,
      reviewCount: 1234,
      completionRate: 92,
      achievements: ["Editor's Choice", "Top Story 2024"],
      comments: 456,
      lastActive: "2 hours ago"
    },
    {
      id: 'featured-2',
      title: "Whispers in the Code",
      author: "Alex Chen",
      authorBadge: "Rising Star",
      excerpt: "A cyberpunk thriller where reality and virtual worlds collide...",
      likes: 8976,
      views: 34567,
      forks: 654,
      thumbnail: "/api/placeholder/800/400",
      tags: ["Cyberpunk", "Mystery"],
      readTime: "18 min",
      isLiked: false,
      rating: 4.7,
      reviewCount: 876,
      completionRate: 88,
      achievements: ["Trending", "Most Interactive"],
      comments: 321,
      lastActive: "5 minutes ago"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleStoryLike = (storyId) => {
    setLikedStories(prev => {
      const newSet = new Set(prev);
      newSet.has(storyId) ? newSet.delete(storyId) : newSet.add(storyId);
      return newSet;
    });
  };

  const handleStorySave = (storyId) => {
    setSavedStories(prev => {
      const newSet = new Set(prev);
      newSet.has(storyId) ? newSet.delete(storyId) : newSet.add(storyId);
      return newSet;
    });
  };

  const handleStoryShare = (story) => {
    console.log('Sharing story:', story.title);
  };

  const handleStoryRead = (story) => {
    setSelectedStory(story);
    navigate(`/story/${story.id}`);
  };

  const storyInteractionProps = {
    onStoryRead: handleStoryRead,
    onLike: handleStoryLike,
    onSave: handleStorySave,
    onShare: handleStoryShare
  };

  return (
    <div className="bg-gray-50">
      <Navigation />
      <Routes>
        <Route 
          path="/" 
          element={
            <BrowseView 
              storyInteractionProps={storyInteractionProps}
              showNotification={showNotification}
              setShowNotification={setShowNotification}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedGenre={selectedGenre}
              setSelectedGenre={setSelectedGenre}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              featuredStories={featuredStories}
              likedStories={likedStories}
              savedStories={savedStories}
            />
          } 
        />
        <Route path="/create" element={<StoryDesigner />} />
        <Route path="/mystories" element={<MyStoriesView {...storyInteractionProps} />} />
        <Route path="/favorites" element={<FavoritesView {...storyInteractionProps} />} />
        <Route 
          path="/story/:storyId" 
          element={<InteractiveStoryViewer story={selectedStory} />} 
        />
      </Routes>
    </div>
  );
};

export default StoryPlatform;