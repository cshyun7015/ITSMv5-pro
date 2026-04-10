import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { applyTenantTheme } from '../../shared/constants/tenant_config';

export interface User {
  userId: string;
  name: string;
  role: string;
  companyId: string;
  companyName: string;
  isSuperCompany: boolean;
}

interface AuthState {
  user: User | null;
  tenantId: string;
  isLoggedIn: boolean;
  loginBatch: (user: User, tenantId: string) => void;
  logout: () => void;
  setTenant: (tenantId: string) => void;
}

/**
 * 전역 인증 및 테넌트 상태 관리 (Zustand)
 * - 테넌트 변경 시 동적 실시간 테마 적용 연동
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenantId: 'default',
      isLoggedIn: false,
      
      loginBatch: (user, tenantId) => {
        set({ user, tenantId, isLoggedIn: true });
        localStorage.setItem('X-Tenant-ID', tenantId);
        applyTenantTheme(tenantId);
      },
      
      logout: () => {
        set({ user: null, tenantId: 'default', isLoggedIn: false });
        localStorage.removeItem('X-Tenant-ID');
        localStorage.removeItem('auth_token'); // Clear token if stored
        applyTenantTheme('default');
        
        // Clear all cookies (optional but recommended for security)
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      },
      
      setTenant: (tenantId) => {
        set({ tenantId });
        localStorage.setItem('X-Tenant-ID', tenantId);
        applyTenantTheme(tenantId);
      },
    }),
    {
      name: 'itsm-v5-auth-storage',
    }
  )
);
