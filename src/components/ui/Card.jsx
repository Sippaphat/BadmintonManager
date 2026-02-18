import React from 'react';

const Card = ({ 
  children, 
  title = '', 
  subtitle = '',
  className = '',
  padding = true,
  hover = false,
  onClick = null,
}) => {
  const hoverClass = hover ? 'hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer' : '';
  const clickClass = onClick ? 'cursor-pointer' : '';
  const paddingClass = padding ? 'p-4' : '';
  
  return (
    <div 
      className={`
        bg-white dark:bg-dark-card
        rounded-xl shadow-md
        ${paddingClass}
        ${hoverClass}
        ${clickClass}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
