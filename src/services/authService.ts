import type { AuthResponse, LoginRequest } from '../types/auth.types';
import { AUTH_CONSTANTS } from '../constants/app.constants';
import { apiClient } from '../config/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

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
  },

  getUserRole: (): string | null => {
    const token = localStorage.getItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
    if (!token) return null;
    const decoded = parseJwt(token);
    
    if (decoded?.roles && Array.isArray(decoded.roles)) {
      if (decoded.roles.includes('ROLE_ADMIN')) return 'ROLE_ADMIN';
      if (decoded.roles.includes('ROLE_USER')) return 'ROLE_USER';
      return decoded.roles[0] || null;
    }
    
    return decoded?.role || null;
  }
};

