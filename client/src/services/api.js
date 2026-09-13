// ============================================
// AXIOS CONFIGURATION - talks to our backend
// ============================================

import axios from 'axios';

// Create axios instance with base URL
export const BASE_URL = import.meta.env.VITE_API_URL || 'https://learn-hub-x0ol.onrender.com';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' }
});

// Automatically attach JWT token and guest ID to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Attach persistent guest ID for unauthenticated visitors
  let guestId = localStorage.getItem('learnhub_guest_id');
  if (!guestId) {
    guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('learnhub_guest_id', guestId);
  }
  config.headers['x-guest-id'] = guestId;

  return config;
});

// Handle expired token only when an authenticated session was present
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if user thought they were logged in with a token
    const hadToken = localStorage.getItem('token');
    if (error.response?.status === 401 && hadToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
