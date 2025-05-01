import React from 'react';

// components/ui/ErrorMessage.jsx


export const ErrorMessage = ({ message }) => {
  return (
    <p className="mt-1 text-sm text-red-600">
      {message}
    </p>
  );
};