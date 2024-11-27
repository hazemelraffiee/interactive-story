import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Eye,
  MessageCircle,
  Copy,
  Edit3,
  Trash2,
  ChevronDown
} from 'lucide-react';
import ProgressBar from '../common/ProgressBar';
import AchievementBadge from '../common/AchievementBadge';

// Utility function to get appropriate styling for each state
// Returns Tailwind classes for different status badges
const getStateBadgeStyles = (status) => {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200';
    case 'draft':
      return 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200';
    case 'archived':
      return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200';
  }
};

// StateMenu component rendered via portal to avoid z-index and overflow issues
const StateMenu = ({ currentState, onStateChange, position = { top: 0, left: 0 }, onClose }) => {
  const menuRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);

  // Available states configuration with labels and descriptions
  const states = [
    { id: 'draft', label: 'Draft', description: 'Only visible to you' },
    { id: 'published', label: 'Published', description: 'Visible to everyone' },
    { id: 'archived', label: 'Archived', description: 'Hidden from all views' }
  ];

  // Handle closing animation before actual close
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200); // Match transition duration
  }, [onClose]);

  // Handle clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClose]);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleClose]);

  // Render menu through portal to avoid z-index issues
  return createPortal(
    <div className="relative z-50">
      {/* Semi-transparent backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 transition-opacity duration-200 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />
      
      {/* Menu content */}
      <div
        ref={menuRef}
        className={`fixed z-50 w-56 bg-white rounded-lg shadow-lg border border-gray-200 
          transition-all duration-200 ${
          isClosing 
            ? 'opacity-0 transform -translate-y-2' 
            : 'opacity-100 transform translate-y-0'
        }`}
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="state-menu-button"
      >
        <div className="py-2" role="none">
          {states.map((state, index) => (
            <button
              key={state.id}
              onClick={() => {
                if (state.id !== currentState) {
                  onStateChange(state.id);
                }
                handleClose();
              }}
              className={`w-full px-4 py-2 text-left transition-colors duration-150
                ${currentState === state.id ? 'bg-gray-50' : 'hover:bg-gray-50'}
                ${index === 0 ? 'rounded-t-lg' : ''}
                ${index === states.length - 1 ? 'rounded-b-lg' : ''}
              `}
              role="menuitem"
              aria-current={currentState === state.id}
            >
              <span className="font-medium text-gray-900">{state.label}</span>
              <span className="text-sm text-gray-500 block">{state.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

// Main StoryCard component
const StoryCard = ({ 
  story, 
  onReadClick,
  onEdit,
  onDuplicate,
  onDelete,
  onStateChange
}) => {
  const [showStateMenu, setShowStateMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isChangingState, setIsChangingState] = useState(false);
  const stateBadgeRef = useRef(null);
  
  // Extract story properties with fallbacks
  const stats = story?.stats || {};
  const views = stats.views || 0;
  const comments = stats.comments || 0;
  const completionRate = stats.completionRate || 0;
  const authorName = typeof story.author === 'object' ? story.author.username : story.author;
  const authorAvatar = story.author?.avatar;

  // Calculate menu position while ensuring it stays within viewport
  const handleStateBadgeClick = (event) => {
    event.stopPropagation();
    
    if (stateBadgeRef.current) {
      const rect = stateBadgeRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const menuWidth = 224; // w-56 = 14rem = 224px
      
      const left = Math.min(
        Math.max(rect.left + window.scrollX, 16),
        viewportWidth - menuWidth - 16
      );
      
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: left
      });
    }
    
    setShowStateMenu(true);
  };

  // Handle state changes with loading state
  const handleStateChange = async (newState) => {
    if (newState === story.status) return;
    
    setIsChangingState(true);
    try {
      await onStateChange(story._id, newState);
    } finally {
      setIsChangingState(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm mb-8 hover:shadow-md transition-shadow">
        <div className="md:flex">
          {/* Story Thumbnail Section */}
          <div className="md:flex-1 relative group">
            <img 
              src={story.thumbnail || "/api/placeholder/800/400"}
              alt={story.title}
              className="w-full h-64 md:h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Badges Container */}
            <div className="absolute top-4 left-4 flex flex-col space-y-2">
              {/* State Badge */}
              <button
                ref={stateBadgeRef}
                onClick={handleStateBadgeClick}
                disabled={isChangingState}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border 
                  transition-all duration-200 ${getStateBadgeStyles(story.status)}
                  ${isChangingState ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                id="state-menu-button"
                aria-expanded={showStateMenu}
                aria-haspopup="true"
              >
                <span className="text-sm font-medium capitalize">{story.status}</span>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform duration-200 
                    ${showStateMenu ? 'rotate-180' : 'rotate-0'}
                    ${isChangingState ? 'animate-spin' : ''}`} 
                />
              </button>
              
              {/* Achievement Badges */}
              {story.achievements?.map((achievement, index) => (
                <AchievementBadge 
                  key={index} 
                  achievement={achievement} 
                />
              ))}
            </div>
          </div>
          
          {/* Story Content Section */}
          <div className="md:flex-1 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 hover:text-purple-600 transition-colors">
                  {story.title}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  {authorAvatar && (
                    <img 
                      src={authorAvatar} 
                      alt={authorName}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-gray-600">by {authorName}</span>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <p className="mt-4 text-gray-600 line-clamp-3">{story.excerpt}</p>
            
            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {story.tags?.map(tag => (
                <span 
                  key={tag}
                  className="px-3 py-1 text-sm font-medium bg-purple-50 text-purple-600 
                    rounded-full cursor-pointer hover:bg-purple-100 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            {/* Story Stats and Actions */}
            <div className="mt-6 space-y-4">
              {/* Stats Row */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{comments.toLocaleString()}</span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{story.readTime || '5 min'} read</span>
              </div>

              {/* Progress Bar */}
              <ProgressBar 
                value={completionRate}
                label="Completion Rate"
              />

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => onEdit(story)}
                    className="hover:scale-110 transition-transform"
                    title="Edit Story"
                  >
                    <Edit3 className="w-5 h-5 text-purple-600" />
                  </button>
                  <button
                    onClick={() => onDuplicate(story._id)}
                    className="hover:scale-110 transition-transform"
                    title="Duplicate Story"
                  >
                    <Copy className="w-5 h-5 text-purple-600" />
                  </button>
                  <button
                    onClick={() => onDelete(story._id)}
                    className="hover:scale-110 transition-transform"
                    title="Delete Story"
                  >
                    <Trash2 className="w-5 h-5 text-purple-600" />
                  </button>
                </div>
                <button 
                  onClick={() => onReadClick(story)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg 
                    hover:bg-purple-700 transition-colors"
                >
                  Read Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* State Menu Portal */}
      {showStateMenu && (
        <StateMenu
          currentState={story.status}
          onStateChange={handleStateChange}
          position={menuPosition}
          onClose={() => setShowStateMenu(false)}
        />
      )}
    </>
  );
};

export default StoryCard;