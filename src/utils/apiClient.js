import { getFreshToken } from './tokenManager';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new ApiError(
      data.message || 'Something went wrong',
      response.status,
      data
    );
  }
  
  return data;
};

const getHeaders = async () => {
  try {
    const token = await getFreshToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  } catch (error) {
    console.error('Error getting headers:', error);
    const existingToken = sessionStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(existingToken && { 'Authorization': `Bearer ${existingToken}` })
    };
  }
};

const fetchWithRetry = async (url, options, retryCount = 0) => {
  try {
    const headers = await getHeaders();
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options?.headers
      }
    });

    // Handle token expiration
    if (response.status === 401 && retryCount === 0) {
      // Clear the old token
      sessionStorage.removeItem('token');
      // Retry once with a fresh token
      return fetchWithRetry(url, options, retryCount + 1);
    }

    return handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && retryCount === 0) {
      // Clear session storage and redirect to login
      sessionStorage.clear();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const apiClient = {
  get: (endpoint) => 
    fetchWithRetry(`${API_URL}${endpoint}`, { method: 'GET' }),

  post: (endpoint, data) =>
    fetchWithRetry(`${API_URL}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  put: (endpoint, data) =>
    fetchWithRetry(`${API_URL}${endpoint}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  delete: (endpoint) =>
    fetchWithRetry(`${API_URL}${endpoint}`, { method: 'DELETE' }),

  patch: (endpoint, data) =>
    fetchWithRetry(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
}; 