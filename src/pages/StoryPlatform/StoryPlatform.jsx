import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { TrendingUp, Clock, Star, Loader, AlertCircle, BookOpen } from 'lucide-react';

// Import Components
import Navigation from '../../components/layout/Navigation';
import NotificationToast from '../../components/common/NotificationToast';
import HeroSection from '../../components/sections/HeroSection';
import InteractiveStoryViewer from '../Viewer/InteractiveStoryViewer';
import StoryDesigner from '../Designer/StoryDesigner';
import StoryCard from '../../components/common/StoryCard';
import FavoritesView from './FavoritesView';
import MyStoriesView from './MyStoriesView';
import storyService from '../../services/storyService';

const BrowseView = ({
  showNotification,
  setShowNotification,
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  stories,
  setStories,
  isLoading,
  error,
  savedStories,
  selectedGenres,
  onGenreSelect,
  availableGenres,
}) => {

  const handleStoryUpdate = (update, deletedId) => {
    if (deletedId) {
      // Handle deletion
      setStories(stories => stories.filter(story => story._id !== deletedId));
    } else if (update) {
      setStories(stories => {
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
  
  return (
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
        selectedGenres={selectedGenres}
        onGenreSelect={onGenreSelect}
        genres={availableGenres}
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
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${activeFilter === label
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to load stories
            </h3>
            <p className="text-gray-500">{error}</p>
          </div>
        )}

        {/* Stories Grid */}
        {!isLoading && !error && stories.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No stories found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or check back later for new stories
            </p>
          </div>
        )}

        {!isLoading && !error && stories.map(story => (
          <StoryCard
            key={story._id}
            story={story}
            onUpdate={handleStoryUpdate}
          />
        ))}
      </div>
    </>
  )
};

const StoryPlatform = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('trending');
  const [showNotification, setShowNotification] = useState(false);
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedGenres, setSelectedGenres] = useState(['all']);
  const [availableGenres, setAvailableGenres] = useState(['all']);

  // Fetch available genres when component mounts
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genres = await storyService.getGenres();
        const normalizedGenres = ['all', ...genres.map(genre => genre.toLowerCase())];
        setAvailableGenres(normalizedGenres);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    };
    fetchGenres();
  }, []);

  // Fetch stories when filters change
  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Only pass selected genres if they're not 'all'
        const genresToFetch = selectedGenres.includes('all') ?
          'all' : selectedGenres;
        const fetchedStories = await storyService.getPublicStories(
          genresToFetch,
          activeFilter
        );
        setStories(fetchedStories);
      } catch (err) {
        setError('Failed to load stories. Please try again later.');
        console.error('Error fetching stories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, [selectedGenres, activeFilter]);

  // Filter stories based on search query
  const filteredStories = stories.filter(story =>
    story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    story.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    story.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-gray-50">
      <Navigation />
      <Routes>
        <Route
          path="/"
          element={
            <BrowseView
              showNotification={showNotification}
              setShowNotification={setShowNotification}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              stories={filteredStories}
              setStories={setStories}
              isLoading={isLoading}
              error={error}
              selectedGenres={selectedGenres}
              onGenreSelect={setSelectedGenres}
              availableGenres={availableGenres}
            />
          }
        />
        <Route path="/create" element={<StoryDesigner />} />
        <Route path="/mystories" element={<MyStoriesView />} />
        <Route path="/favorites" element={<FavoritesView />} />
        <Route
          path="/story/:storyId"
          element={<InteractiveStoryViewer />}
        />
      </Routes>
    </div>
  );
};

export default StoryPlatform;