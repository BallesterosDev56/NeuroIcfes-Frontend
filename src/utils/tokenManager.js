import { auth } from '../firebase/auth';

// Function to get a fresh token
export const getFreshToken = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    
    // Force token refresh
    const token = await user.getIdToken(true);
    sessionStorage.setItem('token', token);
    return token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

// Function to check if token needs refresh (tokens expire after 1 hour)
export const shouldRefreshToken = () => {
  const token = sessionStorage.getItem('token');
  if (!token) return true;

  try {
    // Decode the token to get expiration time
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    // Refresh if token expires in less than 5 minutes
    return expirationTime - currentTime < 5 * 60 * 1000;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

// Function to ensure we have a valid token
export const ensureValidToken = async () => {
  if (shouldRefreshToken()) {
    return await getFreshToken();
  }
  return sessionStorage.getItem('token');
};

// Function to handle token refresh and retry failed requests
export const handleTokenRefresh = async (error, retryRequest) => {
  if (error?.response?.status === 401 && error?.response?.data?.message?.includes('token has expired')) {
    try {
      // Get a fresh token
      const newToken = await getFreshToken();
      
      // Retry the original request with the new token
      if (retryRequest) {
        return await retryRequest(newToken);
      }
    } catch (refreshError) {
      console.error('Error refreshing token:', refreshError);
      // If token refresh fails, redirect to login
      window.location.href = '/login';
    }
  }
  throw error;
}; 