import React from 'react';
import { useForm } from 'react-hook-form';
import { LogIn, Shield, Building2 } from 'lucide-react';
import { LoginRequest } from '../types/authTypes';

interface LoginFormProps {
  onSubmit: (data: LoginRequest & { tenantId: string }) => void;
  isLoading?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest & { tenantId: string }>({
    defaultValues: {
      tenantId: 'SYSTEM', // Default to SYSTEM for MSP/Operators
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="form-group">
        <label className="label-base label-required">Tenant ID</label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            {...register('tenantId', { required: 'Tenant ID is required' })}
            type="text"
            className={`input-base pl-10 ${errors.tenantId ? 'border-status-critical' : ''}`}
            data-testid="login-tenant-id"
            placeholder="예: SYSTEM, TENANT-A"
          />
        </div>
        {errors.tenantId && <p className="text-[10px] text-status-critical font-bold mt-1 uppercase">{errors.tenantId.message}</p>}
      </div>

      <div className="form-group">
        <label className="label-base label-required">User ID</label>
        <div className="relative">
          <LogIn className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            {...register('userId', { required: 'User ID is required' })}
            type="text"
            className={`input-base pl-10 ${errors.userId ? 'border-status-critical' : ''}`}
            data-testid="login-user-id"
            placeholder="아이디를 입력하세요"
          />
        </div>
        {errors.userId && <p className="text-[10px] text-status-critical font-bold mt-1 uppercase">{errors.userId.message}</p>}
      </div>

      <div className="form-group">
        <label className="label-base label-required">Password</label>
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            {...register('password', { required: 'Password is required' })}
            type="password"
            className={`input-base pl-10 ${errors.password ? 'border-status-critical' : ''}`}
            data-testid="login-password"
            placeholder="비밀번호를 입력하세요"
          />
        </div>
        {errors.password && <p className="text-[10px] text-status-critical font-bold mt-1 uppercase">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        data-testid="login-submit-btn"
        className="btn-primary btn-lg w-full mt-4 shadow-lg shadow-brand-primary/20"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
        ) : (
          '로그인'
        )}
      </button>
    </form>
  );
};

export default LoginForm;
