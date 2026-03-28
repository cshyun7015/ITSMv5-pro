import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

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
  // Use companyId from localStorage if available (set by AuthProvider)
  const companyId = localStorage.getItem('companyId') || 'SYSTEM';
  if (config.headers) {
    config.headers['X-Company-ID'] = companyId;
  }
  return config;
});

// Response Interceptor: Handle errors globally
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redirect to login or clear auth state if unauthorized
      console.warn('Session expired or unauthorized. Redirecting to login...');
      // Logic for logout can be triggered here if needed
    }
    return Promise.reject(error);
  }
);

export default apiClient;
