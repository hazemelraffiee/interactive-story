import React from 'react';
import { Heart, Bookmark, Share2, Eye, MessageCircle, Copy, BadgeCheck } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';
import AchievementBadge from '../common/AchievementBadge';

const StoryCard = ({ 
  story, 
  isLiked,
  isSaved,
  onLike,
  onSave,
  onShare,
  onReadClick
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 hover:shadow-md transition-shadow">
      <div className="md:flex">
        <div className="md:flex-1 relative group">
          <img 
            src={story.thumbnail}
            alt={story.title}
            className="w-full h-64 md:h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute top-4 left-4 flex flex-col space-y-2">
            {story.achievements.map((achievement, index) => (
              <AchievementBadge 
                key={index} 
                achievement={achievement} 
              />
            ))}
          </div>
        </div>
        
        <div className="md:flex-1 p-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 hover:text-purple-600 transition-colors">
                {story.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-gray-600">by {story.author}</span>
                {story.authorBadge && (
                  <div className="flex items-center space-x-1 px-2 py-0.5 bg-purple-50 rounded-full">
                    <BadgeCheck className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-600 font-medium">{story.authorBadge}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={onSave}
                className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
                  isSaved ? 'text-purple-600' : 'text-gray-600'
                }`}
              >
                <Bookmark className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} />
              </button>
              <button 
                onClick={onLike}
                className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
                  isLiked ? 'text-red-500' : 'text-gray-600'
                }`}
              >
                <Heart className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} />
              </button>
              <button 
                onClick={onShare}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Description */}
          <p className="mt-4 text-gray-600 line-clamp-3">{story.excerpt}</p>
          
          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {story.tags.map(tag => (
              <span 
                key={tag}
                className="px-3 py-1 text-sm font-medium bg-purple-50 text-purple-600 rounded-full cursor-pointer hover:bg-purple-100 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="mt-6 space-y-4">
            {/* Stats Row */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex space-x-4">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{story.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{story.likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{story.comments}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Copy className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">{story.forks}</span>
                </div>
              </div>
              <span className="text-sm text-gray-500">{story.readTime} read</span>
            </div>

            {/* Progress Bar */}
            <ProgressBar 
              value={story.completionRate}
              label="Completion Rate"
            />

            {/* Quick Actions */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Last active {story.lastActive}
              </span>
              <button 
                onClick={onReadClick}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Read Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryCard;