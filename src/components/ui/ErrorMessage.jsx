
// components/ui/ErrorMessage.jsx
import React from 'react';

export const ErrorMessage = ({ message }) => {
  return (
    <p className="mt-1 text-sm text-red-600">
      {message}
    </p>
  );
};