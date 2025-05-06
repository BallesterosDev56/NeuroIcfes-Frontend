import { apiClient } from '../utils/apiClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const createUserProfile = async (uid, userData) => {
  try {
    return await apiClient.post(`/users/${uid}`, userData);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (uid) => {
  try {
    return await apiClient.get(`/users/${uid}`);
  } catch (error) {
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