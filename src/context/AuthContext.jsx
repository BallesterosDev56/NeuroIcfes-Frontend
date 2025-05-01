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
          // Get user profile from backend
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          
          // Store user data in sessionStorage
          sessionStorage.setItem('userData', JSON.stringify(profile));
          
          // Set whether profile completion is required
          setRequiresProfile(!profile || !profile.profileCompleted);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Si hay un error al obtener el perfil, asumimos que necesita completarlo
          setRequiresProfile(true);
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

  // Función para actualizar el perfil del usuario
  const updateUserProfile = async (profileData) => {
    try {
      const updatedProfile = await getUserProfile(currentUser.uid);
      setUserProfile(updatedProfile);
      setRequiresProfile(!updatedProfile || !updatedProfile.profileCompleted);
      
      // Actualizar también en sessionStorage
      const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
      userData.profile = updatedProfile;
      sessionStorage.setItem('userData', JSON.stringify(userData));
      
      return updatedProfile;
    } catch (error) {
      console.error('Error updating user profile in context:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userProfile,
    setUserProfile: updateUserProfile,
    loading,
    requiresProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 