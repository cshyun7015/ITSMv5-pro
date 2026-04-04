import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Users, LayoutGrid, Search, Plus, Eye, Edit, Trash2, 
  ChevronRight, ArrowLeft, RefreshCw, ShieldCheck, AlertTriangle, Activity, Globe, Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// API & Components
import OperatorCompanyAPI from './api/OperatorCompany';
import type { OperatorCompanyDTO, OperatorTeamDTO, OperatorDTO } from './api/OperatorCompany';
import OperatorCompanyForm from './OperatorCompanyForm';
import OperatorCompanyDetail from './OperatorCompanyDetail';
import OperatorTeamForm from './team/OperatorTeamForm';
import OperatorTeamDetail from './team/OperatorTeamDetail';
import OperatorUserForm from './user/OperatorUserForm';
import OperatorUserDetail from './user/OperatorUserDetail';
import TeamCustomerMapping from './TeamCustomerMapping';
import OperatorTeamMapping from './OperatorTeamMapping';

import './OperatorGovernance.css';

const OperatorGovernanceHub: React.FC = () => {
  // --- Core State ---
  const [companies, setCompanies] = useState<OperatorCompanyDTO[]>([]);
  const [teams, setTeams] = useState<OperatorTeamDTO[]>([]);
  const [users, setUsers] = useState<OperatorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Navigation State ---
  const [activeStep, setActiveStep] = useState<'COMPANY' | 'TEAM' | 'USER'>('COMPANY');
  const [selectedCompany, setSelectedCompany] = useState<OperatorCompanyDTO | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<OperatorTeamDTO | null>(null);

  // --- Modal State ---
  const [modalMode, setModalMode] = useState<'NONE' | 'FORM' | 'DETAIL' | 'DELETE'>('NONE');
  const [targetLevel, setTargetLevel] = useState<'COMPANY' | 'TEAM' | 'USER' | null>(null);
  const [targetItem, setTargetItem] = useState<any>(null);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [showUserMappingModal, setShowUserMappingModal] = useState(false);
  const [mappingTeam, setMappingTeam] = useState<any>(null);
  const [mappingUser, setMappingUser] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{level: string, id: number, name: string} | null>(null);

  // --- Data Fetching ---
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await OperatorCompanyAPI.getOperatorCompanies();
      setCompanies(data);
    } catch (err) {
      console.error('Failed to fetch operator companies', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async (companyId?: number) => {
    setLoading(true);
    try {
      const data = companyId ? await OperatorCompanyAPI.getOperatorTeams(companyId) : await OperatorCompanyAPI.getAllTeams();
      setTeams(data);
    } catch (err) {
      console.error('Failed to fetch teams', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (teamId?: number) => {
    setLoading(true);
    try {
      const data = teamId ? await OperatorCompanyAPI.getOperatorsByTeam(teamId) : await OperatorCompanyAPI.getAllOperators();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // --- Navigation Handlers ---
  const handleCompanySelect = (company: OperatorCompanyDTO) => {
    setSelectedCompany(company);
    setActiveStep('TEAM');
    fetchTeams(company.id);
  };

  const handleTeamSelect = (team: OperatorTeamDTO) => {
    setSelectedTeam(team);
    // If selecting a team from a global list, update the selected company
    if (!selectedCompany || selectedCompany.id !== team.operatorCompanyId) {
      const parentCompany = companies.find(c => c.id === team.operatorCompanyId);
      if (parentCompany) setSelectedCompany(parentCompany);
    }
    setActiveStep('USER');
    fetchUsers(team.id);
  };

  const goBack = () => {
    if (activeStep === 'USER') {
      setActiveStep('TEAM');
      setSelectedTeam(null);
    } else if (activeStep === 'TEAM') {
      setActiveStep('COMPANY');
      setSelectedCompany(null);
    }
  };

  // --- Modal Handlers ---
  const openForm = (level: 'COMPANY' | 'TEAM' | 'USER', item: any = null) => {
    setTargetLevel(level);
    setTargetItem(item);
    setModalMode('FORM');
  };

  const openMapping = (team: any) => {
    setMappingTeam(team);
    setShowMappingModal(true);
  };

  const openUserMapping = (user: any) => {
    setMappingUser(user);
    setShowUserMappingModal(true);
  };

  const openDetail = (level: 'COMPANY' | 'TEAM' | 'USER', item: any) => {
    setTargetLevel(level);
    setTargetItem(item);
    setModalMode('DETAIL');
  };

  const closeModal = () => {
    setModalMode('NONE');
    setTargetLevel(null);
    setTargetItem(null);
  };

  // --- CRUD Handlers ---
  const handleSaveCompany = async (data: any) => {
    try {
      if (data.id) {
        await OperatorCompanyAPI.updateOperatorCompany(data.id, data);
      } else {
        await OperatorCompanyAPI.createOperatorCompany(data);
      }
      fetchCompanies();
      closeModal();
    } catch (err) {
      console.error('Failed to save operator company', err);
    }
  };

  const handleSaveTeam = async (data: any) => {
    if (!selectedCompany) return;
    try {
      if (data.id) {
        await OperatorCompanyAPI.updateOperatorTeam(data.id, data);
      } else {
        await OperatorCompanyAPI.createOperatorTeam(selectedCompany.id, data);
      }
      fetchTeams(selectedCompany.id);
      closeModal();
    } catch (err) {
      console.error('Failed to save team', err);
    }
  };

  const handleSaveUser = async (data: any) => {
    try {
      if (data.id) {
        await OperatorCompanyAPI.updateOperator(data.id, data);
        if (selectedTeam) {
          fetchUsers(selectedTeam.id);
        } else {
          fetchUsers(); // Refresh global list if no team selected
        }
      } else if (selectedTeam) {
        await OperatorCompanyAPI.createOperator(selectedTeam.id, data);
        fetchUsers(selectedTeam.id);
      }
      closeModal();
    } catch (err) {
      console.error('Failed to save user', err);
    }
  };

  const handleDeleteRequested = (level: 'COMPANY' | 'TEAM' | 'USER', item: any) => {
    setDeleteTarget({ level, id: item.id, name: item.name });
    setModalMode('DELETE');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { level, id } = deleteTarget;
      if (level === 'COMPANY') {
        await OperatorCompanyAPI.deleteOperatorCompany(id);
        fetchCompanies();
      } else if (level === 'TEAM' && selectedCompany) {
        await OperatorCompanyAPI.deleteOperatorTeam(id);
        fetchTeams(selectedCompany.id);
      } else if (level === 'USER' && selectedTeam) {
        await OperatorCompanyAPI.deleteOperator(id);
        fetchUsers(selectedTeam.id);
      }
      closeModal();
    } catch (err) {
      console.error('Failed to delete resource', err);
    }
  };

  // --- Filtered Data ---
  const filteredData = useMemo(() => {
    if (activeStep === 'COMPANY') return companies.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (activeStep === 'TEAM') return teams.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (activeStep === 'USER') return users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return [];
  }, [companies, teams, users, activeStep, searchTerm]);

  return (
    <div className="operator-hub-container">
      <div className="tw-max-w-[1600px] tw-mx-auto tw-space-y-8">
        
        {/* Hub Header */}
        <header className="tw-flex tw-justify-between tw-items-end">
          <div className="tw-space-y-3">
            <div className="tw-flex tw-items-center tw-gap-4">
              <div className="operator-title-icon">
                <ShieldCheck size={28} className="tw-text-white" />
              </div>
              <div>
                <h1 className="tw-text-4xl tw-font-bold tw-tracking-tightest tw-uppercase">운영 조직 관리</h1>
                <p className="tw-text-indigo-400 tw-text-xs tw-font-semibold tw-uppercase tw-tracking-widest">ITIL v5 시스템 운영 거버넌스</p>
              </div>
            </div>
          </div>
          
          <div className="tw-flex tw-items-center tw-gap-4">
             <div className="tw-relative">
               <Search className="tw-absolute tw-left-4 tw-top-1/2 tw-transform tw--translate-y-1/2 tw-text-slate-500" size={16} />
               <input 
                type="text" placeholder="MSP / 운영팀 / 운영자 검색..." 
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="tw-bg-white/5 tw-border tw-border-white/10 tw-pl-12 tw-pr-6 tw-py-3 tw-rounded-xl tw-w-72 tw-font-medium focus:tw-border-indigo-500 tw-transition-all tw-outline-none tw-text-sm" 
               />
             </div>
             <button 
              onClick={() => openForm(activeStep)}
              className="operator-btn-primary"
             >
               <Plus size={14} /> {activeStep === 'COMPANY' ? 'MSP' : activeStep === 'TEAM' ? '운영팀' : '운영자'} 등록
             </button>
          </div>
        </header>

        {/* Navigation Breadcrumbs */}
        <nav className="operator-breadcrumb-nav">
           <button 
            onClick={() => setActiveStep('COMPANY')}
            className={`nav-button ${activeStep === 'COMPANY' ? 'nav-button-active' : 'nav-button-inactive'}`}
           >
             <Building2 size={18} /> <span className="tw-text-[10px] tw-font-bold tw-uppercase tw-tracking-widest">MSP 관리</span>
           </button>
           <ChevronRight size={14} className="tw-text-slate-700" />
           <button 
            onClick={() => { setActiveStep('TEAM'); fetchTeams(selectedCompany?.id); }}
            className={`nav-button ${activeStep === 'TEAM' ? 'nav-button-active' : 'nav-button-inactive'}`}
           >
             <LayoutGrid size={18} /> <span className="tw-text-[10px] tw-font-bold tw-uppercase tw-tracking-widest">운영팀 관리</span>
           </button>
           <ChevronRight size={14} className="tw-text-slate-700" />
           <button 
            onClick={() => { setActiveStep('USER'); fetchUsers(selectedTeam?.id); }}
            className={`nav-button ${activeStep === 'USER' ? 'nav-button-active' : 'nav-button-inactive'}`}
           >
             <Users size={18} /> <span className="tw-text-[10px] tw-font-bold tw-uppercase tw-tracking-widest">운영자 관리</span>
           </button>
        </nav>

        {/* Structural Context Bar */}
        {(selectedCompany || selectedTeam) && (
          <div className="tw-flex tw-items-center tw-gap-8 tw-p-6 tw-bg-indigo-500/5 tw-border tw-border-indigo-500/10 tw-rounded-2xl">
            <button onClick={goBack} className="tw-p-3 tw-bg-white/5 hover:tw-bg-white/10 tw-rounded-full tw-text-indigo-400 tw-transition-all border border-indigo-500/20">
               <ArrowLeft size={18} />
            </button>
            <div className="tw-flex tw-items-center tw-gap-10">
               {selectedCompany && (
                 <div className="tw-flex tw-items-center tw-gap-3">
                   <div className="tw-w-8 tw-h-8 tw-bg-indigo-600 tw-rounded-lg tw-flex tw-items-center tw-justify-center"><Building2 size={16} /></div>
                   <div className="tw-space-y-0.5">
                     <div className="tw-text-[8px] tw-font-bold tw-text-indigo-500 tw-uppercase tw-tracking-widest">선택된 MSP</div>
                     <div className="tw-text-white tw-font-bold tw-text-lg">{selectedCompany.name}</div>
                   </div>
                 </div>
               )}
               {selectedTeam && (
                 <div className="tw-flex tw-items-center tw-gap-3 tw-border-l tw-border-white/10 tw-pl-8">
                   <div className="tw-w-8 tw-h-8 tw-bg-indigo-600 tw-rounded-lg tw-flex tw-items-center tw-justify-center"><LayoutGrid size={16} /></div>
                   <div className="tw-space-y-0.5">
                     <div className="tw-text-[8px] tw-font-bold tw-text-indigo-500 tw-uppercase tw-tracking-widest">대상 운영팀</div>
                     <div className="tw-text-white tw-font-bold tw-text-lg">{selectedTeam.name}</div>
                   </div>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="operator-table-card">
          <table className="operator-table">
            <thead>
              <tr className="tw-border-b tw-border-white/5">
                <th className="tw-px-6 tw-py-4 tw-text-left tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest">MSP (이름 / ID)</th>
                <th className="tw-px-6 tw-py-4 tw-text-left tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest">{activeStep === 'USER' ? '연락처 (이메일)' : '등록 일자'}</th>
                <th className="tw-px-6 tw-py-4 tw-text-left tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest">상태</th>
                <th className="tw-px-6 tw-py-4 tw-text-right tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="tw-py-24 tw-px-8 tw-text-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="tw-inline-block">
                      <RefreshCw size={48} className="tw-text-indigo-500 tw-opacity-50" />
                    </motion.div>
                    <p className="tw-mt-6 tw-text-slate-400 tw-font-semibold tw-uppercase tw-tracking-widest tw-text-xs">데이터를 동기화하고 있습니다...</p>
                  </td>
                </tr>
              ) : filteredData.map((item, idx) => {
                const anyItem = item as any;
                return (
                <motion.tr 
                  key={item.id} 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: idx * 0.05 }}
                  className="tw-border-b tw-border-white/5 hover:tw-bg-white/[0.02] tw-transition-all group"
                  onClick={() => activeStep === 'COMPANY' ? handleCompanySelect(item as OperatorCompanyDTO) : activeStep === 'TEAM' ? handleTeamSelect(item as OperatorTeamDTO) : null}
                  style={{ cursor: activeStep === 'USER' ? 'default' : 'pointer' }}
                >
                  <td className="tw-px-6 tw-py-4">
                    <div className="tw-flex tw-items-center tw-gap-4">
                      <div className="tw-w-10 tw-h-10 tw-bg-white/5 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-text-indigo-500 group-hover:tw-bg-indigo-600 group-hover:tw-text-white tw-transition-all">
                        {activeStep === 'COMPANY' ? <Building2 size={20} /> : activeStep === 'TEAM' ? <LayoutGrid size={20} /> : <Users size={20} />}
                      </div>
                      <div className="tw-space-y-0.5">
                        <div className="tw-text-white tw-font-bold tw-text-base tw-tracking-tight">{item.name}</div>
                        <div className="tw-text-slate-400 tw-font-mono tw-text-xs">
                          {activeStep === 'COMPANY' ? anyItem.operatorCompanyId : activeStep === 'USER' ? anyItem.userId : `#UNIT-${item.id}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="tw-px-6 tw-py-5">
                    <div className="tw-text-slate-400 tw-font-bold">
                      {activeStep === 'USER' ? anyItem.email : (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '2024.11.23')}
                    </div>
                  </td>
                  <td className="tw-px-6 tw-py-5">
                    <div className="tw-flex tw-items-center tw-gap-3">
                      <div className={`status-dot ${(!anyItem.status || anyItem.status === 'ACTIVE' || anyItem.isActive) ? 'status-active-dot' : 'status-inactive-dot'}`} />
                      <span className="tw-text-xs tw-font-bold tw-uppercase tw-tracking-widest">
                         {(!anyItem.status || anyItem.status === 'ACTIVE' || anyItem.isActive) ? '운영 중' : '중지됨'}
                      </span>
                    </div>
                  </td>
                  <td className="tw-px-6 tw-py-3 tw-text-right">
                    <div className="tw-flex tw-justify-end tw-gap-2" onClick={(e) => e.stopPropagation()}>
                      {activeStep === 'TEAM' && (
                        <button onClick={() => openMapping(item)} className="tw-p-2.5 tw-bg-indigo-600/10 hover:tw-bg-indigo-600/20 hover:tw-text-indigo-400 tw-rounded-lg tw-transition-all tw-border tw-border-white/5" title="고객사 매핑">
                          <Plus size={16} />
                        </button>
                      )}
                      {activeStep === 'USER' && (
                        <button onClick={() => openUserMapping(item)} className="tw-p-2.5 tw-bg-indigo-600/10 hover:tw-bg-indigo-600/20 hover:tw-text-indigo-400 tw-rounded-lg tw-transition-all tw-border tw-border-white/5" title="운영팀 매핑">
                          <LayoutGrid size={16} />
                        </button>
                      )}
                      <button onClick={() => openDetail(activeStep, item)} className="tw-p-2.5 tw-bg-white/5 hover:tw-bg-indigo-600/20 hover:tw-text-indigo-400 tw-rounded-lg tw-transition-all tw-border tw-border-white/5">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => openForm(activeStep, item)} className="tw-p-2.5 tw-bg-white/5 hover:tw-bg-amber-600/20 hover:tw-text-amber-400 tw-rounded-lg tw-transition-all tw-border tw-border-white/5">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteRequested(activeStep, item)} className="tw-p-2.5 tw-bg-white/5 hover:tw-bg-rose-600/20 hover:tw-text-rose-400 tw-rounded-lg tw-transition-all tw-border tw-border-white/5">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )})}
            </tbody>
          </table>
          
          {!loading && filteredData.length === 0 && (
            <div className="tw-py-40 tw-text-center tw-space-y-6">
               <Activity size={64} className="tw-mx-auto tw-text-slate-800" />
               <div className="tw-space-y-2">
                 <p className="tw-text-slate-400 tw-font-black tw-uppercase tw-tracking-widest tw-text-sm">데이터가 없습니다</p>
                 <p className="tw-text-slate-600 tw-text-xs">상단의 등록 버튼을 눌러 항목을 구성해 주세요.</p>
               </div>
            </div>
          )}
        </div>
        
        {/* Hub Footer Analytics */}
        <footer className="tw-grid tw-grid-cols-4 tw-gap-8">
            { [
              { label: 'MSP 수', val: companies.length, icon: Globe, color: 'indigo' },
              { label: '운영팀 수', val: selectedCompany ? (teams.length || selectedCompany.teamCount || 0) : companies.reduce((acc, c) => acc + (c.teamCount || 0), 0), icon: LayoutGrid, color: 'emerald' },
              { label: '운영자 수', val: selectedTeam ? (users.length || 0) : (selectedCompany ? (selectedCompany.operatorCount || 0) : companies.reduce((acc, c) => acc + (c.operatorCount || 0), 0)), icon: Users, color: 'amber' },
              { label: '거버넌스 상태', val: '99.8%', icon: Scale, color: 'rose' }
            ].map((stat, i) => ( stat.label &&
              <div key={i} className="tw-bg-white/5 tw-p-6 tw-rounded-2xl tw-border tw-border-white/5 tw-flex tw-items-center tw-gap-4 shadow-inner">
                <div className={`tw-w-10 tw-h-10 tw-bg-${stat.color}-600/10 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-text-${stat.color}-500`}>
                  <stat.icon size={18} />
                </div>
                <div>
                   <div className="tw-text-[9px] tw-text-slate-500 tw-font-bold tw-uppercase tw-tracking-widest">{stat.label}</div>
                   <div className="tw-text-xl tw-text-white tw-font-bold">{stat.val}</div>
                </div>
              </div>
            ))}
        </footer>
      </div>

      {/* Dynamic Modal Layer */}
      <AnimatePresence>
        {modalMode === 'FORM' && (
          <>
            {targetLevel === 'COMPANY' && <OperatorCompanyForm company={targetItem} onClose={closeModal} onSave={handleSaveCompany} />}
            {targetLevel === 'TEAM' && <OperatorTeamForm team={targetItem} onClose={closeModal} onSave={handleSaveTeam} />}
            {targetLevel === 'USER' && <OperatorUserForm user={targetItem} onClose={closeModal} onSave={handleSaveUser} />}
          </>
        )}
        {modalMode === 'DETAIL' && (
          <>
            {targetLevel === 'COMPANY' && <OperatorCompanyDetail company={targetItem} onClose={closeModal} />}
            {targetLevel === 'TEAM' && <OperatorTeamDetail team={targetItem} onClose={closeModal} />}
            {targetLevel === 'USER' && <OperatorUserDetail user={targetItem} onClose={closeModal} />}
          </>
        )}
        {showMappingModal && mappingTeam && (
          <TeamCustomerMapping 
            team={mappingTeam} 
            onClose={() => { setShowMappingModal(false); setMappingTeam(null); }} 
          />
        )}
        {showUserMappingModal && mappingUser && (
          <OperatorTeamMapping 
            operator={mappingUser} 
            onClose={() => { setShowUserMappingModal(false); setMappingUser(null); if (selectedTeam) fetchUsers(selectedTeam.id); else fetchUsers(); }} 
          />
        )}
        {modalMode === 'DELETE' && deleteTarget && (
          <div className="tw-fixed tw-inset-0 tw-z-[3000] tw-flex tw-items-center tw-justify-center tw-p-6">
            <motion.div 
              className="tw-absolute tw-inset-0 tw-bg-black/90 tw-backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={closeModal}
            />
            <motion.div 
              className="tw-relative tw-w-full tw-max-w-md tw-bg-slate-900 tw-border tw-border-white/10 tw-rounded-3xl tw-overflow-hidden tw-shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="tw-p-8 tw-text-center">
                <div className="tw-w-20 tw-h-20 tw-bg-rose-500/20 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-6 tw-border tw-border-rose-500/30">
                  <AlertTriangle size={40} className="tw-text-rose-500" />
                </div>
                <h3 className="tw-text-2xl tw-font-bold tw-text-white tw-mb-2">정말 삭제하시겠습니까?</h3>
                <p className="tw-text-slate-400 tw-text-sm tw-leading-relaxed">
                  <span className="tw-text-white tw-font-bold">[{deleteTarget.name}]</span> 항목이 영구적으로 삭제됩니다.<br />
                  이 작업은 되돌릴 수 없습니다.
                </p>
              </div>
              <div className="tw-p-6 tw-bg-black/30 tw-border-t tw-border-white/5 tw-flex tw-gap-3">
                <button 
                  className="tw-flex-1 tw-py-3 tw-bg-white/5 hover:tw-bg-white/10 tw-text-slate-300 tw-rounded-xl tw-font-bold tw-transition-all"
                  onClick={closeModal}
                >
                  취소
                </button>
                <button 
                  className="tw-flex-1 tw-py-3 tw-bg-rose-600 hover:tw-bg-rose-500 tw-text-white tw-rounded-xl tw-font-bold tw-shadow-lg tw-shadow-rose-600/30 tw-transition-all"
                  onClick={confirmDelete}
                >
                  삭제 실행
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OperatorGovernanceHub;
