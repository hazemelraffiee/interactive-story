import React from 'react';

const ProgressBar = ({ value, label, className = '' }) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{label}</span>
          <span className="font-medium text-purple-600">{value}%</span>
        </div>
      )}
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div 
          className="bg-purple-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;