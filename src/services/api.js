import axios from 'axios';
import { API_BASE } from '../constants/config';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('badminton_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('badminton_token');
      localStorage.removeItem('badminton_user');
      window.location.reload();
    }
    
    // Log validation errors for debugging
    if (error.response?.status === 400 && error.response?.data?.details) {
      console.error('Validation Error:', error.response.data.details);
    }
    
    return Promise.reject(error);
  }
);

export default api;
