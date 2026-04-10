import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../core/auth/useAuthStore';

/**
 * Protected Route Wrapper
 * - 인증된 사용자만 하위 경로에 접근 가능하도록 제한
 * - 미인증 시 /login으로 리다이렉트
 */
const ProtectedRoute: React.FC = () => {
  const { isLoggedIn } = useAuthStore();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
