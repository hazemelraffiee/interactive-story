import React from 'react';
import { 
  BookOpen, 
  Heart,
  PenTool, 
  Coffee, 
  Settings, 
  User,
  Zap,
  BookMarked
} from 'lucide-react';

const Navigation = ({ onCreateClick, onHomeClick, onMyStoriesClick, onFavoritesClick }) => {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Left Navigation */}
          <div className="flex items-center">
            <div 
              className="flex-shrink-0 flex items-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={onHomeClick}
              role="button"
              aria-label="Return to home"
            >
              <div className="relative">
                <BookOpen className="h-8 w-8 text-purple-600" />
                <div className="absolute -top-1 -right-1 bg-purple-100 rounded-full p-1">
                  <Zap className="h-3 w-3 text-purple-600" />
                </div>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">StoryLab</span>
            </div>
            
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={onMyStoriesClick}
                  className="text-gray-500 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
                >
                  <BookMarked className="h-5 w-5" />
                  <span>My Stories</span>
                </button>
                <button 
                  onClick={onFavoritesClick}
                  className="text-gray-500 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
                >
                  <Heart className="h-5 w-5 stroke-2" />
                  <span>Favorites</span>
                </button>
                <button 
                  onClick={onCreateClick}
                  className="text-gray-500 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
                >
                  <PenTool className="h-5 w-5" />
                  <span>Create</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg">
              <Coffee className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <Settings className="h-5 w-5" />
            </button>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;