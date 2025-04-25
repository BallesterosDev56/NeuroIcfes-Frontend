import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProfileGuard = ({ children }) => {
  const { requiresProfile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && requiresProfile) {
      navigate('/user-info');
    }
  }, [loading, requiresProfile, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
}; 