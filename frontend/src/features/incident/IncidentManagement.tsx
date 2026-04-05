import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiIncident, type IncidentDTO } from './api/apiIncident';
import { useAuth } from '../auth/AuthProvider';
import { 
  AlertTriangle, Plus, Search, 
  Activity, Clock, 
  Trash2, Zap, Database, 
  Edit2, AlertOctagon
} from 'lucide-react';
import IncidentFormModal from './IncidentFormModal';
import './Incident.css';

// 🛑 Tactical Confirm Modal
const ConfirmModal: React.FC<{ 
  isOpen: boolean; 
  title: string; 
  message: string; 
  onConfirm: () => void; 
  onCancel: () => void;
  confirmLabel?: string;
  isDanger?: boolean;
}> = ({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', isDanger = true }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="inc-scoped">
        <div className="tw-fixed tw-inset-0 tw-z-[10000] tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-slate-950/80 tw-backdrop-blur-2xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="tw-bg-slate-900 tw-border tw-border-white/10 tw-w-full tw-max-w-md tw-rounded-[32px] tw-p-8 tw-shadow-2xl"
          >
            <div className="tw-flex tw-flex-col tw-items-center tw-text-center">
              <div className={`tw-p-4 tw-rounded-2xl tw-mb-6 ${isDanger ? 'tw-bg-rose-500/20 tw-text-rose-500' : 'tw-bg-blue-500/20 tw-text-blue-500'}`}>
                <AlertOctagon size={48} />
              </div>
              <h3 className="tw-text-xl tw-font-black tw-text-white tw-mb-2">{title}</h3>
              <p className="tw-text-sm tw-text-slate-400 tw-font-medium tw-leading-relaxed tw-mb-8">{message}</p>
              <div className="tw-flex tw-gap-4 tw-w-full">
                <button 
                  onClick={onCancel}
                  className="tw-flex-1 tw-py-4 tw-bg-white/5 hover:tw-bg-white/10 tw-text-white tw-font-bold tw-rounded-2xl tw-transition-all"
                >
                  취소
                </button>
                <button 
                  onClick={onConfirm}
                  className={`tw-flex-1 tw-py-4 tw-font-black tw-rounded-2xl tw-shadow-xl tw-transition-all active:tw-scale-95 ${isDanger ? 'tw-bg-rose-600 hover:tw-bg-rose-500 tw-text-white tw-shadow-rose-600/20' : 'tw-bg-blue-600 hover:tw-bg-blue-500 tw-text-white tw-shadow-blue-600/20'}`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )}
  </AnimatePresence>
);

// SLA Countdown Component
const SLACountdown: React.FC<{ dueDate?: string; isBreached?: boolean }> = ({ dueDate, isBreached }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!dueDate) return;
    const target = new Date(dueDate).getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft('SLA 위반');
        setProgress(0);
        clearInterval(timer);
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
        setProgress(Math.max(0, Math.min(100, (diff / (8 * 3600 * 1000)) * 100)));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [dueDate]);

  return (
    <div className="tw-mt-4">
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-1">
        <span className="tw-text-[10px] tw-text-slate-500 tw-uppercase tw-font-bold tw-tracking-widest">SLA 해결 목표</span>
        <span className={`tw-text-[10px] tw-font-mono tw-font-black ${isBreached || timeLeft === 'BREACHED' ? 'tw-text-rose-500' : 'tw-text-emerald-400'}`}>
          {timeLeft}
        </span>
      </div>
      <div className="inc-sla-track">
        <div 
          className={`inc-sla-bar ${progress < 30 ? 'urgent' : ''}`} 
          style={{ width: `${progress}%` }} 
        />
      </div>
    </div>
  );
};

const STATUS_LABELS: Record<string, string> = {
  NEW: '신규 (등록됨)',
  ASSIGNED: '배정 (담당자 지정됨)',
  IN_PROGRESS: '처리 중 (작업 진행)',
  ON_HOLD: '보류 (외부 대기 중)',
  RESOLVED: '조치 완료 (복구됨)',
  CLOSED: '최종 종료 (아카이브됨)'
};

