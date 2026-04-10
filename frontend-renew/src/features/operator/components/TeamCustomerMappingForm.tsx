import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, CheckCircle2, Circle, Save, RefreshCw } from 'lucide-react';
import { customerApi } from '../../customer/api/customerApi';
import { operatorApi } from '../api/operatorApi';
import { useOperatorMutations } from '../hooks/useOperatorMutations';

interface TeamCustomerMappingFormProps {
  teamId: number;
}

const TeamCustomerMappingForm: React.FC<TeamCustomerMappingFormProps> = ({ teamId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { saveMappings } = useOperatorMutations();

  // --- Data Fetching ---
  const { data: allCustomers, isLoading: customersLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: customerApi.fetchCompanies,
  });

  const { data: currentMappings, isLoading: mappingsLoading } = useQuery({
    queryKey: ['teamMappings', teamId],
    queryFn: () => operatorApi.fetchMappingsByTeam(teamId),
  });

  // Track local selection before saving
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Initialize selection when data arrives
  React.useEffect(() => {
    if (currentMappings) {
      setSelectedIds(new Set(currentMappings.map(m => m.customerCompanyId)));
    }
  }, [currentMappings]);

  const filteredCustomers = useMemo(() => {
    if (!allCustomers) return [];
    return allCustomers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCustomers, searchTerm]);

  const toggleSelection = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSave = async () => {
    try {
      await saveMappings.mutateAsync({ teamId, customerIds: Array.from(selectedIds) });
      alert('매핑 정보가 성공적으로 저장되었습니다.');
    } catch (error) {
      alert('매핑 저장에 실패했습니다.');
    }
  };

  const isChanged = useMemo(() => {
    if (!currentMappings) return false;
    const currentIds = new Set(currentMappings.map(m => m.customerCompanyId));
    if (currentIds.size !== selectedIds.size) return true;
    for (const id of Array.from(selectedIds)) {
      if (!currentIds.has(id)) return true;
    }
    return false;
  }, [currentMappings, selectedIds]);

  if (customersLoading || mappingsLoading) {
    return <div className="py-10 text-center animate-pulse text-text-muted">Loading customer mapping data...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Customer Scoping</span>
            <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {selectedIds.size} Selected
            </span>
         </div>
         {isChanged && (
           <button 
             onClick={handleSave}
             disabled={saveMappings.isPending}
             className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs font-bold hover:bg-cyan-500 hover:text-white transition-all"
           >
             {saveMappings.isPending ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
             <span>Save Mapping Changes</span>
           </button>
         )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="고객사 명칭 또는 ID로 검색..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-all font-medium"
        />
      </div>

      <div className="max-h-[300px] overflow-y-auto pr-2 space-y-1 custom-scrollbar">
        {filteredCustomers.map(customer => {
          const isSelected = selectedIds.has(customer.id);
          return (
            <div 
              key={customer.id}
              onClick={() => toggleSelection(customer.id)}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                isSelected 
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                : 'bg-white/5 border-transparent text-text-secondary hover:bg-white/10'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-sm font-bold">{customer.name}</span>
                <span className="text-[10px] font-mono opacity-50">{customer.customerId}</span>
              </div>
              {isSelected ? <CheckCircle2 size={18} /> : <Circle size={18} className="opacity-20" />}
            </div>
          );
        })}
        {filteredCustomers.length === 0 && (
          <div className="py-10 text-center text-xs text-text-muted italic">검색 결과가 없습니다.</div>
        )}
      </div>
    </div>
  );
};

export default TeamCustomerMappingForm;
export { TeamCustomerMappingForm };
