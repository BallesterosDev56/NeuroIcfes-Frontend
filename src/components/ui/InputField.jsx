// components/ui/InputField.jsx
import React from 'react';

export const InputField = React.forwardRef(
  ({ label, id, error, icon, ...props }, ref) => {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={`appearance-none block w-full px-3 py-2 border ${
              error ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              icon ? 'pl-10' : ''
            }`}
            {...props}
          />
        </div>
      </div>
    );
  }
);