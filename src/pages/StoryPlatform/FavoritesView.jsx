import React from 'react';
import { 
  Heart, 
  BookOpen, 
  Clock, 
  Trophy,
  ListFilter,
  Grid,
  BookOpenCheck
} from 'lucide-react';
import StoryCard from '../../components/story/StoryCard';

const StatsCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center space-x-2 text-purple-600 mb-1 lg:mb-2">
      <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
      <span className="font-medium text-sm lg:text-base truncate">{label}</span>
    </div>
    <p className="text-xl lg:text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

const ViewToggle = ({ view, setView }) => (
  <div className="flex items-center bg-white rounded-lg p-1 shadow-sm">
    <button
      onClick={() => setView('grid')}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
        view === 'grid'
          ? 'bg-purple-100 text-purple-600'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Grid className="w-4 h-4" />
      <span className="text-sm font-medium">Grid</span>
    </button>
    <button
      onClick={() => setView('list')}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
        view === 'list'
          ? 'bg-purple-100 text-purple-600'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <ListFilter className="w-4 h-4" />
      <span className="text-sm font-medium">List</span>
    </button>
  </div>
);

const FilterTabs = ({ activeFilter, setActiveFilter }) => {
  const filters = [
    { id: 'all', label: 'All Stories', count: 24 },
    { id: 'reading', label: 'Currently Reading', count: 3 },
    { id: 'completed', label: 'Completed', count: 18 },
    { id: 'bookmarked', label: 'Bookmarked', count: 7 }
  ];

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 hide-scrollbar">
      {filters.map(filter => (
        <button
          key={filter.id}
          onClick={() => setActiveFilter(filter.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            activeFilter === filter.id
              ? 'bg-purple-100 text-purple-600'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span className="text-sm font-medium">{filter.label}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/50">
            {filter.count}
          </span>
        </button>
      ))}
    </div>
  );
};

const FavoritesView = ({ onStoryRead, onLike, onSave, onShare }) => {
  const [view, setView] = React.useState('grid');
  const [activeFilter, setActiveFilter] = React.useState('all');

  // Sample data - In a real app, this would come from props or an API
  const statsData = [
    { icon: BookOpen, label: 'Currently Reading', value: '3' },
    { icon: BookOpenCheck, label: 'Completed', value: '18' },
    { icon: Clock, label: 'Reading Time', value: '12h' },
    { icon: Trophy, label: 'Achievements', value: '7' }
  ];

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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Heart className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
          </div>
          <ViewToggle view={view} setView={setView} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statsData.map((stat, index) => (
            <StatsCard
              key={index}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              trend={stat.trend}
            />
          ))}
        </div>

        {/* Filters */}
        <div className="mb-8">
          <FilterTabs activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        </div>

        {/* Stories Grid/List */}
        <div className={`space-y-6 ${view === 'grid' ? 'md:space-y-8' : ''}`}>
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

        {/* Empty State */}
        {favoriteStories.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Stories you like will appear here. Start exploring to find your next favorite story!
            </p>
          </div>
        )}
      </div>

      {/* Add custom scrollbar styles */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default FavoritesView;