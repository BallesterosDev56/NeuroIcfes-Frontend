import axios from 'axios';
import { getFreshToken, shouldRefreshToken, handleTokenRefresh } from './tokenManager';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Always check if token needs refresh before making a request
      const token = await getFreshToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      // If we can't get a fresh token, try to use existing one
      const existingToken = sessionStorage.getItem('token');
      if (existingToken) {
        config.headers.Authorization = `Bearer ${existingToken}`;
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

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token and retry request
        const newToken = await getFreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear session storage and redirect to login
        sessionStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error);
      // Optionally redirect to an unauthorized page
      window.location.href = '/unauthorized';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 