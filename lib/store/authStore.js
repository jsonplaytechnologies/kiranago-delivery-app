import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { getMe, getDeliveryMe } from '../api';

// ---------------------------------------------------------------------------
// Helpers — abstract SecureStore vs localStorage (web fallback)
// ---------------------------------------------------------------------------

const TOKEN_KEY = 'auth_token';

async function persistToken(token) {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

async function readToken() {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function clearToken() {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

// ---------------------------------------------------------------------------
// Auth Zustand store — Delivery Partner variant
// ---------------------------------------------------------------------------

export const useAuthStore = create((set, get) => ({
  // ---- State ----
  user: null,
  partner: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  // ---- Actions ----

  /**
   * initialize — Called once on app startup (from root _layout).
   * Reads the persisted token from SecureStore, calls GET /auth/me and
   * GET /delivery/me to validate it, and hydrates user + partner state.
   */
  initialize: async () => {
    try {
      const token = await readToken();
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      // Token exists — validate with backend
      set({ token });
      const userData = await getMe();

      // Fetch delivery partner profile
      let partnerData = null;
      try {
        const res = await getDeliveryMe();
        partnerData = res.partner;
      } catch {
        // Partner profile may not exist yet — that's ok
      }

      set({
        user: userData.user,
        partner: partnerData,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      // Token is invalid or network error — clear everything
      await clearToken();
      set({
        user: null,
        partner: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  /**
   * login — Saves the JWT to SecureStore and sets user in state.
   * Called after a successful OTP verification.
   */
  login: async (token, user) => {
    await persistToken(token);
    set({ token });

    // Fetch delivery partner profile after login
    let partnerData = null;
    try {
      const res = await getDeliveryMe();
      partnerData = res.partner;
    } catch {
      // Partner profile may not exist yet
    }

    set({
      user,
      partner: partnerData,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  /**
   * logout — Clears SecureStore and resets all auth state.
   */
  logout: async () => {
    await clearToken();
    set({
      user: null,
      partner: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  /**
   * updateUser — Patches user object in state.
   */
  updateUser: (user) => {
    set({ user });
  },

  /**
   * updatePartner — Patches partner object in state.
   */
  updatePartner: (partner) => {
    set({ partner });
  },
}));
