import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserProfile } from '../services/userService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requiresProfile, setRequiresProfile] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user profile from Firestore
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          
          // Store user data in sessionStorage
          const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            profile: profile
          };
          sessionStorage.setItem('userData', JSON.stringify(userData));
          
          // Set whether profile completion is required
          setRequiresProfile(profile && !profile.profileCompleted);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
        setRequiresProfile(false);
        // Clear sessionStorage when user logs out
        sessionStorage.removeItem('userData');
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    setUserProfile,
    loading,
    requiresProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 