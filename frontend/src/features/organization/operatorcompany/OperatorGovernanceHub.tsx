import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Users, LayoutGrid, Search, Plus, Eye, Edit, Trash2, 
  ChevronRight, ArrowLeft, RefreshCw, ShieldCheck, Activity, Globe, Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// API & Components
import OperatorCompanyAPI, { OperatorCompanyDTO, OperatorTeamDTO, OperatorDTO } from './api/OperatorCompany';
import OperatorCompanyForm from './OperatorCompanyForm';
import OperatorCompanyDetail from './OperatorCompanyDetail';
import OperatorTeamForm from './team/OperatorTeamForm';
import OperatorTeamDetail from './team/OperatorTeamDetail';
import OperatorUserForm from './user/OperatorUserForm';
import OperatorUserDetail from './user/OperatorUserDetail';

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
  const [modalMode, setModalMode] = useState<'NONE' | 'FORM' | 'DETAIL'>('NONE');
  const [targetLevel, setTargetLevel] = useState<'COMPANY' | 'TEAM' | 'USER' | null>(null);
  const [targetItem, setTargetItem] = useState<any>(null);

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

  const fetchTeams = async (companyId: number) => {
    setLoading(true);
    try {
      const data = await OperatorCompanyAPI.getOperatorTeams(companyId);
      setTeams(data);
    } catch (err) {
      console.error('Failed to fetch teams', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (teamId: number) => {
    setLoading(true);
    try {
      const data = await OperatorCompanyAPI.getOperatorsByTeam(teamId);
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
    } catch (err) {
      console.error('Failed to save team', err);
    }
  };

  const handleSaveUser = async (data: any) => {
    if (!selectedTeam) return;
    try {
      if (data.id) {
        await OperatorCompanyAPI.updateOperator(data.id, data);
      } else {
        await OperatorCompanyAPI.createOperator(selectedTeam.id, data);
      }
      fetchUsers(selectedTeam.id);
    } catch (err) {
      console.error('Failed to save user', err);
    }
  };

  const handleDelete = async (level: 'COMPANY' | 'TEAM' | 'USER', id: number) => {
    if (!window.confirm('Are you sure you want to delete this resource? Strategic shards may be permanently impacted.')) return;
    try {
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
    <div className="tw-min-h-screen tw-bg-[#010409] tw-text-slate-100 tw-p-10 tw-font-sans">
      <div className="tw-max-w-[1600px] tw-mx-auto tw-space-y-12">
        
        {/* Hub Header */}
        <header className="tw-flex tw-justify-between tw-items-end">
          <div className="tw-space-y-3">
            <div className="tw-flex tw-items-center tw-gap-4">
              <div className="tw-w-14 tw-h-14 tw-bg-indigo-600 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-shadow-2xl tw-shadow-indigo-500/20">
                <ShieldCheck size={32} className="tw-text-white" />
              </div>
              <div>
                <h1 className="tw-text-5xl tw-font-black tw-tracking-tightest tw-uppercase">Strategic Command Hub</h1>
                <p className="tw-text-indigo-400 tw-text-xs tw-font-bold tw-uppercase tw-tracking-[0.3em]">ITIL v5 Structural Governance</p>
              </div>
            </div>
          </div>
          
          <div className="tw-flex tw-items-center tw-gap-4">
             <div className="tw-relative">
               <Search className="tw-absolute tw-left-5 tw-top-1/2 tw-transform tw--translate-y-1/2 tw-text-slate-500" size={18} />
               <input 
                type="text" placeholder="Search Command Shards..." 
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="tw-bg-white/5 tw-border tw-border-white/10 tw-pl-14 tw-pr-8 tw-py-4 tw-rounded-2xl tw-w-80 tw-font-medium focus:tw-border-indigo-500 tw-transition-all tw-outline-none" 
               />
             </div>
             <button 
              onClick={() => openForm(activeStep)}
              className="tw-bg-indigo-600 hover:tw-bg-indigo-500 tw-px-8 tw-py-4 tw-rounded-2xl tw-font-black tw-uppercase tw-tracking-widest tw-text-[11px] tw-flex tw-items-center tw-gap-3 tw-transition-all tw-shadow-2xl tw-shadow-indigo-600/40"
             >
               <Plus size={16} /> New {activeStep.toLowerCase()}
             </button>
          </div>
        </header>

        {/* Navigation Breadcrumbs */}
        <nav className="tw-flex tw-items-center tw-gap-6 tw-bg-white/5 tw-p-8 tw-rounded-[32px] tw-border tw-border-white/5 shadow-inner">
           <button 
            onClick={() => setActiveStep('COMPANY')}
            className={`tw-flex tw-items-center tw-gap-4 tw-px-6 tw-py-3 tw-rounded-2xl tw-transition-all ${activeStep === 'COMPANY' ? 'tw-bg-indigo-600 tw-text-white shadow-lg shadow-indigo-500/20' : 'tw-text-slate-500 hover:tw-text-slate-200'}`}
           >
             <Building2 size={20} /> <span className="tw-text-[11px] tw-font-black tw-uppercase tw-tracking-widest">Companies</span>
           </button>
           <ChevronRight size={14} className="tw-text-slate-700" />
           <button 
            disabled={!selectedCompany}
            onClick={() => setActiveStep('TEAM')}
            className={`tw-flex tw-items-center tw-gap-4 tw-px-6 tw-py-3 tw-rounded-2xl tw-transition-all ${activeStep === 'TEAM' ? 'tw-bg-indigo-600 tw-text-white shadow-lg shadow-indigo-500/20' : selectedCompany ? 'tw-text-slate-500 hover:tw-text-slate-200' : 'tw-opacity-20 tw-cursor-not-allowed'}`}
           >
             <LayoutGrid size={20} /> <span className="tw-text-[11px] tw-font-black tw-uppercase tw-tracking-widest">Units</span>
           </button>
           <ChevronRight size={14} className="tw-text-slate-700" />
           <button 
            disabled={!selectedTeam}
            onClick={() => setActiveStep('USER')}
            className={`tw-flex tw-items-center tw-gap-4 tw-px-6 tw-py-3 tw-rounded-2xl tw-transition-all ${activeStep === 'USER' ? 'tw-bg-indigo-600 tw-text-white shadow-lg shadow-indigo-500/20' : selectedTeam ? 'tw-text-slate-500 hover:tw-text-slate-200' : 'tw-opacity-20 tw-cursor-not-allowed'}`}
           >
             <Users size={20} /> <span className="tw-text-[11px] tw-font-black tw-uppercase tw-tracking-widest">Personnel</span>
           </button>
        </nav>

        {/* Structural Context Bar */}
        {(selectedCompany || selectedTeam) && (
          <div className="tw-flex tw-items-center tw-gap-8 tw-p-8 tw-bg-indigo-500/5 tw-border tw-border-indigo-500/10 tw-rounded-[40px]">
            <button onClick={goBack} className="tw-p-4 tw-bg-white/5 hover:tw-bg-white/10 tw-rounded-full tw-text-indigo-400 tw-transition-all border border-indigo-500/20">
               <ArrowLeft size={20} />
            </button>
            <div className="tw-flex tw-items-center tw-gap-10">
               {selectedCompany && (
                 <div className="tw-flex tw-items-center tw-gap-4">
                   <div className="tw-w-10 tw-h-10 tw-bg-indigo-600 tw-rounded-xl tw-flex tw-items-center tw-justify-center"><Building2 size={20} /></div>
                   <div className="tw-space-y-0.5">
                     <div className="tw-text-[9px] tw-font-black tw-text-indigo-500 tw-uppercase tw-tracking-widest">Selected Command</div>
                     <div className="tw-text-white tw-font-black tw-text-xl">{selectedCompany.name}</div>
                   </div>
                 </div>
               )}
               {selectedTeam && (
                 <div className="tw-flex tw-items-center tw-gap-4 tw-border-l tw-border-white/10 tw-pl-10">
                   <div className="tw-w-10 tw-h-10 tw-bg-indigo-600 tw-rounded-xl tw-flex tw-items-center tw-justify-center"><LayoutGrid size={20} /></div>
                   <div className="tw-space-y-0.5">
                     <div className="tw-text-[9px] tw-font-black tw-text-indigo-500 tw-uppercase tw-tracking-widest">Target Unit</div>
                     <div className="tw-text-white tw-font-black tw-text-xl">{selectedTeam.name}</div>
                   </div>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="tw-bg-[#0d1117] tw-rounded-[48px] tw-border tw-border-white/5 tw-overflow-hidden tw-relative shadow-2xl">
          <table className="tw-w-full tw-border-collapse">
            <thead>
              <tr className="tw-border-b tw-border-white/5">
                <th className="tw-p-10 tw-text-left tw-text-[11px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-[0.2em]">Identification</th>
                <th className="tw-p-10 tw-text-left tw-text-[11px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-[0.2em]">{activeStep === 'USER' ? 'Comm Channel' : 'Registry Date'}</th>
                <th className="tw-p-10 tw-text-left tw-text-[11px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-[0.2em]">Status Shard</th>
                <th className="tw-p-10 tw-text-right tw-text-[11px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-[0.2em]">Tactical Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="tw-p-32 tw-text-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="tw-inline-block">
                      <RefreshCw size={48} className="tw-text-indigo-500 tw-opacity-50" />
                    </motion.div>
                    <p className="tw-mt-8 tw-text-slate-500 tw-font-black tw-uppercase tw-tracking-widest tw-text-xs">Synchronizing Structural Data...</p>
                  </td>
                </tr>
              ) : filteredData.map((item, idx) => (
                <motion.tr 
                  key={item.id} 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: idx * 0.05 }}
                  className="tw-border-b tw-border-white/5 hover:tw-bg-white/[0.02] tw-transition-all group"
                  onClick={() => activeStep === 'COMPANY' ? handleCompanySelect(item) : activeStep === 'TEAM' ? handleTeamSelect(item) : null}
                  style={{ cursor: activeStep === 'USER' ? 'default' : 'pointer' }}
                >
                  <td className="tw-p-10">
                    <div className="tw-flex tw-items-center tw-gap-6">
                      <div className="tw-w-16 tw-h-16 tw-bg-white/5 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-text-indigo-500 group-hover:tw-bg-indigo-600 group-hover:tw-text-white tw-transition-all">
                        {activeStep === 'COMPANY' ? <Building2 size={24} /> : activeStep === 'TEAM' ? <LayoutGrid size={24} /> : <Users size={24} />}
                      </div>
                      <div className="tw-space-y-1">
                        <div className="tw-text-white tw-font-black tw-text-xl tw-tracking-tight">{item.name}</div>
                        <div className="tw-text-slate-500 tw-font-mono tw-text-xs">
                          {activeStep === 'COMPANY' ? item.operatorCompanyId : activeStep === 'USER' ? item.userId : `#UNIT-${item.id}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="tw-p-10">
                    <div className="tw-text-slate-400 tw-font-bold">
                      {activeStep === 'USER' ? item.email : (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '2024.11.23')}
                    </div>
                  </td>
                  <td className="tw-p-10">
                    <div className="tw-flex tw-items-center tw-gap-3">
                      <div className={`tw-w-2 tw-h-2 tw-rounded-full ${(!item.status || item.status === 'ACTIVE' || item.isActive) ? 'tw-bg-emerald-500 tw-shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'tw-bg-rose-500'}`} />
                      <span className="tw-text-[10px] tw-font-black tw-uppercase tw-tracking-widest">
                         {(!item.status || item.status === 'ACTIVE' || item.isActive) ? 'Operational' : 'Suspended'}
                      </span>
                    </div>
                  </td>
                  <td className="tw-p-10 tw-text-right">
                    <div className="tw-flex tw-justify-end tw-gap-3" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openDetail(activeStep, item)} className="tw-p-4 tw-bg-white/5 hover:tw-bg-indigo-600/20 hover:tw-text-indigo-400 tw-rounded-xl tw-transition-all tw-border tw-border-white/5">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => openForm(activeStep, item)} className="tw-p-4 tw-bg-white/5 hover:tw-bg-amber-600/20 hover:tw-text-amber-400 tw-rounded-xl tw-transition-all tw-border tw-border-white/5">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(activeStep, item.id)} className="tw-p-4 tw-bg-white/5 hover:tw-bg-rose-600/20 hover:tw-text-rose-400 tw-rounded-xl tw-transition-all tw-border tw-border-white/5">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {!loading && filteredData.length === 0 && (
            <div className="tw-py-40 tw-text-center tw-space-y-6">
               <Activity size={64} className="tw-mx-auto tw-text-slate-800" />
               <div className="tw-space-y-2">
                 <p className="tw-text-slate-400 tw-font-black tw-uppercase tw-tracking-widest tw-text-sm">Strategic Shard Empty</p>
                 <p className="tw-text-slate-600 tw-text-xs">Initialize your first command node using the provision button.</p>
               </div>
            </div>
          )}
        </div>
        
        {/* Hub Footer Analytics */}
        <footer className="tw-grid tw-grid-cols-4 tw-gap-8">
           {[
             { label: 'Active Shards', val: companies.length, icon: Globe, color: 'indigo' },
             { label: 'Operational Units', val: teams.length || 0, icon: LayoutGrid, color: 'emerald' },
             { label: 'IAM Personnel', val: users.length || 0, icon: Users, color: 'amber' },
             { label: 'Governance Health', val: '99.8%', icon: Scale, color: 'rose' }
           ].map((stat, i) => ( stat.label &&
             <div key={i} className="tw-bg-white/5 tw-p-8 tw-rounded-[32px] tw-border tw-border-white/5 tw-flex tw-items-center tw-gap-6 shadow-inner">
                <div className={`tw-w-14 tw-h-14 tw-bg-${stat.color}-600/10 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-text-${stat.color}-500`}>
                  <stat.icon size={24} />
                </div>
                <div>
                   <div className="tw-text-[10px] tw-text-slate-500 tw-font-black tw-uppercase tw-tracking-widest">{stat.label}</div>
                   <div className="tw-text-2xl tw-text-white tw-font-black">{stat.val}</div>
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
      </AnimatePresence>
    </div>
  );
};

export default OperatorGovernanceHub;
