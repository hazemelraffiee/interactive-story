import React from 'react';

const GenrePills = ({ 
  genres = ["All", "Fantasy", "Sci-Fi", "Mystery", "Romance", "Adventure", "Horror", "Historical", "Comedy", "Drama"],
  selectedGenre = 'all',
  onGenreSelect = () => {} 
}) => {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-4">
      {genres.map((genre) => (
        <button
          key={genre}
          onClick={() => onGenreSelect(genre.toLowerCase())}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
            selectedGenre === genre.toLowerCase()
              ? 'bg-purple-100 text-purple-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {genre}
        </button>
      ))}
    </div>
  );
};

export default GenrePills;