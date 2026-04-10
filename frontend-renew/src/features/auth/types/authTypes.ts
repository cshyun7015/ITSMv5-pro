/**
 * Auth Feature Types
 * - 백엔드 AuthResponse DTO 및 요청 객체와 평선
 */

export interface User {
  userId: string;
  name: string;
  role: string;
  companyId: string;
  companyName: string;
  isSuperCompany: boolean;
}

export interface AuthResponse {
  userId: string;
  name: string;
  role: string;
  companyId: string;
  companyName: string;
  isSuperCompany: boolean;
}

export interface LoginRequest {
  userId: string;
  password?: string;
}

export interface SignupRequest {
  userId: string;
  password?: string;
  name: string;
  email?: string;
  role: string;
  companyId: string;
  type: 'CUSTOMER' | 'OPERATOR';
}
