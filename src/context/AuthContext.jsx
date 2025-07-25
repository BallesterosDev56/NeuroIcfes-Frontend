import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserProfile } from '../services/userService';
import { getFreshToken } from '../utils/tokenManager';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requiresProfile, setRequiresProfile] = useState(false);
  const [authError, setAuthError] = useState(null);

  const clearAuthState = () => {
    setCurrentUser(null);
    setUserProfile(null);
    setRequiresProfile(false);
    setAuthError(null);
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('token');
  };

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      try {
        if (user) {
          setLoading(true);
          
          // Get fresh token
          const token = await getFreshToken();
          if (!token) {
            throw new Error('No se pudo obtener el token de autenticación');
          }
          
          // Get user profile
          try {
            const profile = await getUserProfile(user.uid);
            if (isMounted) {
              setUserProfile(profile);
              setRequiresProfile(!profile || !profile.profileCompleted);
              
              // Update session storage
              const userData = {
                ...user,
                role: profile?.role || 'user'
              };
              sessionStorage.setItem('userData', JSON.stringify(userData));
            }
          } catch (error) {
            if (error.status === 404 || error.message.includes('Usuario no encontrado')) {
              setRequiresProfile(true);
            } else {
              throw error;
            }
          }
          
          if (isMounted) {
            setCurrentUser(user);
            setAuthError(null);
          }
        } else {
          if (isMounted) {
            clearAuthState();
          }
        }
      } catch (error) {
        console.error('Error en AuthContext:', error);
        if (isMounted) {
          setAuthError(error.message);
          clearAuthState();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const updateUserProfile = async (profileData) => {
    try {
      const uid = profileData?.uid || currentUser?.uid;
      
      if (!uid) {
        throw new Error('No hay ID de usuario disponible para actualizar el perfil');
      }
      
      const updatedProfile = await getUserProfile(uid);
      
      setUserProfile(updatedProfile);
      setRequiresProfile(!updatedProfile || !updatedProfile.profileCompleted);
      
      const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
      userData.profile = updatedProfile;
      userData.role = updatedProfile?.role || 'user';
      sessionStorage.setItem('userData', JSON.stringify(userData));
      
      return updatedProfile;
    } catch (error) {
      console.error('Error al actualizar el perfil en el contexto:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userProfile,
    setUserProfile: updateUserProfile,
    loading,
    requiresProfile,
    authError,
    user: userProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 