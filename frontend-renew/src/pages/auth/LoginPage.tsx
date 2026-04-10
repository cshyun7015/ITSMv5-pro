import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../features/auth/components/AuthLayout';
import LoginForm from '../../features/auth/components/LoginForm';
import { authService } from '../../features/auth/services/authService';
import { useAuthStore } from '../../core/auth/useAuthStore';
import { LoginRequest } from '../../features/auth/types/authTypes';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginBatch } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (data: LoginRequest & { tenantId: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { tenantId, ...loginData } = data;
      
      // Step 1: Set temporary tenant header for login request
      localStorage.setItem('X-Tenant-ID', tenantId);
      
      // Step 2: Call Login API
      const response = await authService.login(loginData);
      
      // Step 3: Update global auth store
      loginBatch(response, tenantId);
      
      // Step 4: Redirect to home
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인에 실패했습니다. 정보를 확인해 주세요.');
      console.error('Login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="ITSM v5에 로그인하여 서비스를 관리하세요."
    >
      {error && (
        <div className="mb-6 p-4 bg-status-critical/10 border border-status-critical/20 rounded-xl">
          <p className="text-xs text-status-critical font-bold uppercase tracking-wider">Authentication Error</p>
          <p className="text-sm text-status-critical/80 mt-1">{error}</p>
        </div>
      )}

      <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

      <div className="mt-8 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
        <Link to="/forgot-password" title="비밀번호 찾기" className="text-text-muted hover:text-cyan-400 transition-colors">
          비밀번호 찾기
        </Link>
        <Link to="/signup" title="회원가입" className="text-cyan-400 hover:text-white transition-colors">
          계정 생성하기
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
