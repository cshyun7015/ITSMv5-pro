import React, { useState } from 'react';
import { Users, Plus, Download } from 'lucide-react';
import CustomerTreeList from './CustomerTreeList';
import CustomerDetail from './CustomerDetail';
import Modal from '../../../components/common/Modal';
import CustomerCompanyForm from './CustomerCompanyForm';
import { useCustomerMutations } from '../hooks/useCustomerMutations';

/**
 * 고객 조직 관리 메인 페이지 (MFE Module)
 * - [표준화] 400px 트리 - 가변 디테일 레이아웃 적용
 * - [프리미엄] 다크 모드 기반 Premium Deep Neutral 테마 적용
 */
const CustomerPage: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<{ type: 'COMPANY' | 'TEAM'; id: number } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const { createCompany } = useCustomerMutations();

  const handleSelectNode = (type: 'COMPANY' | 'TEAM', id: number) => {
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
      console.error('Failed to create company:', error);
      alert('고객사 등록에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in relative pb-4 text-text-primary">
      {/* 글로벌 액션 바 */}
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users size={24} className="text-cyan-400 opacity-80" />
            <h2 className="text-3xl font-black tracking-tighter italic">고객 조직 관리</h2>
          </div>
          <p className="text-sm text-text-muted mt-1 font-medium italic opacity-60">
            고객 유효 테넌트 전반의 조직 계층 구조와 ITIL 기반 메타데이터를 관리합니다.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 btn-md btn-secondary px-6 font-black tracking-widest text-sm rounded-xl">
            <Download size={14} />
            데이터 내보내기
          </button>
          <button 
            onClick={handleAddCompany}
            className="flex items-center gap-2 btn-md btn-primary px-6 shadow-xl shadow-brand-primary/20 font-bold tracking-widest text-sm rounded-xl"
          >
            <Plus size={16} />
            신규 고객사 등록
          </button>
        </div>
      </header>

      {/* 400px Tree - Flexible Detail Grid */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* 마스터 영역: 조직 트리 (400px 고정) */}
        <div className="w-[400px] shrink-0 h-full bg-background-secondary/50 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
          <div className="p-6 border-b border-white/5 bg-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400/80">Organization Tree</h3>
          </div>
          <CustomerTreeList onSelectNode={handleSelectNode} selectedNode={selectedNode} />
        </div>

        {/* 디테일 영역: 상세 정보 및 사용자 목록 (가변 영역) */}
        <div className="flex-1 h-full min-w-0 bg-background-secondary/30 border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-inner">
           <CustomerDetail selectedNode={selectedNode} />
        </div>
      </div>

      {/* 고객사 등록 모달 */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="신규 고객사 등록"
      >
        <CustomerCompanyForm 
          onSubmit={handleSubmitAdd} 
          isLoading={createCompany.isPending} 
        />
      </Modal>
    </div>
  );
};

export default CustomerPage;
