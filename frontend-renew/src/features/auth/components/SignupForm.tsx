import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { UserPlus, Shield, User, Mail, Building2, Briefcase } from 'lucide-react';
import { SignupRequest } from '../types/authTypes';
import { authService } from '../services/authService';

interface SignupFormProps {
  onSubmit: (data: SignupRequest) => void;
  isLoading?: boolean;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSubmit, isLoading }) => {
  const [userType, setUserType] = useState<'CUSTOMER' | 'OPERATOR'>('CUSTOMER');
  const [opCompanies, setOpCompanies] = useState<any[]>([]);
  const [opTeams, setOpTeams] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [isFetchingOrg, setIsFetchingOrg] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<SignupRequest>({
    defaultValues: {
      type: 'CUSTOMER',
      role: 'ROLE_USER'
    }
  });

  useEffect(() => {
    if (userType === 'OPERATOR') {
      fetchCompanies();
    }
  }, [userType]);

  const fetchCompanies = async () => {
    try {
      setIsFetchingOrg(true);
      const data = await authService.getOperatorCompanies();
      setOpCompanies(data);
    } catch (error) {
      console.error('Failed to fetch companies', error);
    } finally {
      setIsFetchingOrg(false);
    }
  };

  const handleCompanyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = Number(e.target.value);
    const company = opCompanies.find(c => c.id === companyId);
    
    setSelectedCompanyId(companyId);
    setValue('companyId', company?.operatorCompanyId || '');
    setOpTeams([]);
    
    if (companyId) {
      try {
        setIsFetchingOrg(true);
        const teams = await authService.getOperatorTeams(companyId);
        setOpTeams(teams);
      } catch (error) {
        console.error('Failed to fetch teams', error);
      } finally {
        setIsFetchingOrg(false);
      }
    }
  };

  const onTypeChange = (type: 'CUSTOMER' | 'OPERATOR') => {
    setUserType(type);
    setValue('type', type);
    setSelectedCompanyId(null);
    setOpTeams([]);
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

        {userType === 'CUSTOMER' ? (
          <div className="form-group">
            <label className="label-base label-required">Tenant ID</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input
                {...register('companyId', { required: 'Tenant ID is required' })}
                className="input-base pl-10"
                data-testid="signup-companyId"
                placeholder="고객사 코드 (예: TENANT-A)"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label-base label-required">Operator Company</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <select
                  className="select-base pl-10"
                  onChange={handleCompanyChange}
                  defaultValue=""
                  required
                >
                  <option value="" disabled>운영사 선택</option>
                  {opCompanies.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.operatorCompanyId})</option>
                  ))}
                </select>
                {isFetchingOrg && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <div className="w-3 h-3 border border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label className="label-base label-required">Team</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <select
                  {...register('teamId', { required: userType === 'OPERATOR' })}
                  className="select-base pl-10"
                  disabled={!selectedCompanyId || opTeams.length === 0}
                >
                  <option value="">팀 선택</option>
                  {opTeams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              {selectedCompanyId && opTeams.length === 0 && !isFetchingOrg && (
                <p className="text-[10px] text-text-muted mt-1 italic">등록된 팀이 없습니다.</p>
              )}
            </div>
          </div>
        )}

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
