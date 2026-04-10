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

  /**
   * 현재 로그인된 사용자 정보 조회 (세션 유지 확인용)
   */
  getMe: async (): Promise<AuthResponse> => {
    const response = await apiClient.get<AuthResponse>('/v1/auth/me');
    return response.data;
  }
};
