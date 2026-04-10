import React, { useState } from 'react';
import { OperatorTreeList } from './OperatorTreeList';
import { OperatorDetail } from './OperatorDetail';

const OperatorPage: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<{ type: 'COMPANY' | 'TEAM' | 'OPERATOR'; id: number } | null>(null);

  const handleSelectNode = (type: 'COMPANY' | 'TEAM' | 'OPERATOR', id: number) => {
    setSelectedNode({ type, id });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-3xl font-black text-white tracking-tight">운영 조직 관리</h1>
        <p className="text-text-muted mt-1 font-medium">운영사, 운영팀 및 운영자 계층 구조를 관리하고 고객사 매핑을 설정합니다.</p>
      </div>
      
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-230px)]">
        {/* 좌측 트리 영역 */}
        <div className="col-span-3 bg-background-secondary rounded-2xl border border-white/5 flex flex-col overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Global Organization Tree</span>
          </div>
          <OperatorTreeList 
            onSelectNode={handleSelectNode}
            selectedNode={selectedNode}
          />
        </div>

        {/* 우측 상세 영역 */}
        <div className="col-span-9 bg-background-secondary rounded-2xl border border-white/5 p-8 overflow-y-auto shadow-2xl relative">
          <OperatorDetail selectedNode={selectedNode} />
        </div>
      </div>
    </div>
  );
};

export default OperatorPage;
export { OperatorPage };
