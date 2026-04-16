import API from './api.js';

export const login = async (credentials) => {
  const response = await API.post('/auth/Login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await API.post('/auth/Register', userData);
  return response.data;
};

export const setAuthToken = (token) => {
  API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  delete API.defaults.headers.common['Authorization'];
};

