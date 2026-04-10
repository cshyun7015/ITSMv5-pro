import React from 'react';
import { useOperatorMutations } from '../hooks/useOperatorMutations';

import { OperatorCompanyForm } from './OperatorCompanyForm';
import { OperatorTeamForm } from './OperatorTeamForm';
import { OperatorUserForm } from './OperatorUserForm';

interface OperatorDetailProps {
  selectedNode: { type: 'COMPANY' | 'TEAM' | 'OPERATOR'; id: number } | null;
}

const OperatorDetail: React.FC<OperatorDetailProps> = ({ selectedNode }) => {
  const { updateCompany, updateTeam, updateOperator } = useOperatorMutations();

  if (!selectedNode) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-muted">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <p className="font-bold">계층 구조에서 항목을 선택해 주세요.</p>
        <p className="text-xs mt-2">운영사, 팀 또는 운영자를 선택하여 상세 정보를 확인하고 수정할 수 있습니다.</p>
      </div>
    );
  }

  const renderForm = () => {
    switch (selectedNode.type) {
      case 'COMPANY':
        return (
          <div className="fade-in">
             <div className="mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  운영사 정보 관리
                </h2>
                <p className="text-xs text-text-muted mt-1 uppercase tracking-widest">Operator Company Profile</p>
             </div>
             <OperatorCompanyForm 
                id={selectedNode.id} 
                onSubmit={(data: any) => updateCompany.mutateAsync({ id: selectedNode.id, company: data })}
                isLoading={updateCompany.isPending}
             />
          </div>
        );
      case 'TEAM':
        return (
          <div className="fade-in">
             <div className="mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  운영 팀 및 고객 매핑 관리
                </h2>
                <p className="text-xs text-text-muted mt-1 uppercase tracking-widest">Operator Team & Customer Scoping</p>
             </div>
             <OperatorTeamForm 
                id={selectedNode.id}
                onSubmit={(data: any) => updateTeam.mutateAsync({ id: selectedNode.id, team: data })}
                isLoading={updateTeam.isPending}
             />
          </div>
        );
      case 'OPERATOR':
        return (
          <div className="fade-in">
             <div className="mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  운영자 계정 관리
                </h2>
                <p className="text-xs text-text-muted mt-1 uppercase tracking-widest">Individual Operator Credentials</p>
             </div>
             <OperatorUserForm 
                id={selectedNode.id}
                onSubmit={(data: any) => updateOperator.mutateAsync({ id: selectedNode.id, operator: data })}
                isLoading={updateOperator.isPending}
             />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full">
      {renderForm()}
    </div>
  );
};

export default OperatorDetail;
export { OperatorDetail };
