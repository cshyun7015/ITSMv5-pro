import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiIncident, type IncidentDTO } from './api/apiIncident';
import { useAuth } from '../auth/AuthProvider';
import CustomerCompany, { type CustomerCompanyDTO, type OperatorCompanyDTO } from '../organization/customercompany/api/CustomerCompany';
import { 
  Plus, Search, 
  Activity, Clock, 
  Trash2, Database, 
  Edit2, AlertOctagon,
  Building2,
  AlertCircle
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
  const [error, setError] = useState<string | null>(null);

  // Lists from System
  const [customerList, setCustomerList] = useState<CustomerCompanyDTO[]>([]);
  const [mspList, setMspList] = useState<OperatorCompanyDTO[]>([]);

  // Advanced Filters
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterMsp, setFilterMsp] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // URL Deep Link Support (e.g. ?search=INC-2026...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchVal = params.get('search');
    if (searchVal) {
      setSearchTerm(searchVal);
      setShowAdvancedSearch(true);
    }
  }, []);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [customers, msps] = await Promise.all([
          CustomerCompany.getCustomerCompanies(),
          CustomerCompany.getOperatorCompanies()
        ]);
        setCustomerList(customers);
        setMspList(msps);
      } catch (err) { console.error('Metadata fetch failed', err); }
    };
    fetchMetadata();
  }, []);

  const fetchIncidents = async (refreshSelectedId?: number) => {
    try {
      let statusParams: string[] = [];
      if (activeTab === 'ACTIVE') statusParams = ['NEW', 'ASSIGNED', 'IN_PROGRESS'];
      else if (activeTab === 'ON_HOLD') statusParams = ['ON_HOLD'];
      else if (activeTab === 'CLOSED') statusParams = ['RESOLVED', 'CLOSED'];

      const res = await apiIncident.list({
        tenantId: filterCustomer || undefined,
        mspId: filterMsp || undefined,
        startDate: filterStartDate ? `${filterStartDate}T00:00:00` : undefined,
        endDate: filterEndDate ? `${filterEndDate}T23:59:59` : undefined,
        status: statusParams,
        page: currentPage - 1,
        size: itemsPerPage
      });
      
      setIncidents(res.data.content);
      setTotalElements(res.data.totalElements);
      setTotalPages(res.data.totalPages);

      if (refreshSelectedId) {
        const updated = res.data.content.find(i => i.id === refreshSelectedId);
        if (updated) setSelectedIncident(updated);
      }
    } catch (err) { 
       console.error(err);
       setError('데이터를 불러오는 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => { fetchIncidents(); }, [activeTab, currentPage]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter(i => 
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      i.incidentId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [incidents, searchTerm]);

  // Aggregation per MSP for current view
  const mspAggregates = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach(inc => {
      const msp = inc.mspId || 'Unassigned';
      counts[msp] = (counts[msp] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [incidents]);

  useEffect(() => { setCurrentPage(1); }, [activeTab]);

  const handleAction = async (type: 'create' | 'update', data: IncidentDTO) => {
    try {
      if (type === 'create') {
        await apiIncident.create({ ...data, tenantId: data.tenantId || 'SYSTEM', requesterId: user?.userId || 'admin' });
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
      <div className="inc-root tw-p-6 tw-bg-slate-950/50 tw-min-h-screen tw-rounded-[32px]">
        {/* 🚀 Tactical Header - Condensed */}
        <header className="tw-flex tw-justify-between tw-items-center tw-mb-8">
          <div className="tw-flex tw-items-center tw-gap-4">
            <div className="tw-p-3 tw-bg-blue-600/10 tw-rounded-2xl tw-border tw-border-blue-500/20 tw-shadow-blue-500/10">
              <Activity className="tw-text-blue-400" size={24} />
            </div>
            <div>
              <h1 className="tw-text-2xl tw-font-black tw-tracking-tight tw-text-white tw-flex tw-items-center tw-gap-2">
                인시던트 관제 센터
              </h1>
              <p className="tw-text-slate-500 tw-font-bold tw-uppercase tw-text-[9px] tw-tracking-widest">Enterprise Incident Triage & Governance</p>
            </div>
          </div>
          <button 
            data-testid="btn-create-incident"
            className="tw-px-5 tw-py-2.5 tw-bg-blue-600 hover:tw-bg-blue-500 tw-text-white tw-rounded-xl tw-text-xs tw-font-black tw-flex tw-items-center tw-gap-2 tw-transition-all active:tw-scale-95"
            onClick={() => { setEditingIncident(null); setIsModalOpen(true); }}
          >
            <Plus size={16} /> 티켓 생성
          </button>
        </header>

        {error && (
          <div data-testid="error-message" className="tw-bg-rose-500/10 tw-border tw-border-rose-500/20 tw-p-4 tw-rounded-2xl tw-mb-6 tw-flex tw-justify-between tw-items-center">
            <div className="tw-flex tw-items-center tw-gap-3">
              <AlertCircle className="tw-text-rose-400" size={18} />
              <span className="tw-text-rose-400 tw-text-xs tw-font-bold">{error}</span>
            </div>
            <button onClick={() => { setError(null); fetchIncidents(); }} className="tw-text-[10px] tw-font-black tw-text-rose-400 tw-uppercase tw-bg-rose-500/10 tw-px-3 tw-py-1 tw-rounded-lg">Retry</button>
          </div>
        )}

        {/* 📈 Bento Stats Ribbon - Condensed with MSP Insights */}
        <div className="tw-grid tw-grid-cols-4 tw-gap-4 tw-mb-6">
          <div className="inc-card tw-p-4">
            <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
              <Database className="tw-text-slate-400" size={18} />
              <span className="tw-text-[9px] tw-text-slate-600 tw-font-black tw-uppercase">Load</span>
            </div>
            <div className="tw-text-2xl tw-font-black tw-text-white">{totalElements}</div>
            <div className="tw-text-[9px] tw-text-slate-500 tw-font-bold tw-uppercase">전체 인시던트</div>
          </div>
          <div className="inc-card tw-p-4">
            <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
              <Clock className="tw-text-emerald-400" size={18} />
              <span className="tw-text-[9px] tw-text-slate-600 tw-font-black tw-uppercase">Priority</span>
            </div>
            <div className="tw-text-2xl tw-font-black tw-text-white">{incidents.filter(i => i.priority === 'P1').length}</div>
            <div className="tw-text-[9px] tw-text-slate-500 tw-font-bold tw-uppercase">긴급 장애(P1)</div>
          </div>
          <div className="inc-card tw-p-4 tw-col-span-2">
            <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
              <Building2 className="tw-text-blue-400" size={18} />
              <span className="tw-text-[9px] tw-text-slate-600 tw-font-black tw-uppercase">MSP Distribution (Top MSPs)</span>
            </div>
            <div className="tw-flex tw-gap-4">
              {mspAggregates.slice(0, 3).map(([msp, count]) => (
                <div key={msp} className="tw-flex tw-items-center tw-gap-2">
                  <div className="tw-text-lg tw-font-black tw-text-white">{count}</div>
                  <div className="tw-text-[8px] tw-font-black tw-text-slate-400 tw-bg-white/5 tw-px-2 tw-py-1 tw-rounded">{msp}</div>
                </div>
              ))}
              {mspAggregates.length === 0 && <div className="tw-text-xs tw-text-slate-600 tw-py-1">현 페이지 데이터 없음</div>}
            </div>
          </div>
        </div>

        <div className="tw-grid tw-grid-cols-12 tw-gap-6">
          <div className="tw-col-span-12">
            <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
              <div className="tw-flex tw-gap-1.5">
                {[
                  { id: 'ALL', label: 'ALL' },
                  { id: 'ACTIVE', label: 'ACTIVE' },
                  { id: 'ON_HOLD', label: 'HOLD' },
                  { id: 'CLOSED', label: 'RESOLVED' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    data-testid={`tab-incident-${tab.id.toLowerCase()}`}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`tw-px-4 tw-py-1.5 tw-rounded-xl tw-text-[10px] tw-font-black tw-transition-all ${activeTab === tab.id ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white/5 tw-text-slate-500 hover:tw-bg-white/10'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="tw-flex tw-gap-3">
                <button 
                  data-testid="btn-toggle-advanced-search"
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                  className={`tw-px-3 tw-py-1.5 tw-rounded-xl tw-text-[10px] tw-font-black tw-transition-all tw-flex tw-items-center tw-gap-2 ${showAdvancedSearch ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white/5 tw-text-slate-400'}`}
                >
                  <Search size={14} /> FILTER
                </button>
                <div className="tw-relative">
                  <Search className="tw-absolute tw-left-3 tw-top-1/2 tw--translate-y-1/2 tw-text-slate-600" size={14} />
                  <input 
                    data-testid="input-incident-search"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="tw-bg-slate-900/60 tw-border tw-border-white/5 tw-rounded-xl tw-pl-9 tw-pr-3 tw-py-1.5 tw-text-[10px] tw-outline-none tw-w-48" 
                    placeholder="Search Title/ID..." 
                  />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showAdvancedSearch && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="tw-mb-4 tw-overflow-visible"
                >
                  <div className="tw-p-4 tw-bg-slate-900/80 tw-backdrop-blur-xl tw-border tw-border-white/10 tw-rounded-2xl tw-shadow-2xl">
                    <div className="tw-flex tw-flex-wrap tw-items-end tw-gap-3">
                      <div className="tw-flex-1 tw-min-w-[160px] tw-space-y-1.5">
                        <label className="tw-text-[9px] tw-font-black tw-text-slate-600 tw-uppercase">고객사</label>
                        <select 
                          data-testid="select-filter-customer"
                          value={filterCustomer}
                          onChange={e => setFilterCustomer(e.target.value)}
                          className="tw-w-full tw-bg-slate-800 tw-border tw-border-white/10 tw-rounded-lg tw-px-2 tw-py-1.5 tw-text-[10px] tw-text-white tw-outline-none"
                        >
                          <option value="">전체 고객사</option>
                          {customerList.map(c => (
                            <option key={c.id} value={c.customerId}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="tw-flex-1 tw-min-w-[160px] tw-space-y-1.5">
                        <label className="tw-text-[9px] tw-font-black tw-text-slate-600 tw-uppercase">운영사 (MSP)</label>
                        <select 
                          data-testid="select-filter-msp"
                          value={filterMsp}
                          onChange={e => setFilterMsp(e.target.value)}
                          className="tw-w-full tw-bg-slate-800 tw-border tw-border-white/10 tw-rounded-lg tw-px-2 tw-py-1.5 tw-text-[10px] tw-text-white tw-outline-none"
                        >
                          <option value="">전체 운영사</option>
                          {mspList.map(m => (
                            <option key={m.id} value={m.operatorCompanyId}>{m.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="tw-flex-[1.2] tw-min-w-[240px] tw-space-y-1.5">
                        <label className="tw-text-[9px] tw-font-black tw-text-slate-600 tw-uppercase">발생일 범위</label>
                        <div className="tw-flex tw-items-center tw-gap-2">
                          <input data-testid="input-filter-start-date" type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="tw-flex-1 tw-bg-white/5 tw-border tw-border-white/10 tw-rounded-lg tw-px-2 tw-py-1.5 tw-text-[10px] tw-text-white" />
                          <span className="tw-text-slate-700 tw-text-[10px]">~</span>
                          <input data-testid="input-filter-end-date" type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="tw-flex-1 tw-bg-white/5 tw-border tw-border-white/10 tw-rounded-lg tw-px-2 tw-py-1.5 tw-text-[10px] tw-text-white" />
                        </div>
                      </div>
                      <div className="tw-flex tw-gap-2 tw-ml-auto">
                        <button data-testid="btn-filter-reset" onClick={() => { setFilterCustomer(''); setFilterMsp(''); setFilterStartDate(''); setFilterEndDate(''); fetchIncidents(); }} className="tw-px-3 tw-py-1.5 tw-rounded-lg tw-bg-white/5 tw-text-slate-500 tw-text-[10px] tw-font-bold">Reset</button>
                        <button data-testid="btn-filter-apply" onClick={() => { setCurrentPage(1); fetchIncidents(); }} className="tw-px-5 tw-py-1.5 tw-rounded-lg tw-bg-blue-600 tw-text-white tw-text-[10px] tw-font-bold shadow-lg shadow-blue-600/20">Apply Filters</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 xl:tw-grid-cols-3 tw-gap-4">
              <AnimatePresence>
                {filteredIncidents.map((inc) => (
                  <motion.div
                    layout
                    key={inc.id}
                    data-testid={`incident-card-${inc.incidentId}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setSelectedIncident(inc)}
                    className={`inc-card tw-p-5 tw-cursor-pointer tw-relative tw-duration-300 hover:tw-translate-y-[-2px] ${inc.priority === 'P1' ? 'inc-p1-pulse' : ''} ${selectedIncident?.id === inc.id ? 'tw-ring-1 tw-ring-blue-500/50 tw-bg-blue-900/5' : ''}`}
                  >
                    <div className="tw-flex tw-justify-between tw-items-start tw-mb-3">
                      <div className="tw-flex tw-flex-col tw-gap-1">
                        <span className="tw-text-[9px] tw-font-mono tw-text-blue-500 tw-font-black">{inc.incidentId}</span>
                        <div className="tw-flex tw-gap-1.5">
                           <span className={`tw-px-2 tw-py-0.5 tw-rounded tw-text-[8px] tw-font-black ${inc.status === 'NEW' ? 'tw-bg-blue-500/20 tw-text-blue-400' : 'tw-bg-emerald-500/10 tw-text-emerald-500'}`}>
                            {STATUS_LABELS[inc.status] || inc.status}
                          </span>
                           {inc.isMajorIncident && (
                            <span className="tw-bg-rose-600/20 tw-text-rose-500 tw-text-[8px] tw-font-black tw-px-1.5 tw-py-0.5 tw-rounded tw-flex tw-items-center tw-gap-1">
                               MAJOR
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="tw-bg-white/5 tw-px-2 tw-py-1 tw-rounded-lg tw-text-[10px] tw-font-black tw-text-slate-500">
                        {inc.priority}
                      </div>
                    </div>
                    <h3 className="tw-text-sm tw-font-black tw-text-white tw-leading-tight tw-mb-4 tw-min-h-[2.5rem] line-clamp-2">{inc.title}</h3>
                    <div className="tw-pt-3 tw-border-t tw-border-white/5">
                      <SLACountdown dueDate={inc.slaDueDate} isBreached={inc.isSlaBreached} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* 🔢 Pagination Controls - Compact */}
            {totalPages > 1 && (
              <div className="tw-flex tw-justify-center tw-mt-6 tw-gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="tw-p-1.5 tw-rounded-lg tw-bg-white/5 tw-text-slate-500 disabled:opacity-30"
                >◀</button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`tw-w-7 tw-h-7 tw-rounded-lg tw-text-[10px] tw-font-black ${currentPage === i + 1 ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-white/5 tw-text-slate-500'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="tw-p-1.5 tw-rounded-lg tw-bg-white/5 tw-text-slate-500 disabled:opacity-30"
                >▶</button>
              </div>
            )}
          </div>
        </div>

        {/* 🚀 Slide-in Detail Drawer */}
        <AnimatePresence>
          {selectedIncident && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedIncident(null)}
                className="tw-fixed tw-inset-0 tw-bg-slate-950/60 tw-backdrop-blur-sm tw-z-[90]"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                className="tw-fixed tw-right-0 tw-top-0 tw-bottom-0 tw-w-full md:tw-w-[480px] tw-bg-slate-900/98 tw-backdrop-blur-3xl tw-border-l tw-border-white/10 tw-shadow-2xl tw-z-[100] tw-p-8 tw-overflow-y-auto"
              >
                <div className="tw-flex tw-justify-between tw-items-center tw-mb-8">
                  <div className="tw-text-[10px] tw-font-black tw-text-blue-500 tw-font-mono">{selectedIncident.incidentId}</div>
                  <div className="tw-flex tw-gap-2">
                    <button data-testid="btn-edit-incident" onClick={() => { setEditingIncident(selectedIncident); setIsModalOpen(true); }} className="tw-p-2 tw-bg-white/5 hover:tw-bg-blue-600 tw-text-slate-400 tw-rounded-lg"><Edit2 size={16} /></button>
                    <button data-testid="btn-delete-incident" onClick={() => setDeletingId(selectedIncident.id!)} className="tw-p-2 tw-bg-white/5 hover:tw-bg-rose-600 tw-text-slate-400 tw-rounded-lg"><Trash2 size={16} /></button>
                    <button data-testid="btn-close-drawer" onClick={() => setSelectedIncident(null)} className="tw-w-8 tw-h-8 tw-bg-white/5 tw-text-white tw-rounded-lg tw-ml-2">✕</button>
                  </div>
                </div>

                <div className="tw-space-y-8">
                  <div>
                    <h2 className="tw-text-2xl tw-font-black tw-text-white tw-leading-tight">{selectedIncident.title}</h2>
                    <div className="tw-flex tw-items-center tw-gap-3 tw-mt-4">
                      <span className={`tw-py-1 tw-px-3 tw-rounded-lg tw-text-[10px] tw-font-black ${selectedIncident.status === 'RESOLVED' ? 'tw-bg-emerald-500/20 tw-text-emerald-500' : 'tw-bg-blue-500/20 tw-text-blue-500'}`}>
                        {STATUS_LABELS[selectedIncident.status] || selectedIncident.status}
                      </span>
                      <span className="tw-py-1 tw-px-3 tw-bg-white/5 tw-text-slate-400 tw-rounded-lg tw-text-[10px] tw-font-black">
                        {selectedIncident.priority}
                      </span>
                    </div>
                  </div>

                  <div className="tw-p-6 tw-bg-white/2 tw-rounded-2xl tw-border tw-border-white/5">
                    <div className="tw-text-[9px] tw-text-slate-600 tw-font-black tw-uppercase tw-tracking-widest tw-mb-2">Description</div>
                    <p className="tw-text-xs tw-text-slate-300 tw-leading-relaxed tw-whitespace-pre-wrap">{selectedIncident.description}</p>
                  </div>

                  <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                    <div className="tw-p-4 tw-bg-white/5 tw-rounded-xl tw-border tw-border-white/5">
                      <div className="tw-text-[9px] tw-text-slate-600 tw-font-black tw-uppercase tw-mb-1">Customer</div>
                      <div className="tw-text-xs tw-font-bold tw-text-white">{selectedIncident.tenantId}</div>
                    </div>
                    <div className="tw-p-4 tw-bg-white/5 tw-rounded-xl tw-border tw-border-white/5">
                      <div className="tw-text-[9px] tw-text-slate-600 tw-font-black tw-uppercase tw-mb-1">MSP</div>
                      <div className="tw-text-xs tw-font-bold tw-text-white">{selectedIncident.mspId || 'N/A'}</div>
                    </div>
                  </div>

                  <SLACountdown dueDate={selectedIncident.slaDueDate} isBreached={selectedIncident.isSlaBreached} />

                  <div className="tw-p-6 tw-bg-blue-600/5 tw-rounded-2xl tw-border tw-border-blue-500/10">
                    <div className="tw-text-[10px] tw-font-black tw-text-blue-500 tw-uppercase tw-mb-4">Workflow Actions</div>
                    <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                      {['ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED'].map(s => {
                         const isCurrent = selectedIncident.status === s;
                         return (
                           <button
                             key={s}
                             disabled={isCurrent}
                             onClick={() => handleAction('update', { ...selectedIncident, status: s as any })}
                             className={`tw-px-3 tw-py-3 tw-rounded-xl tw-text-[9px] tw-font-black ${isCurrent ? 'tw-bg-blue-600 tw-text-white shadow-lg shadow-blue-600/20' : 'tw-bg-white/5 tw-text-slate-500 hover:tw-bg-white/10 opacity-70'}`}
                           >
                             {STATUS_LABELS[s] || s}
                           </button>
                         );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
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

      <ConfirmModal 
        isOpen={deletingId !== null}
        title="Delete Record"
        message="Permanently remove this incident? This action cannot be undone."
        confirmLabel="Delete Now"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};

export default IncidentManagement;
