import axios from 'axios';
import Cookies from 'js-cookie';

// Use environment variable for API URL, fallback to local backend for development
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This is important for handling cookies
});

// Add response interceptor to catch 401 errors and auto-logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear session token cookie
      Cookies.remove('session_token');
      
      // Only redirect if we're not already on the login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 