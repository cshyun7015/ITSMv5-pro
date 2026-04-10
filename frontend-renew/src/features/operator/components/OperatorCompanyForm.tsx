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
        status: company.status,
      });
    }
  }, [company, reset]);

  if (id && dataLoading) {
    return <div className="text-sm text-text-muted animate-pulse">Loading company data...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest pl-1">Company ID</label>
          <input 
            {...register('operatorCompanyId', { required: '운영사 ID는 필수입니다.' })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
            placeholder="e.g. OP-001"
          />
          {errors.operatorCompanyId && <p className="text-[10px] text-red-500 pl-1">{String(errors.operatorCompanyId.message)}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest pl-1">Company Name</label>
          <input 
            {...register('name', { required: '운영사 명칭은 필수입니다.' })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
            placeholder="운영사 이름을 입력하세요"
          />
          {errors.name && <p className="text-[10px] text-red-500 pl-1">{String(errors.name.message)}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest pl-1">Description</label>
        <textarea 
          {...register('description')}
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
          placeholder="운영사에 대한 상세 설명을 입력하세요"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest pl-1">Status</label>
        <select 
          {...register('status')}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 transition-all appearance-none"
        >
          <option value="ACTIVE" className="bg-background-secondary">ACTIVE</option>
          <option value="INACTIVE" className="bg-background-secondary">INACTIVE</option>
        </select>
      </div>

      <div className="pt-4">
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-cyan-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : id ? 'Update Company' : 'Create Company'}
        </button>
      </div>
    </form>
  );
};

export default OperatorCompanyForm;
export { OperatorCompanyForm };
