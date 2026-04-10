import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, Edit3, Info, Building2, Users, UserCheck } from 'lucide-react';
import { operatorApi } from '../api/operatorApi';
import { useOperatorMutations } from '../hooks/useOperatorMutations';

import { OperatorCompanyForm } from './OperatorCompanyForm';
import { OperatorTeamForm } from './OperatorTeamForm';
import { OperatorUserForm } from './OperatorUserForm';

interface OperatorDetailProps {
  selectedNode: { type: 'COMPANY' | 'TEAM' | 'OPERATOR'; id: number } | null;
}

const OperatorDetail: React.FC<OperatorDetailProps> = ({ selectedNode }) => {
  const { updateCompany, updateTeam, updateOperator } = useOperatorMutations();

  // Fetch data for metadata cards
  const { data: companyData } = useQuery({
    queryKey: ['operatorCompany', selectedNode?.id],
    queryFn: () => operatorApi.fetchCompany(selectedNode!.id),
    enabled: selectedNode?.type === 'COMPANY',
  });

  const { data: teamData } = useQuery({
    queryKey: ['operatorTeam', selectedNode?.id],
    queryFn: () => operatorApi.fetchTeam(selectedNode!.id),
    enabled: selectedNode?.type === 'TEAM',
  });

  const { data: operatorData } = useQuery({
    queryKey: ['operator', selectedNode?.id],
    queryFn: () => operatorApi.fetchOperator(selectedNode!.id),
    enabled: selectedNode?.type === 'OPERATOR',
  });

  if (!selectedNode) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-30 select-none">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
           <Info size={32} strokeWidth={1} />
        </div>
        <p className="font-bold tracking-tight uppercase px-8 text-center">계층 구조에서 항목을 선택해 주세요.</p>
        <p className="text-[10px] mt-2 opacity-60">운영사, 팀 또는 운영자의 상세 정보를 관리할 수 있습니다.</p>
      </div>
    );
  }

  const renderMetadata = (data: any, type: string) => {
    if (!data) return null;

    const items = [];
    if (type === 'COMPANY') {
      items.push({ label: 'Company ID', value: data.id, isMono: true });
      items.push({ label: 'Status', value: data.status, isStatus: true });
      items.push({ label: 'Biz Number', value: data.businessNumber });
    } else if (type === 'TEAM') {
      items.push({ label: 'Team ID', value: data.id, isMono: true });
      items.push({ label: 'Status', value: data.status, isStatus: true });
      items.push({ label: 'Tenant', value: data.tenantId });
    } else {
      items.push({ label: 'User Record ID', value: data.id, isMono: true });
      items.push({ label: 'Role', value: data.role, isStatus: true });
      items.push({ label: 'Active', value: data.isActive ? 'YES' : 'NO' });
    }

    return (
      <div className="grid grid-cols-2 gap-4 mt-10 pt-10 border-t border-white/5 animate-slide-up">
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
           <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={16} className="text-cyan-400" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted">System Metadata</h4>
           </div>
           <div className="space-y-3">
              {items.map((item, idx) => (
                <MetaItem key={idx} {...item} />
              ))}
           </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
           <div className="flex items-center gap-2 mb-4">
              <Edit3 size={16} className="text-amber-400" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Audit Information</h4>
           </div>
           <div className="space-y-3">
              <MetaItem label="Created At" value={data.createdAt} isDate />
              <MetaItem label="Created By" value={data.createdBy} />
              <MetaItem label="Updated At" value={data.updatedAt} isDate />
              <MetaItem label="Updated By" value={data.updatedBy} />
           </div>
        </div>
      </div>
    );
  };

  const renderForm = () => {
    switch (selectedNode.type) {
      case 'COMPANY':
        return (
          <div className="fade-in pb-12">
             <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 border border-cyan-400/20">
                      <Building2 size={20} />
                    </div>
                    운영사 정보 관리
                  </h2>
                  <p className="text-[10px] text-text-muted mt-2 uppercase tracking-[0.3em] font-bold">Operator Company Profile</p>
                </div>
             </div>
             <OperatorCompanyForm 
                id={selectedNode.id} 
                onSubmit={(data: any) => updateCompany.mutateAsync({ id: selectedNode.id, company: data })}
                isLoading={updateCompany.isPending}
             />
             {renderMetadata(companyData, 'COMPANY')}
          </div>
        );
      case 'TEAM':
        return (
          <div className="fade-in pb-12">
             <div className="mb-8">
                <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <Users size={20} />
                  </div>
                  운영 팀 및 고객 매핑 관리
                </h2>
                <p className="text-[10px] text-text-muted mt-2 uppercase tracking-[0.3em] font-bold">Operator Team & Customer Scoping</p>
             </div>
             <OperatorTeamForm 
                id={selectedNode.id}
                onSubmit={(data: any) => updateTeam.mutateAsync({ id: selectedNode.id, team: data })}
                isLoading={updateTeam.isPending}
             />
             {renderMetadata(teamData, 'TEAM')}
          </div>
        );
      case 'OPERATOR':
        return (
          <div className="fade-in pb-12">
             <div className="mb-8">
                <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                    <UserCheck size={20} />
                  </div>
                  운영자 계정 관리
                </h2>
                <p className="text-[10px] text-text-muted mt-2 uppercase tracking-[0.3em] font-bold">Individual Operator Credentials</p>
             </div>
             <OperatorUserForm 
                id={selectedNode.id}
                onSubmit={(data: any) => updateOperator.mutateAsync({ id: selectedNode.id, operator: data })}
                isLoading={updateOperator.isPending}
             />
             {renderMetadata(operatorData, 'OPERATOR')}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-8">
      {renderForm()}
    </div>
  );
};

const MetaItem: React.FC<{ label: string; value: any; isMono?: boolean; isDate?: boolean; isStatus?: boolean }> = ({ 
  label, value, isMono, isDate, isStatus 
}) => (
  <div className="flex items-center justify-between text-[10px]">
    <span className="text-text-muted font-bold uppercase tracking-tighter">{label}</span>
    <span className={`
      ${isMono ? 'font-mono text-cyan-400' : 'text-text-secondary'}
      ${isStatus ? 'px-2 py-0.5 bg-cyan-400/10 text-cyan-400 rounded-full font-black' : ''}
    `}>
      {isDate ? (value ? new Date(value).toLocaleString() : 'N/A') : (value?.toString() || 'N/A')}
    </span>
  </div>
);

export default OperatorDetail;
export { OperatorDetail };

