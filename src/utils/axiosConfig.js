import axios from 'axios';
import { getFreshToken, shouldRefreshToken } from './tokenManager';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Check if token needs refresh
    if (shouldRefreshToken()) {
      try {
        const newToken = await getFreshToken();
        config.headers.Authorization = `Bearer ${newToken}`;
      } catch (error) {
        console.error('Error refreshing token:', error);
        // If token refresh fails, try to use existing token
        const existingToken = sessionStorage.getItem('token');
        if (existingToken) {
          config.headers.Authorization = `Bearer ${existingToken}`;
        }
      }
    } else {
      // Use existing token
      const token = sessionStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const newToken = await getFreshToken();
        
        // Update the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If token refresh fails, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 