import apiClient from './apiClient';

export interface LoginRequest {
  userId: string;
  password?: string;
}

export interface SignupRequest {
  userId: string;
  password?: string;
  name: string;
  email: string;
  companyId: string;
}

export interface AuthUser {
  userId: string;
  name: string;
  role: string;
  companyId: string;
}

const apiAuth = {
  login: async (data: LoginRequest): Promise<AuthUser> => {
    // baseURL is already '/api/v1' in apiClient.ts
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  signup: async (data: SignupRequest): Promise<AuthUser> => {
    const response = await apiClient.post('/auth/signup', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  me: async (): Promise<AuthUser> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
};

export default apiAuth;
