import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { UserPlus, Shield, User, Mail, Building2, Briefcase } from 'lucide-react';
import { SignupRequest } from '../types/authTypes';

interface SignupFormProps {
  onSubmit: (data: SignupRequest) => void;
  isLoading?: boolean;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSubmit, isLoading }) => {
  const [userType, setUserType] = useState<'CUSTOMER' | 'OPERATOR'>('CUSTOMER');
  
  const { register, handleSubmit, formState: { errors } } = useForm<SignupRequest>({
    defaultValues: {
      type: 'CUSTOMER',
      role: 'ROLE_USER'
    }
  });


  const onTypeChange = (type: 'CUSTOMER' | 'OPERATOR') => {
    setUserType(type);
  };

  return (
    <div className="space-y-6">
      {/* User Type Toggle */}
      <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
        <button
          type="button"
          onClick={() => onTypeChange('CUSTOMER')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
            userType === 'CUSTOMER' ? 'bg-brand-primary text-black' : 'text-text-muted hover:text-white'
          }`}
          data-testid="signup-type-customer"
        >
          <User size={14} /> 고객 사용자
        </button>
        <button
          type="button"
          onClick={() => onTypeChange('OPERATOR')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
            userType === 'OPERATOR' ? 'bg-brand-primary text-black' : 'text-text-muted hover:text-white'
          }`}
          data-testid="signup-type-operator"
        >
          <Briefcase size={14} /> 운영 조직원
        </button>
      </div>

      <form onSubmit={handleSubmit((data) => onSubmit({ ...data, type: userType }))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label-base label-required">User ID</label>
            <div className="relative">
              <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input
                {...register('userId', { required: 'User ID is required' })}
                className="input-base pl-10"
                data-testid="signup-userId"
                placeholder="ID"
              />
            </div>
            {errors.userId && <p className="text-[10px] text-status-critical font-bold mt-1 uppercase">{errors.userId.message}</p>}
          </div>

          <div className="form-group">
            <label className="label-base label-required">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input
                {...register('name', { required: 'Name is required' })}
                className="input-base pl-10"
                placeholder="이름"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="label-base label-required">
            {userType === 'CUSTOMER' ? 'Tenant ID' : 'Company ID'}
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input
              {...register('companyId', { required: 'Company ID is required' })}
              className="input-base pl-10"
              data-testid="signup-companyId"
              placeholder={userType === 'CUSTOMER' ? '고객사 코드 (예: TENANT-A)' : '운영사 코드 (예: MSP, OP-A)'}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="label-base">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input
              {...register('email')}
              type="email"
              className="input-base pl-10"
              placeholder="example@itsm.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label-base label-required">Password</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input
                {...register('password', { required: 'Password is required' })}
                type="password"
                className="input-base pl-10"
                placeholder="******"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="label-base label-required">Confirm</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input
                type="password"
                className="input-base pl-10"
                placeholder="******"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          data-testid="signup-submit-btn"
          className="btn-primary btn-md w-full mt-6"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
          ) : (
            '계정 생성하기'
          )}
        </button>
      </form>
    </div>
  );
};

export default SignupForm;
