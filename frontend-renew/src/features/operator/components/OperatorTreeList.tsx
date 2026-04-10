import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Users, User, ChevronRight, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { operatorApi } from '../api/operatorApi';
import { OperatorCompany, OperatorTeam, Operator } from '../types/operatorType';
import Modal from '../../../components/common/Modal';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { useOperatorMutations } from '../hooks/useOperatorMutations';
import { OperatorCompanyForm } from './OperatorCompanyForm';
import { OperatorTeamForm } from './OperatorTeamForm';
import { OperatorUserForm } from './OperatorUserForm';

interface OperatorTreeListProps {
  onSelectNode: (type: 'COMPANY' | 'TEAM' | 'OPERATOR', id: number) => void;
  selectedNode: { type: 'COMPANY' | 'TEAM' | 'OPERATOR'; id: number } | null;
}

const OperatorTreeList: React.FC<OperatorTreeListProps> = ({ onSelectNode, selectedNode }) => {
  const [expandedCompanies, setExpandedCompanies] = useState<Set<number>>(new Set());
  const [expandedTeams, setExpandedTeams] = useState<Set<number>>(new Set());
  
  const [editingCompany, setEditingCompany] = useState<OperatorCompany | null>(null);
  const [addingTeamTo, setAddingTeamTo] = useState<number | null>(null);
  const [addingOperatorTo, setAddingOperatorTo] = useState<{ teamId: number; tenantId?: string } | null>(null);
  const [deletingNode, setDeletingNode] = useState<{ type: 'COMPANY' | 'TEAM' | 'OPERATOR'; id: number; name: string } | null>(null);

  const { createCompany, updateCompany, createTeam, createOperator, deleteCompany, deleteTeam, deleteOperator } = useOperatorMutations();

  // --- Data Fetching ---
  const { data: companies, isLoading: companiesLoading } = useQuery<OperatorCompany[]>({
    queryKey: ['operatorCompanies'],
    queryFn: operatorApi.fetchCompanies,
  });

  const toggleCompany = (id: number) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedCompanies(newExpanded);
  };

  const toggleTeam = (id: number) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedTeams(newExpanded);
  };

  const handleDeleteConfirm = async (hardDelete: boolean) => {
    if (!deletingNode) return;
    try {
      if (deletingNode.type === 'COMPANY') {
        await deleteCompany.mutateAsync({ id: deletingNode.id, hardDelete });
      } else if (deletingNode.type === 'TEAM') {
        await deleteTeam.mutateAsync({ id: deletingNode.id, hardDelete });
      } else {
        await deleteOperator.mutateAsync({ id: deletingNode.id, hardDelete });
      }
      setDeletingNode(null);
    } catch (error) {
      alert('삭제에 실패했습니다.');
    }
  };

  if (companiesLoading) {
    return (
      <div className="p-4 space-y-3 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-10 bg-white/5 rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2">
      <div className="space-y-1">
        {Array.isArray(companies) && companies.length > 0 ? (
          companies.map((company) => (
            <CompanyNode 
              key={company.id}
              company={company}
              isExpanded={expandedCompanies.has(company.id)}
              onToggle={() => toggleCompany(company.id)}
              isSelected={selectedNode?.type === 'COMPANY' && selectedNode.id === company.id}
              onSelect={() => onSelectNode('COMPANY', company.id)}
              onAddTeam={() => setAddingTeamTo(company.id)}
              onDelete={() => setDeletingNode({ type: 'COMPANY', id: company.id, name: company.name })}
              expandedTeams={expandedTeams}
              onToggleTeam={toggleTeam}
              selectedNode={selectedNode}
              onSelectNode={onSelectNode}
              onDeleteNode={(type, id, name) => setDeletingNode({ type, id, name })}
              onAddOperator={(teamId, tenantId) => setAddingOperatorTo({ teamId, tenantId })}
            />
          ))
        ) : (
          <div className="py-10 text-center text-xs text-text-muted italic opacity-50">등록된 운영사가 없습니다.</div>
        )}
      </div>

      {/* Create/Edit Company Modal */}
      <Modal 
        isOpen={!!editingCompany || (!companiesLoading && companies?.length === 0)} 
        onClose={() => setEditingCompany(null)} 
        title={editingCompany ? "운영사 정보 수정" : "신규 운영사 등록"}
      >
        <OperatorCompanyForm 
          id={editingCompany?.id} 
          onSubmit={async (data: any) => {
            if (editingCompany) await updateCompany.mutateAsync({ id: editingCompany.id, company: data });
            else await createCompany.mutateAsync(data);
            setEditingCompany(null);
          }}
          isLoading={updateCompany.isPending || createCompany.isPending}
        />
      </Modal>

      {/* Add Team Modal */}
      <Modal 
        isOpen={!!addingTeamTo} 
        onClose={() => setAddingTeamTo(null)} 
        title="신규 운영팀 등록"
      >
        {addingTeamTo && (
          <OperatorTeamForm 
            companyId={addingTeamTo} 
            defaultTenantId={companies?.find(c => c.id === addingTeamTo)?.tenantId}
            onSubmit={async (data: any) => {
              await createTeam.mutateAsync({ companyId: addingTeamTo, team: data });
              setAddingTeamTo(null);
            }} 
            isLoading={createTeam.isPending} 
          />
        )}
      </Modal>

      {/* Add Operator Modal */}
      <Modal 
        isOpen={!!addingOperatorTo} 
        onClose={() => setAddingOperatorTo(null)} 
        title="신규 운영자 등록"
      >
        {addingOperatorTo && (
          <OperatorUserForm 
            defaultTenantId={addingOperatorTo.tenantId}
            onSubmit={async (data: any) => {
              await createOperator.mutateAsync({ teamId: addingOperatorTo.teamId, operator: data });
              setAddingOperatorTo(null);
            }} 
            isLoading={createOperator.isPending} 
          />
        )}
      </Modal>
      <ConfirmModal
        isOpen={!!deletingNode}
        onClose={() => setDeletingNode(null)}
        onConfirm={handleDeleteConfirm}
        title="삭제 확인"
        message={`'${deletingNode?.name}' 정보를 정말로 삭제하시겠습니까?`}
        confirmLabel="삭제하기"
        isDangerous={true}
      />
    </div>
  );
};

