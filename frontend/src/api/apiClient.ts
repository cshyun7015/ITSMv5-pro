import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = '/api/v1'; // Relative path for proxy-based container access

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Required for HttpOnly Cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject Company ID and Auth headers if needed
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Use companyId/userId from localStorage if available (set by AuthProvider)
  const companyId = localStorage.getItem('companyId') || 'SYSTEM';
  const userId = localStorage.getItem('userId') || 'anonymous';
  if (config.headers) {
    config.headers['X-Company-ID'] = companyId;
    config.headers['X-User-ID'] = userId;
  }
  return config;
});

// Response Interceptor: Handle errors globally
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Session expired or unauthorized
      console.warn('Session expired or unauthorized. Purging local credentials...');
      
      // Clear persistence to force AuthProvider to reset
      localStorage.removeItem('authUser');
      localStorage.removeItem('companyId');
      localStorage.removeItem('userId');

      // Force reload to trigger ProtectedRoute logic and landing on /login
      if (!window.location.pathname.includes('/login')) {
         window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
