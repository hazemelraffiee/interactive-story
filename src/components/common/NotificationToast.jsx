import React from 'react';
import { Sparkles } from 'lucide-react';

const NotificationToast = ({ title, message, onClose }) => {
  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3 animate-fade-in">
      <div className="bg-purple-100 rounded-full p-2">
        <Sparkles className="h-5 w-5 text-purple-600" />
      </div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
      <button 
        onClick={onClose}
        className="text-gray-400 hover:text-gray-500"
      >
        ×
      </button>
    </div>
  );
};

export default NotificationToast;