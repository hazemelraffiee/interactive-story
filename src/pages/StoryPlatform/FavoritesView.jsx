import React from 'react';
import { Heart, BookOpen } from 'lucide-react';
import StoryCard from '../../components/story/StoryCard';

const FavoritesView = ({ onStoryRead, onLike, onSave, onShare }) => {
  // Placeholder data for favorite stories
  const favoriteStories = [
    {
      id: 'fav-1',
      title: "The Last Algorithm",
      author: "Maya Chen",
      authorBadge: "AI Expert",
      excerpt: "In a world where AI has evolved beyond human comprehension, one developer must navigate the complex landscape of machine consciousness...",
      likes: 8432,
      views: 23567,
      forks: 342,
      thumbnail: "/api/placeholder/800/400",
      tags: ["Sci-Fi", "AI", "Technology"],
      readTime: "12 min",
      rating: 4.9,
      reviewCount: 567,
      completionRate: 85,
      achievements: ["Top Rated", "Most Saved"],
      comments: 234,
      lastActive: "1 day ago"
    },
    {
      id: 'fav-2',
      title: "Echoes of Magic",
      author: "James Walker",
      authorBadge: "Master Storyteller",
      excerpt: "Deep in the heart of an ancient forest, where technology and magic intertwine, a young apprentice discovers a secret that could change everything...",
      likes: 6789,
      views: 18234,
      forks: 156,
      thumbnail: "/api/placeholder/800/400",
      tags: ["Fantasy", "Magic", "Adventure"],
      readTime: "20 min",
      rating: 4.7,
      reviewCount: 345,
      completionRate: 92,
      achievements: ["Editor's Pick"],
      comments: 178,
      lastActive: "3 hours ago"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <Heart className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2 text-purple-600 mb-2">
              <Heart className="w-5 h-5" />
              <span className="font-medium">Liked Stories</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">24</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2 text-purple-600 mb-2">
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Currently Reading</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">3</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2 text-purple-600 mb-2">
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Completed Stories</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">18</p>
          </div>
        </div>

        {/* Stories Grid */}
        <div className="space-y-6">
          {favoriteStories.map(story => (
            <StoryCard
              key={story.id}
              story={story}
              isLiked={true}
              isSaved={true}
              onLike={() => onLike(story.id)}
              onSave={() => onSave(story.id)}
              onShare={() => onShare(story)}
              onReadClick={() => onStoryRead(story)}
            />
          ))}
        </div>

        {/* Empty State (when no favorites) */}
        {favoriteStories.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-500">
              Stories you like will appear here. Start exploring to find your next favorite story!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesView;