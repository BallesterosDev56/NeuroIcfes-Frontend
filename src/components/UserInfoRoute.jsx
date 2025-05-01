
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const UserInfoRoute = ({ children }) => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // If user profile is completed, redirect to home
  if (userProfile?.profileCompleted) {
    return <Navigate to="/home" />;
  }

  return children;
}; 