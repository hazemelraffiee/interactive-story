import React from 'react';
import SearchBar from '../common/GenrePills';
import GenrePills from '../common/GenrePills';

const HeroSection = ({ 
  searchQuery = '', 
  onSearchChange = () => {},
  selectedGenre = 'all',
  onGenreSelect = () => {},
  onFilterClick = () => {} 
}) => {
  const genres = [
    "All", 
    "Fantasy", 
    "Sci-Fi", 
    "Mystery", 
    "Romance", 
    "Adventure",
    "Horror", 
    "Historical", 
    "Comedy", 
    "Drama"
  ];

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

        {/* Genre Pills */}
        <GenrePills
          genres={genres}
          selectedGenre={selectedGenre}
          onGenreSelect={onGenreSelect}
        />
      </div>
    </div>
  );
};

export default HeroSection;