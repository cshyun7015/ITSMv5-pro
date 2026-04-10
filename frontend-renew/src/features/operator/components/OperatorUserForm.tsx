import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { operatorApi } from '../api/operatorApi';
import { commonCodeApi } from '../../common-code/api/commonCodeApi';

interface OperatorUserFormProps {
  id?: number;
  defaultTenantId?: string;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const OperatorUserForm: React.FC<OperatorUserFormProps> = ({ id, defaultTenantId, onSubmit, isLoading }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleFormSubmit = (data: any) => {
    // Convert isActive string from select to boolean
    const processedData = {
      ...data,
      isActive: data.isActive === 'true' || data.isActive === true
    };
    onSubmit(processedData);
  };

  const { data: operator, isLoading: dataLoading } = useQuery({
    queryKey: ['operator', id],
    queryFn: () => operatorApi.fetchOperator(id!),
    enabled: !!id,
  });

  const { data: roleCodes, isLoading: codesLoading } = useQuery({
    queryKey: ['commonCodes', 'OPE_ROLE'],
    queryFn: () => commonCodeApi.fetchItemsByGroup('OPE_ROLE'),
  });

  useEffect(() => {
    if (operator) {
      reset({
        userId: operator.userId,
        name: operator.name,
        email: operator.email,
        role: operator.role,
        isActive: operator.isActive,
        tenantId: operator.tenantId,
      });
    } else {
      reset({
        isActive: true,
        tenantId: defaultTenantId || 'MSP',
      });
    }
  }, [operator, reset, defaultTenantId]);

  if (id && dataLoading) {
    return <div className="text-sm text-text-muted animate-pulse">Loading operator user data...</div>;
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 max-w-2xl px-2">
      <div className="space-y-1">
        <label className="label-base">Tenant ID</label>
        <input 
          {...register('tenantId', { required: 'Tenant ID는 필수입니다.' })}
          className={`input-base ${errors.tenantId ? 'border-red-500/50' : ''} font-mono`}
          placeholder="e.g. MSP"
        />
        {errors.tenantId && <p className="text-[10px] text-red-500 pl-1 font-bold">{errors.tenantId.message as string}</p>}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="label-base">User ID</label>
          <input 
            {...register('userId', { required: '사용자 ID는 필수입니다.' })}
            className={`input-base ${errors.userId ? 'border-red-500/50' : ''}`}
            placeholder="e.g. admin_kim"
            disabled={!!id}
          />
          {errors.userId && <p className="text-[10px] text-red-500 pl-1 font-bold">{errors.userId.message as string}</p>}
        </div>

        <div className="space-y-1">
          <label className="label-base">Full Name</label>
          <input 
            {...register('name', { required: '성명은 필수입니다.' })}
            className={`input-base ${errors.name ? 'border-red-500/50' : ''}`}
            placeholder="성명을 입력하세요"
          />
          {errors.name && <p className="text-[10px] text-red-500 pl-1 font-bold">{errors.name.message as string}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="label-base">Email Address</label>
          <input 
            {...register('email', { 
              required: '이메일은 필수입니다.',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "유효한 이메일 형식이 아닙니다."
              }
            })}
            className={`input-base ${errors.email ? 'border-red-500/50' : ''}`}
            placeholder="example@company.com"
          />
          {errors.email && <p className="text-[10px] text-red-500 pl-1 font-bold">{errors.email.message as string}</p>}
        </div>

        {!id && (
          <div className="space-y-1 p-0">
            <label className="label-base">Initial Password</label>
            <input 
              type="password"
              {...register('password', { required: '초기 비밀번호는 필수입니다.' })}
              className={`input-base ${errors.password ? 'border-red-500/50' : ''}`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-[10px] text-red-500 pl-1 font-bold">{errors.password.message as string}</p>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="label-base">Role</label>
          <select 
            {...register('role')}
            className="select-base"
            disabled={codesLoading}
          >
            {codesLoading ? (
              <option>Loading roles...</option>
            ) : (
              roleCodes?.map((code) => (
                <option key={code.codeId} value={code.codeId} className="bg-background-secondary text-primary">
                  {code.codeName} ({code.codeId})
                </option>
              ))
            )}
          </select>
        </div>

        <div className="space-y-1">
          <label className="label-base">Account Active</label>
          <select 
            {...register('isActive')}
            className="select-base"
          >
            <option value="true" className="bg-background-secondary text-primary">ACTIVE (활성)</option>
            <option value="false" className="bg-background-secondary text-primary">INACTIVE (비활성)</option>
          </select>
        </div>
      </div>

      <div className="pt-6">
        <button 
          type="submit" 
          disabled={isLoading}
          className="btn-md btn-primary w-full uppercase tracking-[0.2em]"
        >
          {isLoading ? '처리 중...' : id ? '운영자 정보 수정' : '신규 운영자 등록'}
        </button>
      </div>
    </form>
  );
};

export default OperatorUserForm;
export { OperatorUserForm };
