import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../features/auth/components/AuthLayout';
import SignupForm from '../../features/auth/components/SignupForm';
import { authService } from '../../features/auth/services/authService';
import { SignupRequest } from '../../features/auth/types/authTypes';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (data: SignupRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      // Step 1: Set temporary tenant header if needed for the signup request 
      // (Depends on backend, but typically signup might be tenant-less or need the target tenant id)
      localStorage.setItem('X-Tenant-ID', data.companyId);

      // Step 2: Call Signup API
      await authService.signup(data);
      
      // Step 3: Redirect to login with success message (simplified)
      alert('회원가입이 완료되었습니다. 로그인해 주세요.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다. 다시 시도해 주세요.');
      console.error('Signup failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="ITSM 통합 관리를 위한 새로운 계정을 생성합니다."
    >
      {error && (
        <div className="mb-6 p-4 bg-status-critical/10 border border-status-critical/20 rounded-xl">
          <p className="text-[10px] text-status-critical font-bold uppercase tracking-wider">Registration Error</p>
          <p className="text-sm text-status-critical/80 mt-1">{error}</p>
        </div>
      )}

      <SignupForm onSubmit={handleSignup} isLoading={isLoading} />

      <div className="mt-8 text-center text-xs font-bold uppercase tracking-wider">
        <span className="text-text-muted">이미 계정이 있으신가요? </span>
        <Link to="/login" title="로그인" className="text-cyan-400 hover:text-white transition-colors">
          로그인하기
        </Link>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
