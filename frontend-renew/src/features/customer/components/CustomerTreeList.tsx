import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Users, ChevronRight, ChevronDown, Plus, Edit3 } from 'lucide-react';
import { customerApi } from '../api/customerApi';
import { CustomerCompany, CustomerTeam } from '../types/customerType';
import Modal from '../../../components/common/Modal';
import CustomerCompanyForm from './CustomerCompanyForm';
import CustomerTeamForm from './CustomerTeamForm';
import { useCustomerMutations } from '../hooks/useCustomerMutations';

interface CustomerTreeListProps {
  onSelectNode: (type: 'COMPANY' | 'TEAM', id: number) => void;
  selectedNode: { type: 'COMPANY' | 'TEAM'; id: number } | null;
}

const CustomerTreeList: React.FC<CustomerTreeListProps> = ({ onSelectNode, selectedNode }) => {
  const [expandedCompanies, setExpandedCompanies] = useState<Set<number>>(new Set());
  const [editingCompany, setEditingCompany] = useState<CustomerCompany | null>(null);
  const [addingTeamTo, setAddingTeamTo] = useState<number | null>(null);

  const { updateCompany, createTeam } = useCustomerMutations();

  // --- Data Fetching ---
  const { data: companies, isLoading: companiesLoading } = useQuery<CustomerCompany[]>({
    queryKey: ['companies'],
    queryFn: customerApi.fetchCompanies,
  });

  const toggleCompany = (id: number) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedCompanies(newExpanded);
  };

  const handleEditCompany = (company: CustomerCompany) => {
    setEditingCompany(company);
  };

  const handleAddTeam = (companyId: number) => {
    setAddingTeamTo(companyId);
  };

  const submitEditCompany = async (data: any) => {
    if (!editingCompany) return;
    try {
      await updateCompany.mutateAsync({ id: editingCompany.id, company: data });
      setEditingCompany(null);
    } catch (error) {
      alert('고객사 수정에 실패했습니다.');
    }
  };

  const submitAddTeam = async (data: any) => {
    if (!addingTeamTo) return;
    try {
      await createTeam.mutateAsync({ companyId: addingTeamTo, team: data });
      setAddingTeamTo(null);
      // Expand the company if it wasn't
      if (!expandedCompanies.has(addingTeamTo)) {
        toggleCompany(addingTeamTo);
      }
    } catch (error) {
      alert('팀 생성에 실패했습니다.');
    }
  };

  if (companiesLoading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-10 bg-white/5 rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
      <div className="space-y-1">
        {Array.isArray(companies) ? companies.map((company) => (
          <CompanyNode 
            key={company.id}
            company={company}
            isExpanded={expandedCompanies.has(company.id)}
            onToggle={() => toggleCompany(company.id)}
            isSelected={selectedNode?.type === 'COMPANY' && selectedNode.id === company.id}
            onSelect={() => onSelectNode('COMPANY', company.id)}
            onEdit={() => handleEditCompany(company)}
            onAddTeam={() => handleAddTeam(company.id)}
            selectedNode={selectedNode}
            onSelectNode={onSelectNode}
          />
        )) : (
          <div className="p-4 text-center text-[10px] text-text-muted italic opacity-50">고객사 정보를 불러올 수 없습니다.</div>
        )}
      </div>

      {/* Edit Company Modal */}
      <Modal 
        isOpen={!!editingCompany} 
        onClose={() => setEditingCompany(null)} 
        title="고객사 정보 수정"
      >
        {editingCompany && (
          <CustomerCompanyForm 
            initialData={editingCompany} 
            onSubmit={submitEditCompany} 
            isLoading={updateCompany.isPending} 
          />
        )}
      </Modal>

      {/* Add Team Modal */}
      <Modal 
        isOpen={!!addingTeamTo} 
        onClose={() => setAddingTeamTo(null)} 
        title="신규 팀 등록"
      >
        {addingTeamTo && (
          <CustomerTeamForm 
            companyId={addingTeamTo} 
            onSubmit={submitAddTeam} 
            isLoading={createTeam.isPending} 
          />
        )}
      </Modal>
    </div>
  );
};

// --- Sub-components ---

interface CompanyNodeProps {
  company: CustomerCompany;
  isExpanded: boolean;
  onToggle: () => void;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onAddTeam: () => void;
  selectedNode: { type: 'COMPANY' | 'TEAM'; id: number } | null;
  onSelectNode: (type: 'COMPANY' | 'TEAM', id: number) => void;
}

const CompanyNode: React.FC<CompanyNodeProps> = ({ 
  company, isExpanded, onToggle, isSelected, onSelect, onEdit, onAddTeam, selectedNode, onSelectNode 
}) => {
  const { data: tree, isLoading: treeLoading } = useQuery<CustomerTeam[]>({
    queryKey: ['orgTree', company.id],
    queryFn: () => customerApi.fetchOrganizationTree(company.id),
    enabled: isExpanded,
  });

  return (
    <div className="flex flex-col">
      <div 
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        className={`group flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
          isSelected ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'hover:bg-white/5 text-text-secondary'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className="p-1 hover:bg-white/10 rounded-md transition-colors"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <Building2 size={16} className={isSelected ? 'text-cyan-400' : 'text-text-muted'} />
          <span className="text-sm font-bold truncate tracking-tight">{company.name}</span>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <button 
            onClick={(e) => { e.stopPropagation(); onAddTeam(); }}
            className="p-1.5 hover:bg-white/10 rounded-lg text-text-muted hover:text-cyan-400" 
            title="팀 추가"
          >
            <Plus size={14} />
          </button>
           <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1.5 hover:bg-white/10 rounded-lg text-text-muted hover:text-amber-400" 
            title="수정"
          >
            <Edit3 size={14} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="ml-4 pl-4 border-l border-white/5 mt-1 space-y-1">
          {treeLoading ? (
            <div className="py-2 text-[10px] text-text-muted uppercase tracking-widest italic animate-pulse">Loading Teams...</div>
          ) : (
            <TeamTree nodes={tree || []} onSelect={onSelectNode} selectedNode={selectedNode} />
          )}
        </div>
      )}
    </div>
  );
};

const TeamTree: React.FC<{ 
  nodes: CustomerTeam[], 
  onSelect: (type: 'COMPANY' | 'TEAM', id: number) => void,
  selectedNode: { type: 'COMPANY' | 'TEAM'; id: number } | null 
}> = ({ nodes, onSelect, selectedNode }) => {
  return (
    <>
      {Array.isArray(nodes) && nodes.map(team => (
        <div key={team.id} className="flex flex-col">
          <div 
            onClick={() => onSelect('TEAM', team.id)}
            className={`group flex items-center justify-between p-2 rounded-lg transition-all cursor-pointer ${
              selectedNode?.type === 'TEAM' && selectedNode.id === team.id 
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
              : 'hover:bg-white/5 text-text-muted hover:text-text-primary'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Users size={14} className="shrink-0" />
              <span className="text-xs font-medium truncate">{team.name}</span>
            </div>
          </div>
          {/* Hierarchy support would go here recursively if teams have children */}
        </div>
      ))}
    </>
  );
};

export default CustomerTreeList;
