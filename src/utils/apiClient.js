import { getFreshToken } from './tokenManager';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('API_URL configured as:', API_URL);

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const handleResponse = async (response) => {
  let data;
  
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.log('Non-JSON response:', text);
      data = { message: 'Invalid response format', rawResponse: text };
    }
  } catch (error) {
    // Handle case where response is not valid JSON
    console.error('Error parsing response:', error);
    throw new ApiError(
      `Invalid response format (${response.status})`,
      response.status,
      { originalError: error.message }
    );
  }
  
  if (!response.ok) {
    console.error(`API Error (${response.status})`, data);
    // For 404 errors related to users, provide a more specific message
    if (response.status === 404 && response.url.includes('/users/')) {
      throw new ApiError(
        'Usuario no encontrado',
        404,
        data || {}
      );
    }
    
    throw new ApiError(
      data?.message || `Error ${response.status}`,
      response.status,
      data || {}
    );
  }
  
  return data;
};

const getHeaders = async () => {
  try {
    const token = await getFreshToken();
    console.log('Obtained fresh token for request');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  } catch (error) {
    console.error('Error getting fresh token:', error);
    const existingToken = sessionStorage.getItem('token');
    if (existingToken) {
      console.log('Using existing token from sessionStorage');
    } else {
      console.warn('No token available for request');
    }
    return {
      'Content-Type': 'application/json',
      ...(existingToken && { 'Authorization': `Bearer ${existingToken}` })
    };
  }
};

const fetchWithRetry = async (url, options, retryCount = 0) => {
  try {
    const headers = await getHeaders();
    console.log(`Making ${options.method} request to ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options?.headers
      }
    });

    console.log(`Received ${response.status} response from ${url}`);

    // Handle token expiration
    if (response.status === 401 && retryCount === 0) {
      console.log('Unauthorized response, clearing token and retrying');
      // Clear the old token
      sessionStorage.removeItem('token');
      // Retry once with a fresh token
      return fetchWithRetry(url, options, retryCount + 1);
    }

    return handleResponse(response);
  } catch (error) {
    console.error('Fetch error:', error);
    if (error instanceof ApiError && error.status === 401 && retryCount === 0) {
      // Clear session storage and redirect to login
      console.warn('Authentication failed, redirecting to login');
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