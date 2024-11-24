import React from 'react';
import { Search, Filter } from 'lucide-react';

const SearchBar = ({
  value = '',
  onChange = () => {},
  onFilterClick = () => {}
}) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Search for stories, authors, or tags..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-50 text-gray-800 placeholder-gray-500 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <Search className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" />
      </div>
      <button
        onClick={onFilterClick}
        className="p-3 text-gray-600 hover:bg-gray-200 rounded-lg"
      >
        <Filter className="w-5 h-5" />
      </button>
    </div>
  );
};

export default SearchBar;