import axiosInstance from '../utils/axiosConfig';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const createUserProfile = async (uid, userData) => {
  try {
    const response = await axiosInstance.post(`/users/${uid}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (uid) => {
  try {
    const response = await axiosInstance.get(`/users/${uid}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid, userData) => {
  try {
    const response = await axiosInstance.put(`/users/${uid}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}; 