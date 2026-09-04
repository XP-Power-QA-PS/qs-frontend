import type { AuthResponse, LoginRequest } from '../types/auth.types';
import { AUTH_CONSTANTS } from '../constants/app.constants';
import { apiClient } from '../config/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const authService = {
  login: async (request: LoginRequest): Promise<AuthResponse> => {
    const data: AuthResponse = await apiClient(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    // Save tokens securely
    localStorage.setItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY, data.refreshToken);

    return data;
  },

  logout: () => {
    localStorage.removeItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY);
  },

  getAccessToken: () => {
    return localStorage.getItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
  }
};

