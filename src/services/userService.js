import { apiClient } from '../utils/apiClient';
import { auth } from '../firebase/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get current Firebase user ID token
const getFirebaseIdToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user found');
  }
  return await user.getIdToken(true);
};

// Special function for creating first-time user profiles
// This bypasses the apiClient to handle the issue with new user registration
export const createUserProfileDirect = async (uid, userData) => {
  try {
    console.log(`Creating user profile directly for ${uid}`);
    const token = await getFirebaseIdToken();
    
    // Incluir el uid en el cuerpo de la solicitud en lugar de en la URL
    const userDataWithUid = {
      ...userData,
      uid // Añadir el uid al objeto de datos
    };
    
    // Usar la ruta correcta según el backend: /api/users (sin el uid en la URL)
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userDataWithUid)
    });

    console.log(`Direct API call response status: ${response.status}`);
    
    if (!response.ok) {
      // Try to parse error message
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        const text = await response.text();
        errorData = { message: `Error ${response.status}: ${text.substring(0, 100)}...` };
      }
      
      throw new Error(errorData.message || `Error creating user profile: ${response.status}`);
    }
    
    // Try to parse response
    try {
      return await response.json();
    } catch (e) {
      // If not JSON, just return success
      return { success: true };
    }
  } catch (error) {
    console.error('Error in direct user profile creation:', error);
    throw error;
  }
};

export const createUserProfile = async (uid, userData) => {
  try {
    // First try with the direct method for new users
    if (userData.provider === 'google') {
      try {
        return await createUserProfileDirect(uid, userData);
      } catch (directError) {
        console.warn('Direct profile creation failed, trying through apiClient:', directError);
        // Fall through to regular method
      }
    }
    
    // Regular method using apiClient - incluir el uid en el cuerpo
    const userDataWithUid = {
      ...userData,
      uid // Añadir el uid al objeto de datos
    };
    
    // Usar la ruta correcta: /users (sin el uid en la URL)
    return await apiClient.post('/users', userDataWithUid);
  } catch (error) {
    if (error.status === 404) {
      console.error(`API endpoint not found: /users. Check if the backend server is running and the endpoint exists.`);
      throw new Error(`API endpoint not found: Please ensure the backend server is running at ${API_URL}`);
    }
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (uid) => {
  try {
    return await apiClient.get(`/users/${uid}`);
  } catch (error) {
    // If user not found, log it and rethrow
    if (error.status === 404 || error.message.includes('no encontrado')) {
      console.log(`User profile not found for uid: ${uid}`);
    }
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid, userData) => {
  try {
    return await apiClient.put(`/users/${uid}`, userData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    return await apiClient.get('/users');
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}; 