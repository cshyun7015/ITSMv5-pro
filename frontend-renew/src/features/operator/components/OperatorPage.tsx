import React, { useState } from 'react';
import { OperatorTreeList } from './OperatorTreeList';
import { OperatorDetail } from './OperatorDetail';
import { Plus, Users, Download } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import { OperatorCompanyForm } from './OperatorCompanyForm';
import { useOperatorMutations } from '../hooks/useOperatorMutations';

const OperatorPage: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<{ type: 'COMPANY' | 'TEAM' | 'OPERATOR'; id: number } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const { createCompany } = useOperatorMutations();

  const handleSelectNode = (type: 'COMPANY' | 'TEAM' | 'OPERATOR', id: number) => {
    setSelectedNode({ type, id });
  };

  const handleAddCompany = () => {
    setIsAddModalOpen(true);
  };

  const handleSubmitAdd = async (data: any) => {
    try {
      await createCompany.mutateAsync(data);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to create operator company:', error);
      alert('운영사 등록에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in relative pb-4 text-text-primary">
      {/* 글로벌 액션 바 */}
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users size={24} className="text-cyan-400 opacity-80" />
            <h2 className="text-3xl font-black tracking-tighter italic">운영 조직 관리</h2>
          </div>
          <p className="text-sm text-text-muted mt-1 font-medium italic opacity-60">
            운영사, 운영팀 및 운영자 계층 구조를 관리하고 고객사 매핑을 설정합니다.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 btn-md bg-white/5 border border-white/10 hover:bg-white/10 px-6 font-black tracking-widest text-[10px] rounded-xl transition-all">
            <Download size={14} />
            데이터 내보내기
          </button>
          <button 
            onClick={handleAddCompany}
            className="flex items-center gap-2 btn-md bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 active:scale-95 px-6 shadow-xl shadow-cyan-500/20 font-bold tracking-widest text-[10px] rounded-xl transition-all text-white"
          >
            <Plus size={16} />
            신규 운영사 등록
          </button>
        </div>
      </header>
      
      <div className="flex-1 flex gap-6 min-h-0">
        {/* 좌측 트리 영역 */}
        <div className="w-[400px] shrink-0 h-full bg-background-secondary/50 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
          <div className="p-6 border-b border-white/5 bg-white/5">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400/80">Organization Tree</h3>
          </div>
          <OperatorTreeList 
            onSelectNode={handleSelectNode}
            selectedNode={selectedNode}
          />
        </div>

        {/* 우측 상세 영역 */}
        <div className="flex-1 h-full min-w-0 bg-background-secondary/30 border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-inner relative">
          <OperatorDetail selectedNode={selectedNode} />
        </div>
      </div>

      {/* 운영사 등록 모달 */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="신규 운영사 등록"
      >
        <OperatorCompanyForm 
          onSubmit={handleSubmitAdd} 
          isLoading={createCompany.isPending} 
        />
      </Modal>
    </div>
  );
};

export default OperatorPage;
export { OperatorPage };
