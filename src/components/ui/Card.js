import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  const baseStyles = 'bg-white shadow rounded-lg';

  return (
    <div className={`${baseStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
