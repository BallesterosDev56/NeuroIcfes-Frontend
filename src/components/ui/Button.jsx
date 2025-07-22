// components/ui/Button.jsx

import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  colorScheme = 'blue',
  size = 'md',
  isFullWidth = false,
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseClasses = 'flex justify-center items-center border rounded-md shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
  
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 sm:px-4 py-2 text-sm',
    lg: 'px-4 sm:px-6 py-2.5 text-base'
  };

  const variantClasses = {
    primary: {
      blue: `bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 border-transparent text-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
      indigo: `bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 border-transparent text-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    },
    secondary: {
      blue: `bg-blue-100 hover:bg-blue-200 focus:ring-blue-500 border-transparent text-blue-700 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
      indigo: `bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500 border-transparent text-indigo-700 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    },
    outline: {
      blue: `bg-white hover:bg-gray-50 focus:ring-blue-500 border-gray-300 text-gray-700 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
      indigo: `bg-white hover:bg-gray-50 focus:ring-indigo-500 border-gray-300 text-gray-700 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    },
  };

  const widthClasses = isFullWidth ? 'w-full' : '';
  const loadingClasses = isLoading ? 'opacity-75 cursor-wait' : '';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant][colorScheme]} ${widthClasses} ${loadingClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando...
        </div>
      ) : children}
    </button>
  );
};

export default Button;



