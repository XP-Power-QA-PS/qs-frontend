import { AUTH_CONSTANTS } from '../constants/app.constants';

interface RefreshSubscriber {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}

let isRefreshing = false;
let refreshSubscribers: RefreshSubscriber[] = [];

const subscribeTokenRefresh = (
  resolve: (token: string) => void,
  reject: (err: any) => void
) => {
  refreshSubscribers.push({ resolve, reject });
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((sub) => sub.resolve(token));
  refreshSubscribers = [];
};

const onRefreshFailed = (err: any) => {
  refreshSubscribers.forEach((sub) => sub.reject(err));
  refreshSubscribers = [];
};

/**
 * A generic fetch wrapper to include Authorization headers automatically
 * and handle common errors (like 401). Includes auto-refresh logic.
 */
export const apiClient = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = localStorage.getItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(endpoint, config);

  if (!response.ok) {
    if (response.status === 401) {
      const refreshToken = localStorage.getItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        localStorage.removeItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
        window.location.href = '/login';
        return Promise.reject(new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.'));
      }

      if (!isRefreshing) {
        isRefreshing = true;
        const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
        
        fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        }).then(async (res) => {
          if (!res.ok) {
            throw new Error('Session expired');
          }
          const data = await res.json();
          localStorage.setItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY, data.accessToken);
          localStorage.setItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY, data.refreshToken);
          onRefreshed(data.accessToken);
        }).catch((_err) => {
          localStorage.removeItem(AUTH_CONSTANTS.ACCESS_TOKEN_KEY);
          localStorage.removeItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY);
          const sessionErr = new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
          onRefreshFailed(sessionErr);
          window.location.href = '/login';
        }).finally(() => {
          isRefreshing = false;
        });
      }

      // Wait for the refresh to complete, then retry the request
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(
          (newToken) => {
            const newHeaders = {
              ...headers,
              'Authorization': `Bearer ${newToken}`
            };
            fetch(endpoint, { ...config, headers: newHeaders })
              .then(res => {
                if (res.status === 204) return resolve({});
                return res.text().then(text => resolve(text ? JSON.parse(text) : {}));
              })
              .catch(reject);
          },
          (err) => {
            reject(err);
          }
        );
      });
    }

    if (response.status === 403) {
      let forbiddenMsg = 'Bạn không có quyền truy cập hoặc thực hiện thao tác này (403 Forbidden).';
      try {
        const errorData = await response.json();
        forbiddenMsg = errorData.message || forbiddenMsg;
      } catch (e) {
        // use default message
      }
      throw new Error(forbiddenMsg);
    }

    let errorMsg = `Server error (${response.status})`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorMsg;
    } catch (e) {
      if (response.status === 504) errorMsg = 'Backend is unreachable (Gateway Timeout)';
      if (response.status === 502) errorMsg = 'Backend is down (Bad Gateway)';
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return {};
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

