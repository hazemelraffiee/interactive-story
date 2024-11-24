import React from 'react';
import { Award, Flame, Trophy } from 'lucide-react';

const AchievementBadge = ({ achievement }) => {
  const getIcon = () => {
    switch (achievement) {
      case "Editor's Choice":
        return <Award className="w-4 h-4 text-yellow-500" />;
      case "Trending":
        return <Flame className="w-4 h-4 text-red-500" />;
      default:
        return <Trophy className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="flex items-center space-x-2 bg-gray-100 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
      {getIcon()}
      <span className="text-sm font-medium text-gray-800">{achievement}</span>
    </div>
  );
};

export default AchievementBadge;