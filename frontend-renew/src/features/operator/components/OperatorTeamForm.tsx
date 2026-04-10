import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { operatorApi } from '../api/operatorApi';
import { TeamCustomerMappingForm } from './TeamCustomerMappingForm';

interface OperatorTeamFormProps {
  id?: number;
  companyId?: number; // Needed for new team creation
  defaultTenantId?: string;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const OperatorTeamForm: React.FC<OperatorTeamFormProps> = ({ id, defaultTenantId, onSubmit, isLoading }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const { data: team, isLoading: dataLoading } = useQuery({
    queryKey: ['operatorTeam', id],
    queryFn: () => operatorApi.fetchTeam(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (team) {
      reset({
        name: team.name,
        description: team.description,
        status: team.status,
        parentTeamId: team.parentTeamId,
        tenantId: team.tenantId,
      });
    } else {
      reset({
        status: 'ACTIVE',
        tenantId: defaultTenantId || 'MSP',
      });
    }
  }, [team, reset, defaultTenantId]);

  if (id && dataLoading) {
    return <div className="text-sm text-text-muted animate-pulse">Loading team data...</div>;
  }

  return (
    <div className="space-y-10">
      {/* 기본 정보 폼 */}
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
            <label className="label-base pl-1">Team Name</label>
            <input 
              {...register('name', { required: '팀 명칭은 필수입니다.' })}
          className={`input-base ${errors.name ? 'border-red-500/50' : ''} font-bold`}
              placeholder="팀 이름을 입력하세요"
            />
            {errors.name && <p className="text-[10px] text-red-500 pl-1">{String(errors.name.message)}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
             <label className="label-base pl-1">Status</label>
             <select 
               {...register('status')}
               className="select-base"
             >
               <option value="ACTIVE" className="bg-background-secondary">ACTIVE</option>
               <option value="INACTIVE" className="bg-background-secondary">INACTIVE</option>
             </select>
          </div>
          <div className="flex items-end">
            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-md btn-primary w-full uppercase tracking-[0.2em] font-black"
            >
              {isLoading ? 'Updating...' : 'Save Basic Info'}
            </button>
          </div>
        </div>
      </form>

      {/* 고객 매핑 영역 (수정 모드에서만 표시) */}
      {id && (
        <div className="pt-10 border-t border-white/5 animate-slide-up">
           <div className="mb-4">
              <h3 className="text-lg font-bold text-white tracking-tight">관리 고객 범위 설정</h3>
              <p className="text-xs text-text-muted mt-1">이 운영 팀이 티켓/이벤트를 처리할 수 있는 고객사들을 지정합니다.</p>
           </div>
           <TeamCustomerMappingForm teamId={id} />
        </div>
      )}
    </div>
  );
};

export default OperatorTeamForm;
export { OperatorTeamForm };
