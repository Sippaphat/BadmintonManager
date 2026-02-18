import React from 'react';

const Input = ({ 
  type = 'text', 
  value, 
  onChange, 
  placeholder = '', 
  label = '',
  error = '',
  icon = null,
  className = '',
  fullWidth = false,
  disabled = false,
  ...props 
}) => {
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <div className={`flex flex-col gap-1 ${widthClass}`}>
      {label && (
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            px-4 py-2.5 rounded-lg border-2 border-gray-200
            bg-white text-gray-900
            focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${widthClass}
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          {...props}
        />
      </div>
      {error && (
        <span className="text-sm text-red-500 mt-1">{error}</span>
      )}
    </div>
  );
};

export default Input;