// --- Sub-components for Tree rendering ---

interface CompanyNodeProps {
  company: OperatorCompany;
  isExpanded: boolean;
  onToggle: () => void;
  isSelected: boolean;
  onSelect: () => void;
  onAddTeam: () => void;
  onDelete: () => void;
  expandedTeams: Set<number>;
  onToggleTeam: (id: number) => void;
  selectedNode: any;
  onSelectNode: any;
  onDeleteNode: (type: 'COMPANY' | 'TEAM' | 'OPERATOR', id: number, name: string) => void;
  onAddOperator: (teamId: number, tenantId?: string) => void;
}

const CompanyNode: React.FC<CompanyNodeProps> = ({ 
  company, isExpanded, onToggle, isSelected, onSelect, onAddTeam, onDelete, 
  expandedTeams, onToggleTeam, selectedNode, onSelectNode, onDeleteNode, onAddOperator
}) => {
  const { data: teams, isLoading: teamsLoading } = useQuery<OperatorTeam[]>({
    queryKey: ['operatorTeams', company.id],
    queryFn: () => operatorApi.fetchTeamsByCompany(company.id),
    enabled: isExpanded,
  });

  return (
    <div className="flex flex-col">
      <div 
        onClick={onSelect}
        className={`group flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
          isSelected ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'hover:bg-white/5 text-text-secondary'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className="p-1 hover:bg-white/10 rounded-md"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <Building2 size={16} className={isSelected ? 'text-cyan-400' : 'text-text-muted'} />
          <span className="text-sm font-bold truncate">{company.name}</span>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onAddTeam(); }} className="p-1 hover:text-cyan-400" title="팀 추가"><Plus size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 hover:text-red-400" title="삭제"><Trash2 size={14} /></button>
        </div>
      </div>

      {isExpanded && (
        <div className="ml-4 pl-3 border-l border-white/5 mt-1 space-y-1">
          {teamsLoading ? (
            <div className="py-2 text-[10px] text-text-muted italic animate-pulse">Loading Teams...</div>
          ) : (
            teams?.map(team => (
              <TeamNode 
                key={team.id}
                team={team}
                isExpanded={expandedTeams.has(team.id)}
                onToggle={() => onToggleTeam(team.id)}
                isSelected={selectedNode?.type === 'TEAM' && selectedNode.id === team.id}
                onSelect={() => onSelectNode('TEAM', team.id)}
                onDelete={() => onDeleteNode('TEAM', team.id, team.name)}
                selectedNode={selectedNode}
                onSelectNode={onSelectNode}
                onDeleteNode={onDeleteNode}
                onAddOperator={onAddOperator}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

interface TeamNodeProps {
  team: OperatorTeam;
  isExpanded: boolean;
  onToggle: () => void;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  selectedNode: any;
  onSelectNode: (type: 'COMPANY' | 'TEAM' | 'OPERATOR', id: number) => void;
  onDeleteNode: (type: 'COMPANY' | 'TEAM' | 'OPERATOR', id: number, name: string) => void;
  onAddOperator: (teamId: number, tenantId?: string) => void;
}

const TeamNode: React.FC<TeamNodeProps> = ({ 
  team, isExpanded, onToggle, isSelected, onSelect, onDelete, 
  selectedNode, onSelectNode, onDeleteNode, onAddOperator 
}) => {
  const { data: operators, isLoading: operatorsLoading } = useQuery<Operator[]>({
    queryKey: ['teamOperators', team.id],
    queryFn: () => operatorApi.fetchOperatorsByTeam(team.id),
    enabled: isExpanded,
  });

  return (
    <div className="flex flex-col">
      <div 
        onClick={onSelect}
        className={`group flex items-center justify-between p-2 rounded-lg transition-all cursor-pointer ${
          isSelected ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-text-muted hover:text-text-primary'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="p-0.5">
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          <Users size={14} />
          <span className="text-xs font-medium truncate">{team.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); onAddOperator(team.id, team.tenantId); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-cyan-400" title="운영자 추가"><Plus size={12} /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400" title="팀 삭제"><Trash2 size={12} /></button>
        </div>
      </div>

      {isExpanded && (
        <div className="ml-4 pl-3 border-l border-white/5 mt-1 space-y-1">
          {operatorsLoading ? (
            <div className="py-1 text-[9px] text-text-muted italic">Loading Operators...</div>
          ) : (
            operators?.map(oper => (
              <div 
                key={oper.id}
                onClick={() => onSelectNode('OPERATOR', oper.id)}
                className="group/oper flex items-center justify-between p-1.5 rounded-md cursor-pointer transition-all hover:bg-white/5"
              >
                <div className="flex items-center gap-2">
                  <User size={12} className={selectedNode?.type === 'OPERATOR' && selectedNode.id === oper.id ? 'text-cyan-400' : 'text-text-muted'} />
                  <span className={`text-[11px] ${selectedNode?.type === 'OPERATOR' && selectedNode.id === oper.id ? 'text-cyan-400' : 'text-text-muted'}`}>
                    {oper.name}
                  </span>
                </div>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (onDeleteNode) onDeleteNode('OPERATOR', oper.id, oper.name); 
                  }} 
                  className="opacity-0 group-hover/oper:opacity-100 p-0.5 hover:text-red-400 text-text-muted transition-opacity"
                  title="운영자 삭제"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default OperatorTreeList;
export { OperatorTreeList };
