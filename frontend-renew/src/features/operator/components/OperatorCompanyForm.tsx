import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { operatorApi } from '../api/operatorApi';

interface OperatorCompanyFormProps {
  id?: number;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const OperatorCompanyForm: React.FC<OperatorCompanyFormProps> = ({ id, onSubmit, isLoading }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const { data: company, isLoading: dataLoading } = useQuery({
    queryKey: ['operatorCompany', id],
    queryFn: () => operatorApi.fetchCompany(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (company) {
      reset({
        operatorCompanyId: company.operatorCompanyId,
        name: company.name,
        description: company.description,
        businessNumber: company.businessNumber,
        representativeName: company.representativeName,
        status: company.status,
        tenantId: company.tenantId || 'MSP',
      });
    } else {
      reset({
        status: 'ACTIVE',
        tenantId: 'MSP',
      });
    }
  }, [company, reset]);

  if (id && dataLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-sm text-brand-primary animate-pulse font-bold tracking-widest uppercase">Loading Company Metadata...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="label-base pl-1">Tenant ID</label>
          <input 
            {...register('tenantId', { required: 'Tenant ID는 필수입니다.' })}
            className={`input-base ${errors.tenantId ? 'border-red-500/50' : ''} font-mono`}
            placeholder="e.g. MSP"
          />
          {errors.tenantId && <p className="text-[10px] text-red-500 pl-1">{String(errors.tenantId.message)}</p>}
        </div>

        <div className="space-y-1">
          <label className="label-base pl-1">Operator Company ID</label>
          <input 
            {...register('operatorCompanyId', { required: '운영사 ID는 필수입니다.' })}
            className={`input-base ${errors.operatorCompanyId ? 'border-red-500/50' : ''} font-mono`}
            placeholder="e.g. OP-001"
            disabled={!!id}
          />
          {errors.operatorCompanyId && <p className="text-[10px] text-red-500 pl-1">{String(errors.operatorCompanyId.message)}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <label className="label-base pl-1">Company Name</label>
        <input 
          {...register('name', { required: '운영사 명칭은 필수입니다.' })}
          className={`input-base ${errors.name ? 'border-red-500/50' : ''} font-bold`}
          placeholder="공식 운영사 명칭을 입력하세요"
        />
        {errors.name && <p className="text-[10px] text-red-500 pl-1">{String(errors.name.message)}</p>}
      </div>

      <div className="space-y-1">
        <label className="label-base pl-1">Business Description</label>
        <textarea 
          {...register('description')}
          rows={3}
          className="input-base h-auto py-3 resize-none"
          placeholder="운영사에 대한 상세 설명을 입력하세요"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="label-base pl-1">Business Number</label>
          <input 
            {...register('businessNumber')}
            className="input-base font-mono"
            placeholder="e.g. 000-00-00000"
          />
        </div>

        <div className="space-y-1">
          <label className="label-base pl-1">Representative Name</label>
          <input 
            {...register('representativeName')}
            className="input-base"
            placeholder="대표자 성함을 입력하세요"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="label-base pl-1">Operational Status</label>
        <select 
          {...register('status')}
          className="select-base"
        >
          <option value="ACTIVE" className="bg-background-secondary text-primary">ACTIVE (활성)</option>
          <option value="INACTIVE" className="bg-background-secondary text-primary">INACTIVE (비활성)</option>
        </select>
      </div>

      <div className="pt-6">
        <button 
          type="submit" 
          disabled={isLoading}
          className="btn-md btn-primary w-full uppercase tracking-[0.2em] font-black"
        >
          {isLoading ? 'Processing...' : id ? 'Update Company Info' : 'Register New Company'}
        </button>
      </div>
    </form>
  );
};

export default OperatorCompanyForm;
export { OperatorCompanyForm };
