import React, { useState, useEffect } from 'react';
import { X, Building2, Plus, Trash2, ShieldCheck, Search, Link as LinkIcon, CheckCircle2, ChevronRight, LayoutGrid, ListChecks } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerCompanyAPI from '../customercompany/api/CustomerCompany';
import apiClient from '../../../api/apiClient';

interface TeamCustomerMappingProps {
  team: any;
  onClose: () => void;
}

const TeamCustomerMapping: React.FC<TeamCustomerMappingProps> = ({ team, onClose }) => {
  const [mappedCustomers, setMappedCustomers] = useState<any[]>([]);
  const [availableCustomers, setAvailableCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Multi-select state
  const [selectedAvailable, setSelectedAvailable] = useState<number[]>([]);
  const [selectedMapped, setSelectedMapped] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);

  const fetchMappings = async () => {
    setLoading(true);
    try {
      const mappingsResponse = await apiClient.get(`/organization/mappings/team/${team.id}`);
      setMappedCustomers(mappingsResponse.data);

      const allCustomersResponse = await CustomerCompanyAPI.getCustomerCompanies();
      const mappedIds = mappingsResponse.data.map((m: any) => m.customerCompanyId);
      const available = allCustomersResponse.filter((c: any) => !mappedIds.includes(c.id));
      setAvailableCustomers(available);
      
      // Reset selections after fetch
      setSelectedAvailable([]);
      setSelectedMapped([]);
    } catch (err) {
      console.error('Failed to fetch mappings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, [team.id]);

  const toggleAvailable = (id: number) => {
    setSelectedAvailable(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleMapped = (id: number) => {
    setSelectedMapped(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBatchAssign = async () => {
    if (selectedAvailable.length === 0) return;
    setProcessing(true);
    try {
      await Promise.all(selectedAvailable.map(id => 
        apiClient.post(`/organization/mappings/${team.id}/${id}`)
      ));
      await fetchMappings();
    } catch (err) {
      console.error('Batch assign failed', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleBatchUnassign = async () => {
    if (selectedMapped.length === 0) return;
    setProcessing(true);
    try {
      await Promise.all(selectedMapped.map(id => 
        apiClient.delete(`/organization/mappings/${team.id}/${id}`)
      ));
      await fetchMappings();
    } catch (err) {
      console.error('Batch unassign failed', err);
    } finally {
      setProcessing(false);
    }
  };

  const filteredAvailable = availableCustomers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.customerId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="tw-fixed tw-inset-0 tw-z-[2500] tw-flex tw-items-center tw-justify-center tw-p-6">
      <motion.div 
        className="tw-absolute tw-inset-0 tw-bg-black/90 tw-backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div 
        className="tw-relative tw-w-full tw-max-w-6xl tw-bg-slate-900 tw-border tw-border-white/10 tw-rounded-[48px] tw-overflow-hidden tw-flex tw-flex-col tw-shadow-2xl tw-h-[85vh]"
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="tw-p-10 tw-border-b tw-border-white/5 tw-flex tw-justify-between tw-items-center tw-bg-gradient-to-r tw-from-indigo-600/10 tw-to-transparent">
          <h2 className="tw-text-4xl tw-font-black tw-flex tw-items-center tw-gap-6 tw-tracking-tighter tw-text-white">
            <div className="tw-w-16 tw-h-16 tw-bg-indigo-600 tw-rounded-3xl tw-flex tw-items-center tw-justify-center tw-shadow-lg tw-shadow-indigo-500/20">
              <LinkIcon size={32} className="tw-text-white" />
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-3xl tw-line-height-none">고객사 일괄 매핑 (Batch)</span>
              <span className="tw-text-xs tw-text-indigo-400 tw-font-bold tw-uppercase tw-tracking-[0.2em] tw-mt-1">
                {team.name} 전담 고객사 다중 구성 허브
              </span>
            </div>
          </h2>
          <button type="button" onClick={onClose} className="tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-white/5 hover:tw-bg-white/10 tw-rounded-full tw-text-slate-400 hover:tw-text-white tw-transition-all tw-border tw-border-white/5"><X size={24} /></button>
        </div>

        <div className="tw-flex tw-flex-1 tw-overflow-hidden">
          {/* Left Side: Available List with checkboxes */}
          <div className="tw-flex-1 tw-p-10 tw-bg-black/30 tw-flex tw-flex-col tw-gap-8 tw-border-r tw-border-white/5">
            <div className="tw-flex tw-justify-between tw-items-end">
               <h3 className="tw-text-xs tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-[0.2em] tw-flex tw-items-center tw-gap-4">
                <Search size={14} className="tw-text-blue-500" /> 매핑 가능 고객사 ({filteredAvailable.length})
              </h3>
              {selectedAvailable.length > 0 && (
                <button 
                  onClick={handleBatchAssign}
                  disabled={processing}
                  className="tw-bg-indigo-600 hover:tw-bg-indigo-500 tw-text-white tw-px-6 tw-py-3 tw-rounded-2xl tw-text-xs tw-font-black tw-uppercase tw-tracking-widest tw-flex tw-items-center tw-gap-3 tw-shadow-lg tw-shadow-indigo-600/30 tw-transition-all"
                >
                  <Plus size={14} /> 일괄 매핑 ({selectedAvailable.length}) {processing && "..."}
                </button>
              )}
            </div>

            <div className="tw-relative">
              <Search className="tw-absolute tw-left-6 tw-top-1/2 tw--translate-y-1/2 tw-text-slate-500" size={16} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="고객사 이름 또는 ID 검색..."
                className="tw-w-full tw-bg-white/5 tw-border tw-border-white/10 tw-pl-14 tw-pr-6 tw-py-5 tw-rounded-3xl tw-text-sm tw-text-white tw-outline-none focus:tw-border-indigo-500 tw-transition-all shadow-inner"
              />
            </div>

            <div className="tw-flex-1 tw-overflow-y-auto tw-pr-2 tw-space-y-3">
              {loading ? (
                <div className="tw-py-20 tw-text-center tw-text-slate-700 tw-text-xs tw-font-black tw-uppercase tw-tracking-[0.2em] tw-animate-pulse">Loading Customers...</div>
              ) : filteredAvailable.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => toggleAvailable(c.id)}
                  className={`tw-p-5 tw-rounded-[28px] tw-border tw-flex tw-items-center tw-gap-6 tw-cursor-pointer tw-transition-all ${selectedAvailable.includes(c.id) ? 'tw-bg-indigo-600/10 tw-border-indigo-500 tw-shadow-inner' : 'tw-bg-white/5 tw-border-white/5 hover:tw-border-white/20'}`}
                >
                  <div className={`tw-w-8 tw-h-8 tw-rounded-xl tw-border-2 tw-flex tw-items-center tw-justify-center tw-transition-all ${selectedAvailable.includes(c.id) ? 'tw-bg-indigo-600 tw-border-indigo-600' : 'tw-border-white/10 tw-bg-transparent'}`}>
                    {selectedAvailable.includes(c.id) && <CheckCircle2 size={16} className="tw-text-white" />}
                  </div>
                  <div className="tw-w-12 tw-h-12 tw-bg-white/5 tw-rounded-xl tw-flex tw-items-center tw-justify-center">
                    <Building2 size={20} className="tw-text-slate-400" />
                  </div>
                  <div className="tw-flex tw-flex-col">
                    <span className="tw-text-white tw-font-bold tw-text-sm">{c.name}</span>
                    <span className="tw-text-[10px] tw-text-slate-500 tw-font-black tw-uppercase tw-tracking-widest">{c.customerId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Middle: Divider with action hints (Visual only) */}
          <div className="tw-bg-slate-900 tw-flex tw-items-center tw-px-2 tw-z-10">
             <div className="tw-h-full tw-w-[1px] tw-bg-white/5" />
          </div>

          {/* Right Side: Mapped List with checkboxes */}
          <div className="tw-flex-1 tw-p-10 tw-flex tw-flex-col tw-gap-8">
            <div className="tw-flex tw-justify-between tw-items-end">
               <h3 className="tw-text-xs tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-[0.2em] tw-flex tw-items-center tw-gap-4">
                <CheckCircle2 size={14} className="tw-text-emerald-500" /> 현재 매핑된 고객사 ({mappedCustomers.length})
              </h3>
              {selectedMapped.length > 0 && (
                <button 
                  onClick={handleBatchUnassign}
                  disabled={processing}
                  className="tw-bg-rose-600 hover:tw-bg-rose-500 tw-text-white tw-px-6 tw-py-3 tw-rounded-2xl tw-text-xs tw-font-black tw-uppercase tw-tracking-widest tw-flex tw-items-center tw-gap-3 tw-shadow-lg tw-shadow-rose-600/30 tw-transition-all"
                >
                  <Trash2 size={14} /> 일괄 해제 ({selectedMapped.length}) {processing && "..."}
                </button>
              )}
            </div>

            <div className="tw-flex-1 tw-overflow-y-auto tw-pr-2 tw-space-y-4">
              <AnimatePresence mode="popLayout">
                {mappedCustomers.length > 0 ? (
                  mappedCustomers.map(m => (
                    <motion.div 
                      key={m.customerCompanyId}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => toggleMapped(m.customerCompanyId)}
                      className={`tw-p-6 tw-rounded-[32px] tw-border tw-flex tw-items-center tw-gap-6 tw-cursor-pointer tw-transition-all ${selectedMapped.includes(m.customerCompanyId) ? 'tw-bg-rose-500/10 tw-border-rose-500 tw-shadow-inner' : 'tw-bg-white/5 tw-border-white/5 hover:tw-border-white/20'}`}
                    >
                      <div className={`tw-w-8 tw-h-8 tw-rounded-xl tw-border-2 tw-flex tw-items-center tw-justify-center tw-transition-all ${selectedMapped.includes(m.customerCompanyId) ? 'tw-bg-rose-500 tw-border-rose-500' : 'tw-border-white/10 tw-bg-transparent'}`}>
                        {selectedMapped.includes(m.customerCompanyId) && <X size={16} className="tw-text-white" />}
                      </div>
                      <div className="tw-w-14 tw-h-14 tw-bg-emerald-500/10 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-border tw-border-emerald-500/10">
                        <Building2 size={24} className="tw-text-emerald-400" />
                      </div>
                      <div className="tw-flex tw-flex-col">
                        <span className="tw-text-white tw-font-black tw-text-lg tw-tracking-tight">{m.customerCompanyName}</span>
                        <span className="tw-text-[10px] tw-text-slate-500 tw-font-bold tw-uppercase tw-tracking-widest">ID: {m.customerCompanyId}</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="tw-h-full tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-slate-600 tw-gap-4 tw-bg-white/5 tw-rounded-[48px] tw-border tw-border-dashed tw-border-white/10 tw-p-10">
                    <Building2 size={48} className="tw-opacity-10" />
                    <span className="tw-text-sm tw-font-bold tw-uppercase tw-tracking-widest">매핑된 정보가 없습니다</span>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="tw-p-10 tw-bg-black/50 tw-border-t tw-border-white/5 tw-flex tw-justify-between tw-items-center">
          <div className="tw-flex tw-gap-6 tw-items-center">
             <div className="tw-flex tw-items-center tw-gap-3 tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest bg-white/5 tw-py-2 tw-px-4 tw-rounded-full">
                <LayoutGrid size={12} /> Multi-Selection Mode
             </div>
             <p className="tw-text-[11px] tw-text-slate-500 tw-font-bold">항목을 클릭하여 선택한 후 상단의 배치 버튼을 이용하세요.</p>
          </div>
          <button onClick={onClose} className="tw-py-4 tw-px-12 tw-bg-white/5 hover:tw-bg-white/10 tw-text-slate-400 hover:tw-text-white tw-rounded-[20px] tw-font-black tw-uppercase tw-tracking-widest tw-text-[11px] tw-transition-all tw-border tw-border-white/5 shadow-2xl">구성 완료</button>
        </div>
      </motion.div>
    </div>
  );
};

export default TeamCustomerMapping;
