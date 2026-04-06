import React, { useState, useEffect } from 'react';
import { X, LayoutGrid, Plus, Trash2, Search, CheckCircle2, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OperatorCompanyAPI from './api/OperatorCompany';
import apiClient from '../../../api/apiClient';

interface OperatorTeamMappingProps {
  operator: any;
  onClose: () => void;
}

const OperatorTeamMapping: React.FC<OperatorTeamMappingProps> = ({ operator, onClose }) => {
  const [mappedTeams, setMappedTeams] = useState<any[]>([]);
  const [availableTeams, setAvailableTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Multi-select state
  const [selectedAvailable, setSelectedAvailable] = useState<number[]>([]);
  const [selectedMapped, setSelectedMapped] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);

  const fetchMappings = async () => {
    setLoading(true);
    try {
      // Reload operator to get latest teams
      const opDetail = await OperatorCompanyAPI.getOperator(operator.id);
      setMappedTeams(opDetail.teams || []);

      const allTeams = await OperatorCompanyAPI.getAllTeams();
      const mappedIds = (opDetail.teams || []).map((t: any) => t.id);
      const available = allTeams.filter((t: any) => !mappedIds.includes(t.id));
      setAvailableTeams(available);
      
      // Reset selections
      setSelectedAvailable([]);
      setSelectedMapped([]);
    } catch (err) {
      console.error('Failed to fetch operator team mappings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, [operator.id]);

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
      await Promise.all(selectedAvailable.map(teamId => 
        apiClient.post(`/organization/operators/operators/${operator.id}/teams/${teamId}`)
      ));
      await fetchMappings();
    } catch (err) {
      console.error('Batch team assign failed', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleBatchUnassign = async () => {
    if (selectedMapped.length === 0) return;
    setProcessing(true);
    try {
      await Promise.all(selectedMapped.map(teamId => 
        apiClient.delete(`/organization/operators/operators/${operator.id}/teams/${teamId}`)
      ));
      await fetchMappings();
    } catch (err) {
      console.error('Batch team unassign failed', err);
    } finally {
      setProcessing(false);
    }
  };

  const filteredAvailable = availableTeams.filter(t => 
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.operatorCompanyName?.toLowerCase().includes(searchTerm.toLowerCase())
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
              <Users size={32} className="tw-text-white" />
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-3xl tw-line-height-none">운영팀 소속 관리 (Matrix)</span>
              <span className="tw-text-xs tw-text-indigo-400 tw-font-bold tw-uppercase tw-tracking-[0.2em] tw-mt-1">
                운영자 [{operator.name}] 소속 팀 다중 매핑 허브
              </span>
            </div>
          </h2>
          <button type="button" onClick={onClose} className="tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-white/5 hover:tw-bg-white/10 tw-rounded-full tw-text-slate-400 hover:tw-text-white tw-transition-all tw-border tw-border-white/5"><X size={24} /></button>
        </div>

        <div className="tw-flex tw-flex-1 tw-overflow-hidden">
          {/* Left Side: Available Teams */}
          <div className="tw-flex-1 tw-p-10 tw-bg-black/30 tw-flex tw-flex-col tw-gap-8 tw-border-r tw-border-white/5">
            <div className="tw-flex tw-justify-between tw-items-end">
               <h3 className="tw-text-xs tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-[0.2em] tw-flex tw-items-center tw-gap-4">
                <Search size={14} className="tw-text-indigo-500" /> 가용 운영팀 목록 ({filteredAvailable.length})
              </h3>
              {selectedAvailable.length > 0 && (
                <button 
                  onClick={handleBatchAssign}
                  disabled={processing}
                  className="tw-bg-indigo-600 hover:tw-bg-indigo-500 tw-text-white tw-px-6 tw-py-3 tw-rounded-2xl tw-text-xs tw-font-black tw-uppercase tw-tracking-widest tw-flex tw-items-center tw-gap-3 tw-shadow-lg tw-shadow-indigo-600/30 tw-transition-all"
                >
                  <Plus size={14} /> 팀 소속 추가 ({selectedAvailable.length})
                </button>
              )}
            </div>

            <div className="tw-relative">
              <Search className="tw-absolute tw-left-6 tw-top-1/2 tw--translate-y-1/2 tw-text-slate-500" size={16} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="운영팀 또는 MSP 명칭 검색..."
                className="tw-w-full tw-bg-white/5 tw-border tw-border-white/10 tw-pl-14 tw-pr-6 tw-py-5 tw-rounded-3xl tw-text-sm tw-text-white tw-outline-none focus:tw-border-indigo-500 tw-transition-all shadow-inner"
              />
            </div>

            <div className="tw-flex-1 tw-overflow-y-auto tw-pr-2 tw-space-y-3">
              {loading ? (
                <div className="tw-py-20 tw-text-center tw-text-slate-700 tw-text-xs tw-font-black tw-uppercase tw-tracking-[0.2em] tw-animate-pulse">Loading Teams...</div>
              ) : filteredAvailable.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => toggleAvailable(t.id)}
                  className={`tw-p-5 tw-rounded-[28px] tw-border tw-flex tw-items-center tw-gap-6 tw-cursor-pointer tw-transition-all ${selectedAvailable.includes(t.id) ? 'tw-bg-indigo-600/10 tw-border-indigo-500 tw-shadow-inner' : 'tw-bg-white/5 tw-border-white/5 hover:tw-border-white/20'}`}
                >
                  <div className={`tw-w-8 tw-h-8 tw-rounded-xl tw-border-2 tw-flex tw-items-center tw-justify-center tw-transition-all ${selectedAvailable.includes(t.id) ? 'tw-bg-indigo-600 tw-border-indigo-600' : 'tw-border-white/10 tw-bg-transparent'}`}>
                    {selectedAvailable.includes(t.id) && <CheckCircle2 size={16} className="tw-text-white" />}
                  </div>
                  <div className="tw-w-12 tw-h-12 tw-bg-white/5 tw-rounded-xl tw-flex tw-items-center tw-justify-center">
                    <LayoutGrid size={20} className="tw-text-indigo-400" />
                  </div>
                  <div className="tw-flex tw-flex-col">
                    <span className="tw-text-white tw-font-bold tw-text-sm">{t.name}</span>
                    <span className="tw-text-[10px] tw-text-slate-500 tw-font-black tw-uppercase tw-tracking-widest">{t.operatorCompanyName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="tw-bg-slate-900 tw-flex tw-items-center tw-px-2 tw-z-10">
             <div className="tw-h-full tw-w-[1px] tw-bg-white/5" />
          </div>

          {/* Right Side: Mapped Teams */}
          <div className="tw-flex-1 tw-p-10 tw-flex tw-flex-col tw-gap-8">
            <div className="tw-flex tw-justify-between tw-items-end">
               <h3 className="tw-text-xs tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-[0.2em] tw-flex tw-items-center tw-gap-4">
                <CheckCircle2 size={14} className="tw-text-emerald-500" /> 현재 소속된 운영팀 ({mappedTeams.length})
              </h3>
              {selectedMapped.length > 0 && (
                <button 
                  onClick={handleBatchUnassign}
                  disabled={processing}
                  className="tw-bg-rose-600 hover:tw-bg-rose-500 tw-text-white tw-px-6 tw-py-3 tw-rounded-2xl tw-text-xs tw-font-black tw-uppercase tw-tracking-widest tw-flex tw-items-center tw-gap-3 tw-shadow-lg tw-shadow-rose-600/30 tw-transition-all"
                >
                  <Trash2 size={14} /> 소속 해제 ({selectedMapped.length})
                </button>
              )}
            </div>

            <div className="tw-flex-1 tw-overflow-y-auto tw-pr-2 tw-space-y-4">
              <AnimatePresence mode="popLayout">
                {mappedTeams.length > 0 ? (
                  mappedTeams.map(t => (
                    <motion.div 
                      key={t.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => toggleMapped(t.id)}
                      className={`tw-p-6 tw-rounded-[32px] tw-border tw-flex tw-items-center tw-gap-6 tw-cursor-pointer tw-transition-all ${selectedMapped.includes(t.id) ? 'tw-bg-rose-500/10 tw-border-rose-500 tw-shadow-inner' : 'tw-bg-white/5 tw-border-white/5 hover:tw-border-white/20'}`}
                    >
                      <div className={`tw-w-8 tw-h-8 tw-rounded-xl tw-border-2 tw-flex tw-items-center tw-justify-center tw-transition-all ${selectedMapped.includes(t.id) ? 'tw-bg-rose-500 tw-border-rose-500' : 'tw-border-white/10 tw-bg-transparent'}`}>
                        {selectedMapped.includes(t.id) && <X size={16} className="tw-text-white" />}
                      </div>
                      <div className="tw-w-14 tw-h-14 tw-bg-emerald-500/10 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-border tw-border-emerald-500/10">
                        <LayoutGrid size={24} className="tw-text-emerald-400" />
                      </div>
                      <div className="tw-flex tw-flex-col">
                        <span className="tw-text-white tw-font-black tw-text-lg tw-tracking-tight">{t.name}</span>
                        <span className="tw-text-[10px] tw-text-slate-500 tw-font-bold tw-uppercase tw-tracking-widest">{t.operatorCompanyName}</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="tw-h-full tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-slate-600 tw-gap-4 tw-bg-white/5 tw-rounded-[48px] tw-border tw-border-dashed tw-border-white/10 tw-p-10">
                    <LayoutGrid size={48} className="tw-opacity-10" />
                    <span className="tw-text-sm tw-font-bold tw-uppercase tw-tracking-widest">배정된 팀 정보가 없습니다</span>
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
                <Users size={12} /> Matrix Assignment Hub
             </div>
             <p className="tw-text-[11px] tw-text-slate-500 tw-font-bold">운영자를 여러 조직에 동시 배정할 수 있습니다.</p>
          </div>
          <button onClick={onClose} className="tw-py-4 tw-px-12 tw-bg-white/5 hover:tw-bg-white/10 tw-text-slate-400 hover:tw-text-white tw-rounded-[20px] tw-font-black tw-uppercase tw-tracking-widest tw-text-[11px] tw-transition-all tw-border tw-border-white/5 shadow-2xl">구성 완료</button>
        </div>
      </motion.div>
    </div>
  );
};

export default OperatorTeamMapping;
