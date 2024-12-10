import React, { useEffect, useState } from 'react';
import SearchBar from '../common/SearchBar';
import GenrePills from '../common/GenrePills';
import { Loader } from 'lucide-react';
import storyService from '../../services/storyService';

const HeroSection = ({ 
  searchQuery = '', 
  onSearchChange = () => {},
  selectedGenres = ['all'],
  onGenreSelect = () => {},
  onFilterClick = () => {} 
}) => {
  const [genres, setGenres] = useState(['all']);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setIsLoading(true);
        const fetchedGenres = await storyService.getGenres();
        // Capitalize first letter of each genre and 'All'
        setGenres(['All', ...fetchedGenres.map(genre => 
          genre.charAt(0).toUpperCase() + genre.slice(1).toLowerCase()
        )]);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
        setError('Failed to load genres');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenres();
  }, []);

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Discover Interactive Stories
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Explore thousands of interactive stories or create your own adventure
        </p>
        
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            onFilterClick={onFilterClick}
          />
        </div>

        {/* Genre Pills with Loading and Error States */}
        {isLoading ? (
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Loading genres...</span>
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <GenrePills
            genres={genres}
            selectedGenres={selectedGenres}
            onGenreSelect={onGenreSelect}
          />
        )}
      </div>
    </div>
  );
};

export default HeroSection;