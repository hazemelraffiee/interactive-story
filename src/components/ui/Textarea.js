import React from 'react';

const Textarea = ({ className = '', rows = 4, ...props }) => {
  const baseStyles = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300';

  return (
    <textarea
      className={`${baseStyles} ${className}`}
      rows={rows}
      {...props}
    />
  );
};

export default Textarea;
