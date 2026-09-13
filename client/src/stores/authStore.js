// ============================================
// AUTH STORE - manages login state globally
// ============================================

import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  getters: {
    // Check if user is logged in
    isLoggedIn: (state) => !!state.token,
    // Get current user
    currentUser: (state) => state.user,
    // Check if user is admin
    isAdmin: (state) => state.user?.role === 'admin' || state.user?.email === 'admin@gmail.com'
  },

  actions: {
    // FETCH CURRENT USER PROFILE
    async fetchCurrentUser() {
      if (!this.token) return null;
      try {
        const { data } = await api.get('/auth/me');
        if (data) {
          this.user = data;
          localStorage.setItem('user', JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('Could not sync user profile:', err.message);
      }
      return this.user;
    },

    // REGISTER
    async register(username, email, password, role = 'student') {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.post('/auth/register', { username, email, password, role });
        
        // If it's a teacher, we don't log them in yet because they need approval
        if (role === 'teacher') {
          return { success: true, message: 'Account created! Please wait for admin approval.' };
        }

        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true };
      } catch (err) {
        this.error = err.response?.data?.message || 'Registration failed';
        return { success: false };
      } finally {
        this.loading = false;
      }
    },

    // LOGIN
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.post('/auth/login', { email, password });
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      } catch (err) {
        this.error = err.response?.data?.message || 'Login failed';
        return false;
      } finally {
        this.loading = false;
      }
    },

    // LOGIN WITH GOOGLE
    async loginWithGoogle(googleData) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.post('/auth/google', googleData);
        if (data.pendingApproval) {
          return { success: true, pendingApproval: true, message: data.message };
        }
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } catch (err) {
        this.error = err.response?.data?.message || 'Google authentication failed';
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    // LOGOUT
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});
