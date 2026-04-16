import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { API_URL } from './constants';

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ---------------------------------------------------------------------------
// Request interceptor — attach Bearer token
// ---------------------------------------------------------------------------

api.interceptors.request.use(async (config) => {
  try {
    const token =
      Platform.OS === 'web'
        ? localStorage.getItem('auth_token')
        : await SecureStore.getItemAsync('auth_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // No token available — continue without auth header
  }
  return config;
});

// ---------------------------------------------------------------------------
// Response interceptor — handle 401 (force re-login)
// ---------------------------------------------------------------------------

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const { useAuthStore } = await import('./store/authStore');
        useAuthStore.getState().logout();
      } catch {
        // Store not available yet — silently ignore
      }
    }
    return Promise.reject(error);
  },
);

// ---------------------------------------------------------------------------
// Helper — unwrap Axios response to return `.data` directly
// ---------------------------------------------------------------------------

const unwrap = (promise) => promise.then((res) => res.data);

// ===========================================================================
// Auth
// ===========================================================================

export const sendOtp = (phone) =>
  unwrap(api.post('/auth/send-otp', { phone }));

export const verifyOtp = ({ phone, otp, role, name }) =>
  unwrap(api.post('/auth/verify-otp', { phone, otp, role, name }));

export const getMe = () => unwrap(api.get('/auth/me'));

// ===========================================================================
// Delivery Partner Profile
// ===========================================================================

export const getDeliveryMe = () => unwrap(api.get('/delivery/me'));

export const updateDeliveryMe = (data) =>
  unwrap(api.patch('/delivery/me', data));

// ===========================================================================
// Delivery Orders
// ===========================================================================

export const getDeliveryOrders = (params) =>
  unwrap(api.get('/delivery/orders', { params }));

export const getDeliveryOrder = (id) =>
  unwrap(api.get(`/delivery/orders/${id}`));

export const updateOrderStatus = (id, status) =>
  unwrap(api.patch(`/delivery/orders/${id}/status`, { status }));

export default api;
