declare const localStorage: Storage;
import axios from 'axios';

const API = axios.create({
  // baseURL: 'http://localhost:3009', // Use the API URL from env
  baseURL: 'https://holdev-project.onrender.com', // Use the API URL from env
  // baseURL: 'http://192.168.0.130:3009', // Use the API URL from env
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token automatically
API.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Function to set token manually (after login)
export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('token', token);
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete API.defaults.headers.common['Authorization'];
  }
};

export default API;
