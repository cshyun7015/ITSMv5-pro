import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../core/auth/useAuthStore';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  requiredTenantId?: string;
  adminBypass?: boolean; // If true, ROLE_ADMIN can bypass tenant restriction
}

/**
 * Protected Route Wrapper
 * - 인증된 사용자만 하위 경로에 접근 가능하도록 제한
 * - allowedRoles 및 requiredTenantId를 통한 세부 RBAC 지원
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  allowedRoles, 
  requiredTenantId,
  adminBypass = true 
}) => {
  const { isLoggedIn, user, tenantId } = useAuthStore();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // 1. Role Check
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/incident" replace />;
  }

  // 2. Tenant Check
  if (requiredTenantId && user) {
    const isMspAdmin = adminBypass && user.role === 'ROLE_ADMIN';
    if (!isMspAdmin && tenantId !== requiredTenantId) {
      return <Navigate to="/incident" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
