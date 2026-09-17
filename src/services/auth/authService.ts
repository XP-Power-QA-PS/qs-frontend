import type { AuthResponse, LoginRequest } from '@/types/auth';
import { AUTH_CONSTANTS } from '@/constants/app.constants';
import { apiClient } from '@/config/api';

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

  logout: async (): Promise<void> => {
    const token = localStorage.getItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
    try {
      if (token) {
        await fetch(`${BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.warn('Backend logout request failed, clearing local tokens:', err);
    } finally {
      localStorage.removeItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
      localStorage.removeItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY);
    }
  },

  logoutAll: async (): Promise<void> => {
    const token = localStorage.getItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
    try {
      if (token) {
        await fetch(`${BASE_URL}/auth/logout-all`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.warn('Backend logout-all request failed, clearing local tokens:', err);
    } finally {
      localStorage.removeItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
      localStorage.removeItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY);
    }
  },

  getAccessToken: () => {
    return localStorage.getItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY) || !!localStorage.getItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY);
  },

  getUserRoles: (): string[] => {
    const token = localStorage.getItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
    if (!token) return [];
    const decoded = parseJwt(token);
    if (decoded?.roles && Array.isArray(decoded.roles)) {
      return decoded.roles;
    }
    if (decoded?.role) {
      return [decoded.role];
    }
    return [];
  },

  getUserRole: (): string | null => {
    const roles = authService.getUserRoles();
    if (roles.includes('ROLE_ADMIN')) return 'ROLE_ADMIN';
    if (roles.includes('ROLE_SUPERVISOR')) return 'ROLE_SUPERVISOR';
    if (roles.includes('ROLE_QC_ENGINEER')) return 'ROLE_QC_ENGINEER';
    if (roles.includes('ROLE_INSPECTOR')) return 'ROLE_INSPECTOR';
    if (roles.includes('ROLE_OPERATOR')) return 'ROLE_OPERATOR';
    if (roles.includes('ROLE_USER')) return 'ROLE_USER';
    return roles[0] || null;
  },

  hasRole: (requiredRole: string): boolean => {
    const roles = authService.getUserRoles();
    return roles.includes(requiredRole);
  },

  hasAnyRole: (requiredRoles: string[]): boolean => {
    const roles = authService.getUserRoles();
    return requiredRoles.some((r) => roles.includes(r));
  }
};

