const GenrePills = ({ 
  genres = [],
  selectedGenres = ['all'],
  onGenreSelect = () => {} 
}) => {
  const handleGenreClick = (genre) => {
    const lowercaseGenre = genre.toLowerCase();
    
    // If clicking "All" or clicking the same genre that's already selected alone
    if (lowercaseGenre === 'all' || 
        (selectedGenres.length === 1 && selectedGenres[0].toLowerCase() === lowercaseGenre)) {
      onGenreSelect(['all']);
      return;
    }
    
    // If clicking a new genre when "all" is selected
    if (selectedGenres.some(g => g.toLowerCase() === 'all')) {
      onGenreSelect([lowercaseGenre]);
      return;
    }
    
    // If the genre is already selected, remove it
    if (selectedGenres.some(g => g.toLowerCase() === lowercaseGenre)) {
      const newSelected = selectedGenres.filter(g => g.toLowerCase() !== lowercaseGenre);
      onGenreSelect(newSelected.length === 0 ? ['all'] : newSelected);
      return;
    }
    
    // Add the new genre to existing selection
    onGenreSelect([...selectedGenres, lowercaseGenre]);
  };

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-4">
      {genres.map((genre) => {
        const isSelected = selectedGenres.some(g => g.toLowerCase() === genre.toLowerCase());
        
        return (
          <button
            key={genre}
            onClick={() => handleGenreClick(genre)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap 
              transition-colors ${
              isSelected
                ? 'bg-purple-100 text-purple-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {genre}
          </button>
        );
      })}
    </div>
  );
};

export default GenrePills;