const IncidentManagement: React.FC = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<IncidentDTO[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'ON_HOLD' | 'CLOSED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedIncident, setSelectedIncident] = useState<IncidentDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<IncidentDTO | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchIncidents = async (refreshSelectedId?: number) => {
    try {
      let statusParams: string[] = [];
      if (activeTab === 'ACTIVE') statusParams = ['NEW', 'ASSIGNED', 'IN_PROGRESS'];
      else if (activeTab === 'ON_HOLD') statusParams = ['ON_HOLD'];
      else if (activeTab === 'CLOSED') statusParams = ['RESOLVED', 'CLOSED'];

      const res = await apiIncident.list('SYSTEM', statusParams, currentPage - 1, itemsPerPage);
      setIncidents(res.data.content);
      setTotalElements(res.data.totalElements);
      setTotalPages(res.data.totalPages);

      if (refreshSelectedId) {
        const updated = res.data.content.find(i => i.id === refreshSelectedId);
        if (updated) setSelectedIncident(updated);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchIncidents(); }, [activeTab, currentPage]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter(i => 
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      i.incidentId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [incidents, searchTerm]);

  // Reset page when tab or search changes (Search is still client-side here for simplicity, 
  // but status is server-side)
  useEffect(() => { setCurrentPage(1); }, [activeTab]);

  const handleAction = async (type: 'create' | 'update', data: IncidentDTO) => {
    try {
      if (type === 'create') {
        await apiIncident.create({ ...data, tenantId: 'SYSTEM', requesterId: user?.userId || 'admin' });
        fetchIncidents();
      } else {
        const targetId = editingIncident?.id || selectedIncident?.id;
        if (targetId) {
          await apiIncident.update(targetId, data, user?.userId || 'admin');
          fetchIncidents(targetId);
        }
      }
      setIsModalOpen(false);
      setEditingIncident(null);
    } catch (err) { console.error(err); }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await apiIncident.delete(deletingId);
      setDeletingId(null);
      setSelectedIncident(null);
      fetchIncidents();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="inc-scoped">
      <div className="inc-root tw-p-8 tw-bg-slate-950/50 tw-min-h-screen tw-rounded-[40px]">
        {/* 🚀 Tactical Header */}
        <header className="tw-flex tw-justify-between tw-items-center tw-mb-10">
          <div className="tw-flex tw-items-center tw-gap-6">
            <div className="tw-p-4 tw-bg-blue-600/10 tw-rounded-3xl tw-border tw-border-blue-500/20 tw-shadow-2xl tw-shadow-blue-500/10">
              <Activity className="tw-text-blue-400" size={32} />
            </div>
            <div>
              <h1 className="tw-text-3xl tw-font-black tw-tracking-tight tw-text-white tw-flex tw-items-center tw-gap-2">
                인시던트 관제 센터 <span className="tw-text-sm tw-font-bold tw-py-1 tw-px-3 tw-bg-white/5 tw-rounded-full tw-text-slate-400 tw-border tw-border-white/10 tw-tracking-widest tw-ml-4">현장 운영 실습</span>
              </h1>
              <p className="tw-text-slate-500 tw-font-bold tw-uppercase tw-text-[10px] tw-tracking-widest tw-mt-1">실시간 서비스 복구 및 트리아지 워크스페이스</p>
            </div>
          </div>
          <button 
            className="tw-px-6 tw-py-3 tw-bg-blue-600 hover:tw-bg-blue-500 tw-text-white tw-rounded-2xl tw-font-black tw-flex tw-items-center tw-gap-2 tw-shadow-lg tw-shadow-blue-600/20 tw-transition-all active:tw-scale-95"
            onClick={() => { setEditingIncident(null); setIsModalOpen(true); }}
          >
            <Plus size={20} /> 티켓 생성
          </button>
        </header>

        {/* 📈 Bento Stats Ribbon */}
        <div className="tw-grid tw-grid-cols-4 tw-gap-4 tw-mb-8">
          {[
            { label: '전체 로드', value: incidents.length, icon: Database, color: 'tw-text-slate-400' },
            { label: '심각 장애 (P1)', value: incidents.filter(i => i.priority === 'P1').length, icon: AlertTriangle, color: 'tw-text-rose-500' },
            { label: '진행 중인 작업', value: incidents.filter(i => i.status !== 'RESOLVED').length, icon: Zap, color: 'tw-text-amber-400' },
            { label: 'SLA 경고/위반', value: incidents.filter(i => i.isSlaBreached).length, icon: Clock, color: 'tw-text-rose-400' }
          ].map((stat, idx) => (
            <div key={idx} className="inc-card tw-p-6">
              <div className="tw-flex tw-justify-between tw-items-start tw-mb-4">
                <stat.icon className={stat.color} size={24} />
                <div className="tw-text-[10px] tw-text-slate-600 tw-font-black tw-uppercase tw-tracking-widest">실시간</div>
              </div>
              <div className="tw-text-3xl tw-font-black tw-text-white">{stat.value}</div>
              <div className="tw-text-[10px] tw-text-slate-500 tw-font-bold tw-uppercase tw-mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="tw-grid tw-grid-cols-12 tw-gap-8">
          {/* Main List */}
          <div className="tw-col-span-12 lg:tw-col-span-8">
            {/* 🏷️ Status Quick-Tabs */}
            <div className="tw-flex tw-gap-2 tw-mb-6">
              {[
                { id: 'ALL', label: '전체 목록' },
                { id: 'ACTIVE', label: '진행 중' },
                { id: 'ON_HOLD', label: '보류됨' },
                { id: 'CLOSED', label: '종료/해결' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`tw-px-5 tw-py-2.5 tw-rounded-2xl tw-text-xs tw-font-black tw-transition-all tw-flex tw-items-center tw-gap-2 ${activeTab === tab.id ? 'tw-bg-blue-600 tw-text-white tw-shadow-lg tw-shadow-blue-600/30' : 'tw-bg-white/5 tw-text-slate-500 hover:tw-bg-white/10'}`}
                >
                  {tab.label}
                  {activeTab === tab.id && <span className="tw-px-2 tw-py-0.5 tw-bg-white/20 tw-rounded-lg tw-text-[9px]">{totalElements}</span>}
                </button>
              ))}
            </div>

            <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
              <div className="tw-text-sm tw-font-black tw-text-slate-400 tw-uppercase tw-tracking-widest">인시던트 ({totalElements})</div>
              <div className="tw-relative">
                <Search className="tw-absolute tw-left-4 tw-top-1/2 tw--translate-y-1/2 tw-text-slate-500" size={16} />
                <input 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="tw-bg-slate-900/60 tw-border tw-border-white/5 tw-rounded-2xl tw-pl-12 tw-pr-4 tw-py-2 tw-text-sm tw-outline-none tw-w-64 focus:tw-border-blue-500/50" 
                  placeholder="ID 또는 제목 검색..." 
                />
              </div>
            </div>

            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
              <AnimatePresence>
                {filteredIncidents.map((inc) => (
                  <motion.div
                    layout
                    key={inc.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setSelectedIncident(inc)}
                    className={`inc-card tw-p-6 tw-cursor-pointer tw-relative ${inc.priority === 'P1' ? 'inc-p1-pulse' : ''} ${selectedIncident?.id === inc.id ? 'tw-ring-2 tw-ring-blue-500/50 tw-bg-blue-900/10' : ''}`}
                  >
                    <div className="tw-flex tw-justify-between tw-mb-3">
                      <span className="tw-text-[10px] tw-font-mono tw-text-blue-500 tw-font-bold">{inc.incidentId}</span>
                      <div className="tw-flex tw-gap-2">
                        {inc.isMajorIncident && (
                          <span className="tw-bg-rose-500 tw-text-white tw-text-[9px] tw-font-black tw-px-2 tw-py-0.5 tw-rounded-full tw-animate-pulse">
                            메이저
                          </span>
                        )}
                        <span className={`inc-badge ${inc.status === 'NEW' ? 'tw-bg-blue-500/20 tw-text-blue-400' : 'tw-bg-emerald-500/10 tw-text-emerald-500'}`}>
                          {STATUS_LABELS[inc.status] || inc.status}
                        </span>
                        <span className={`inc-badge ${inc.priority === 'P1' ? 'inc-p1' : 'tw-bg-white/5 tw-text-slate-400'}`}>
                          {inc.priority}
                        </span>
                      </div>
                    </div>
                    <h3 className="tw-text-base tw-font-bold tw-text-white tw-leading-tight tw-mb-4">{inc.title}</h3>
                    <SLACountdown dueDate={inc.slaDueDate} isBreached={inc.isSlaBreached} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* 🔢 Pagination Controls */}
            {totalPages > 1 && (
              <div className="tw-flex tw-justify-center tw-mt-8 tw-gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="tw-p-2 tw-rounded-xl tw-bg-white/5 tw-text-slate-400 disabled:tw-opacity-30 hover:tw-bg-white/10 transition-all"
                >
                  ◀
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`tw-w-10 tw-h-10 tw-rounded-xl tw-text-xs tw-font-black tw-transition-all ${currentPage === i + 1 ? 'tw-bg-blue-600 tw-text-white tw-shadow-lg tw-shadow-blue-600/30' : 'tw-bg-white/5 tw-text-slate-500 hover:tw-bg-white/10'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="tw-p-2 tw-rounded-xl tw-bg-white/5 tw-text-slate-400 disabled:tw-opacity-30 hover:tw-bg-white/10 transition-all"
                >
                  ▶
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Detail */}
          <AnimatePresence>
            {selectedIncident && (
              <motion.div 
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="tw-col-span-12 lg:tw-col-span-4"
              >
                <div className="tw-bg-slate-900/80 tw-backdrop-blur-2xl tw-rounded-[32px] tw-p-8 tw-border tw-border-white/10 tw-sticky tw-top-8">
                  <div className="tw-flex tw-justify-between tw-mb-8">
                     <div>
                       <span className="tw-text-xs tw-font-mono tw-text-blue-400 tw-font-bold">{selectedIncident.incidentId}</span>
                       <h2 className="tw-text-xl tw-font-black tw-text-white tw-mt-2">{selectedIncident.title}</h2>
                     </div>
                     <div className="tw-flex tw-gap-2">
                       <button 
                         onClick={() => { setEditingIncident(selectedIncident); setIsModalOpen(true); }}
                         className="tw-p-2 hover:tw-bg-blue-500/10 tw-rounded-full tw-text-blue-400 transition-colors"
                       >
                         <Edit2 size={18}/>
                       </button>
                       <button 
                         onClick={() => selectedIncident.id && setDeletingId(selectedIncident.id)}
                         className="tw-p-2 hover:tw-bg-rose-500/10 tw-rounded-full tw-text-rose-500 transition-colors"
                        >
                          <Trash2 size={18}/>
                       </button>
                     </div>
                  </div>

                  <div className="tw-space-y-8">
                    <div className="tw-p-6 tw-bg-white/5 tw-rounded-[24px] tw-border tw-border-white/5">
                       <span className="tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest">티켓 상세 내용</span>
                       <p className="tw-text-sm tw-text-slate-300 tw-mt-3 tw-leading-relaxed">{selectedIncident.description}</p>
                    </div>

                    <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                       <div className="tw-p-4 tw-bg-white/2 tw-rounded-2xl tw-border tw-border-white/5">
                         <span className="tw-text-[10px] tw-font-black tw-text-slate-600 tw-uppercase">인시던트 상태</span>
                         <div className="tw-text-xs tw-font-bold tw-text-blue-400 tw-mt-1 inc-sidebar-status">{STATUS_LABELS[selectedIncident.status] || selectedIncident.status}</div>
                       </div>
                       <div className="tw-p-4 tw-bg-white/2 tw-rounded-2xl tw-border tw-border-white/5">
                         <span className="tw-text-[10px] tw-font-black tw-text-slate-600 tw-uppercase">영향도</span>
                         <div className="tw-text-xs tw-font-bold tw-text-white tw-mt-1">
                           {selectedIncident.isMajorIncident ? (
                             <span className="tw-text-rose-500 tw-font-black">대형 장애</span>
                           ) : (
                             selectedIncident.impact
                           )}
                         </div>
                       </div>
                       <div className="tw-p-4 tw-bg-white/2 tw-rounded-2xl tw-border tw-border-white/5">
                         <span className="tw-text-[10px] tw-font-black tw-text-slate-600 tw-uppercase">접수 채널</span>
                         <div className="tw-text-xs tw-font-bold tw-text-white tw-mt-1">{selectedIncident.channel || '기타'}</div>
                       </div>
                       <div className="tw-p-4 tw-bg-white/2 tw-rounded-2xl tw-border tw-border-white/5">
                         <span className="tw-text-[10px] tw-font-black tw-text-slate-600 tw-uppercase">영향 사용자</span>
                         <div className="tw-text-xs tw-font-bold tw-text-white tw-mt-1">{selectedIncident.affectedUserId || selectedIncident.requesterId}</div>
                       </div>
                    </div>

                    <div>
                      <span className="tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest tw-mb-4 tw-block">운영 타임라인</span>
                      <div className="inc-timeline-item">
                        <div className="inc-timeline-dot" />
                        <span className="tw-text-[10px] tw-text-slate-500">실시간 처리 피드</span>
                        <p className="tw-text-xs tw-text-slate-300 tw-mt-1">
                          {selectedIncident.isMajorIncident ? '중요: 대형 장애에 대한 우선순위 처리가 진행 중입니다. ' : ''}
                          인시던트의 원인 분석 및 해결 방안을 검토하고 있습니다.
                        </p>
                      </div>
                    </div>

                    {/* 🛡️ Status Action Control */}
                    <div className="tw-pt-6 tw-border-t tw-border-white/5">
                      <span className="tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest tw-mb-4 tw-block">워크플로우 조치</span>
                      <div className="tw-flex tw-flex-col tw-gap-3">
                        {selectedIncident.status === 'NEW' && (
                          <button 
                            onClick={() => handleAction('update', { ...selectedIncident, status: 'ASSIGNED' as any })}
                            className="tw-w-full tw-py-4 tw-bg-blue-600 hover:tw-bg-blue-500 tw-text-white tw-rounded-2xl tw-text-[10px] tw-font-black shadow-lg tw-shadow-blue-500/20 transition-all active:tw-scale-95"
                          >
                            운영자 배정 및 승인
                          </button>
                        )}
                        {(selectedIncident.status === 'ASSIGNED' || selectedIncident.status === 'ON_HOLD') && (
                          <button 
                            onClick={() => handleAction('update', { ...selectedIncident, status: 'IN_PROGRESS' as any })}
                            className="tw-w-full tw-py-4 tw-bg-amber-600 hover:tw-bg-amber-500 tw-text-white tw-rounded-2xl tw-text-[10px] tw-font-black shadow-lg tw-shadow-amber-500/20 transition-all active:tw-scale-95"
                          >
                            조치 시작
                          </button>
                        )}
                        {selectedIncident.status === 'IN_PROGRESS' && (
                          <button 
                            onClick={() => handleAction('update', { ...selectedIncident, status: 'RESOLVED' as any })}
                            className="tw-w-full tw-py-4 tw-bg-emerald-600 hover:tw-bg-emerald-500 tw-text-white tw-rounded-2xl tw-text-[10px] tw-font-black shadow-lg tw-shadow-emerald-500/20 transition-all active:tw-scale-95"
                          >
                            조치 완료 및 해결
                          </button>
                        )}
                        {['NEW', 'ASSIGNED', 'IN_PROGRESS'].includes(selectedIncident.status) && (
                          <button 
                            onClick={() => handleAction('update', { ...selectedIncident, status: 'ON_HOLD' as any })}
                            className="tw-w-full tw-py-3 tw-bg-slate-800 hover:tw-bg-slate-700 tw-text-slate-300 tw-rounded-2xl tw-text-[10px] tw-font-black transition-all active:tw-scale-95"
                          >
                            일시 중단 (Hold)
                          </button>
                        )}
                        {selectedIncident.status === 'RESOLVED' && (
                          <div className="tw-flex tw-gap-3">
                            <button 
                              onClick={() => handleAction('update', { ...selectedIncident, status: 'IN_PROGRESS' as any })}
                              className="tw-flex-1 tw-py-4 tw-bg-rose-600 hover:tw-bg-rose-500 tw-text-white tw-rounded-2xl tw-text-[10px] tw-font-black transition-all active:tw-scale-95"
                            >
                              재오픈 (Re-open)
                            </button>
                            <button 
                              onClick={() => handleAction('update', { ...selectedIncident, status: 'CLOSED' as any })}
                              className="tw-flex-1 tw-py-4 tw-bg-blue-900 hover:tw-bg-blue-800 tw-text-white tw-rounded-2xl tw-text-[10px] tw-font-black transition-all active:tw-scale-95"
                            >
                              최종 종료 처리
                            </button>
                          </div>
                        )}
                        {selectedIncident.status !== 'CLOSED' && selectedIncident.status !== 'RESOLVED' && (
                          <button 
                            onClick={() => handleAction('update', { ...selectedIncident, status: 'CLOSED' as any })}
                            className="tw-w-full tw-py-3 tw-bg-white/5 hover:tw-bg-white/10 tw-text-rose-500/70 tw-rounded-2xl tw-text-[10px] tw-font-black transition-all active:tw-scale-95"
                          >
                            인시던트 취소
                          </button>
                        )}
                        {selectedIncident.status === 'CLOSED' && (
                          <div className="tw-p-6 tw-bg-white/5 tw-rounded-2xl tw-text-center tw-border tw-border-white/5">
                            <p className="tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest">인시던트 종료됨</p>
                            <p className="tw-text-xs tw-text-slate-500 tw-mt-2">ITIL 데이터 관리 지침에 의해 레코드가 잠겼습니다.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <IncidentFormModal 
            incident={editingIncident}
            onClose={() => setIsModalOpen(false)}
            onSubmit={(data) => handleAction(editingIncident ? 'update' : 'create', data)}
          />
        )}
      </AnimatePresence>

      {/* 🛡️ Custom Tactical Confirm Modal */}
      <ConfirmModal 
        isOpen={deletingId !== null}
        title="레코드 영구 삭제"
        message="이 인시던트를 영구적으로 삭제하시겠습니까? 이 작업은 즉시 실행되며 ITIL 감사 로그에서 복구할 수 없습니다."
        confirmLabel="지금 삭제"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};

export default IncidentManagement;
