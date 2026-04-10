import apiClient from '../../../core/api/apiClient';
import { AuthResponse, LoginRequest, SignupRequest } from '../types/authTypes';

/**
 * Authentication Web Service
 * - 백엔드 /v1/auth 엔드포인트와 통신
 */
export const authService = {
  /**
   * 로그인 실행 및 세션 쿠키 설정 유도
   */
  login: async (request: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/v1/auth/login', request);
    return response.data;
  },

  /**
   * 회원가입 실행
   */
  signup: async (request: SignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/v1/auth/signup', request);
    return response.data;
  },

  /**
   * 로그아웃 실행 및 쿠키 제거 유도
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/v1/auth/logout');
  },

  getMe: async (): Promise<AuthResponse> => {
    const response = await apiClient.get<AuthResponse>('/v1/auth/me');
    return response.data;
  },

  /**
   * 운영사 목록 조회
   */
  getOperatorCompanies: async (): Promise<any[]> => {
    const response = await apiClient.get('/v1/operator/companies');
    return response.data.data; // ApiResponse format
  },

  /**
   * 운영사별 팀 목록 조회
   */
  getOperatorTeams: async (companyId: number): Promise<any[]> => {
    const response = await apiClient.get(`/v1/operator/companies/${companyId}/teams`);
    return response.data.data;
  }
};
