import React, { useState, useEffect } from 'react';
import { 
  Plus, ChevronRight, AlertTriangle, Eye, Edit2, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './CustomerGovernance.css';

// API Client & DTOs
import CustomerCompany, { 
  CustomerCompanyDTO, 
  CustomerTeamDTO, 
  CustomerUserDTO 
} from './api/CustomerCompany';

// Components
import CustomerCompanyForm from './CustomerCompanyForm';
import CustomerCompanyDetail from './CustomerCompanyDetail';
import CustomerTeamForm from './team/CustomerTeamForm';
import CustomerTeamDetail from './team/CustomerTeamDetail';
import CustomerUserForm from './user/CustomerUserForm';
import CustomerUserDetail from './user/CustomerUserDetail';

const CustomerGovernanceHub: React.FC = () => {
  const [level, setLevel] = useState<'company' | 'team' | 'user'>('company');
  const [companies, setCompanies] = useState<CustomerCompanyDTO[]>([]);
  const [teams, setTeams] = useState<CustomerTeamDTO[]>([]);
  const [users, setUsers] = useState<CustomerUserDTO[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedCompany, setSelectedCompany] = useState<CustomerCompanyDTO | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<CustomerTeamDTO | null>(null);
  
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CustomerCompanyDTO | null>(null);
  const [detailCompany, setDetailCompany] = useState<CustomerCompanyDTO | null>(null);
  
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<CustomerTeamDTO | null>(null);
  const [detailTeam, setDetailTeam] = useState<CustomerTeamDTO | null>(null);
  
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<CustomerUserDTO | null>(null);
  const [detailUser, setDetailUser] = useState<CustomerUserDTO | null>(null);
  
  const [showDeletePopup, setShowDeletePopup] = useState<{show: boolean, type: string, target: any}>({show: false, type: '', target: null});

  // Fetch Logic
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await CustomerCompany.getCustomerCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Failed to fetch companies', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async (companyId: number) => {
    setLoading(true);
    try {
      const data = await CustomerCompany.getCustomerTeams(companyId);
      setTeams(data);
    } catch (error) {
      console.error('Failed to fetch teams', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (teamId: number) => {
    setLoading(true);
    try {
      const data = await CustomerCompany.getCustomerUsers(teamId);
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (level === 'company') fetchCompanies();
  }, [level]);

  // Level 1: Customer Actions
  const handleViewDetail = async (company: CustomerCompanyDTO) => {
    try {
      const detailed = await CustomerCompany.getCustomerCompany(company.id);
      setDetailCompany(detailed);
    } catch (error) {
      console.error('Failed to fetch detailed company', error);
      // Fallback to list data if single fetch fails
      setDetailCompany(company);
    }
  };

  const handleEditCompany = async (company: CustomerCompanyDTO) => {
    try {
      const detailed = await CustomerCompany.getCustomerCompany(company.id);
      setEditingCompany(detailed);
      setShowCompanyForm(true);
    } catch (error) {
      console.error('Failed to fetch detailed company for edit', error);
      setEditingCompany(company);
      setShowCompanyForm(true);
    }
  };

  const handleSaveCompany = async (data: any) => {
    try {
      if (data.id) {
        await CustomerCompany.updateCustomerCompany(data.id, data);
      } else {
        await CustomerCompany.createCustomerCompany(data);
      }
      fetchCompanies();
    } catch (error) {
      console.error('Failed to save company', error);
    }
  };

  const handleManageTeams = (company: CustomerCompanyDTO) => {
    setSelectedCompany(company);
    fetchTeams(company.id);
    setLevel('team');
  };

  const handleConfirmDelete = async () => {
    try {
      const { type, target } = showDeletePopup;
      if (type === '고객사') {
        await CustomerCompany.deleteCustomerCompany(target.id);
        fetchCompanies();
      } else if (type === '고객사팀') {
        await CustomerCompany.deleteCustomerTeam(target.id);
        if (selectedCompany) fetchTeams(selectedCompany.id);
      } else if (type === '사용자') {
        await CustomerCompany.deleteCustomerUser(target.id);
        if (selectedTeam) fetchUsers(selectedTeam.id);
      }
      setShowDeletePopup({show: false, type: '', target: null});
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  // Level 2: Team Actions
  const handleViewTeamDetail = async (team: CustomerTeamDTO) => {
    // For now use list data, extend API if needed
    setDetailTeam(team);
  };

  const handleEditTeam = (team: CustomerTeamDTO) => {
    setEditingTeam(team);
    setShowTeamForm(true);
  };

  const handleSaveTeam = async (data: any) => {
    try {
      if (data.id) {
        await CustomerCompany.updateCustomerTeam(data.id, data);
      } else if (selectedCompany) {
        await CustomerCompany.createCustomerTeam(selectedCompany.id, data);
      }
      if (selectedCompany) fetchTeams(selectedCompany.id);
    } catch (error) {
      console.error('Failed to save team', error);
    }
  };

  const handleManageUsers = (team: CustomerTeamDTO) => {
    setSelectedTeam(team);
    fetchUsers(team.id);
    setLevel('user');
  };

  const handleSaveUser = async (data: any) => {
    try {
      if (data.id) {
        await CustomerCompany.updateCustomerUser(data.id, data);
      } else if (selectedTeam) {
        await CustomerCompany.createCustomerUser(selectedTeam.id, data);
      }
      if (selectedTeam) fetchUsers(selectedTeam.id);
    } catch (error) {
      console.error('Failed to save user', error);
    }
  };

  const renderBreadcrumbs = () => (
    <div className="gov-breadcrumb" style={{ marginBottom: 0 }}>
      <div className={`breadcrumb-item ${level === 'company' ? 'breadcrumb-active' : ''}`} onClick={() => setLevel('company')}>
        고객사 목록
      </div>
      {level !== 'company' && selectedCompany && (
        <>
          <ChevronRight size={14} className="text-slate-600" />
          <div className={`breadcrumb-item ${level === 'team' ? 'breadcrumb-active' : ''}`} onClick={() => setLevel('team')}>
            {selectedCompany.name} 목록
          </div>
        </>
      )}
      {level === 'user' && selectedTeam && (
        <>
          <ChevronRight size={14} className="text-slate-600" />
          <div className="breadcrumb-item breadcrumb-active">
            {selectedTeam.name} 사용자
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="p-10 bg-deep min-h-screen">
      {/* Force header into a single line using robust inline styles */}
      <div id="hub-header" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '32px' }}>
          <h1 className="text-xl font-black tracking-tight text-white m-0" style={{ whiteSpace: 'nowrap' }}>고객사/고객사팀/사용자 관리</h1>
          <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
          {renderBreadcrumbs()}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {level === 'company' && <button className="gov-btn gov-btn-primary" onClick={() => setShowCompanyForm(true)} style={{ whiteSpace: 'nowrap' }}><Plus size={18} /> 신규 고객사 등록</button>}
          {level === 'team' && <button className="gov-btn gov-btn-primary" onClick={() => setShowTeamForm(true)} style={{ whiteSpace: 'nowrap' }}><Plus size={18} /> 신규 팀 등록</button>}
          {level === 'user' && <button className="gov-btn gov-btn-primary" onClick={() => setShowUserForm(true)} style={{ whiteSpace: 'nowrap' }}><Plus size={18} /> 신규 사용자 등록</button>}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={level}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           transition={{ duration: 0.2 }}
        >
          {loading ? (
             <div className="p-20 text-center text-slate-600 animate-pulse font-black uppercase tracking-widest">
                Data Synchronizing...
             </div>
          ) : (
            <>
              {level === 'company' && (
                <div className="gov-table-card">
                  <table className="gov-table">
                    <thead>
                      <tr>
                        <th>고객사ID</th>
                        <th>고객사명</th>
                        <th>상태</th>
                        <th className="text-right">관리항목</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.length > 0 ? companies.map(c => (
                        <tr key={c.id}>
                          <td className="font-bold text-blue-400">{c.customerId}</td>
                          <td>{c.name}</td>
                          <td><span className={`gov-badge ${c.status === 'ACTIVE' ? 'gov-badge-emerald' : 'gov-badge-amber'}`}>{c.status}</span></td>
                          <td className="text-right">
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                              <button className="gov-icon-btn flex-shrink-0" title="상세조회" onClick={() => handleViewDetail(c)}><Eye size={16} /></button>
                              <button className="gov-icon-btn flex-shrink-0" title="수정" onClick={() => handleEditCompany(c)}><Edit2 size={16} /></button>
                              <button className="gov-icon-btn gov-icon-btn-danger flex-shrink-0" title="삭제" onClick={() => setShowDeletePopup({show: true, type: '고객사', target: c})}><Trash2 size={16} /></button>
                              <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
                              <button className="gov-btn gov-btn-primary py-2 px-6 text-xs whitespace-nowrap flex-shrink-0" onClick={() => handleManageTeams(c)}>고객사팀관리</button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="text-center p-10 text-slate-500">조회된 고객사가 없습니다.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {level === 'team' && (
                <div className="gov-table-card">
                  <table className="gov-table">
                    <thead>
                      <tr>
                        <th>고객사명</th>
                        <th>고객사팀명</th>
                        <th className="text-right">관리항목</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams.length > 0 ? teams.map(t => (
                        <tr key={t.id}>
                          <td className="text-slate-500">{selectedCompany?.name}</td>
                          <td className="font-bold text-emerald-400">{t.name}</td>
                           <td className="text-right">
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                              <button className="gov-icon-btn flex-shrink-0" title="상세조회" onClick={() => handleViewTeamDetail(t)}><Eye size={16} /></button>
                              <button className="gov-icon-btn flex-shrink-0" title="수정" onClick={() => handleEditTeam(t)}><Edit2 size={16} /></button>
                              <button className="gov-icon-btn gov-icon-btn-danger flex-shrink-0" title="삭제" onClick={() => setShowDeletePopup({show: true, type: '고객사팀', target: t})}><Trash2 size={16} /></button>
                              <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
                              <button className="gov-btn gov-btn-primary py-2 px-6 text-xs whitespace-nowrap flex-shrink-0" onClick={() => handleManageUsers(t)}>사용자관리</button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={3} className="text-center p-10 text-slate-500">조회된 팀이 없습니다.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {level === 'user' && (
                <div className="gov-table-card">
                  <table className="gov-table">
                    <thead>
                      <tr>
                        <th>고객사</th>
                        <th>고객사팀</th>
                        <th>사용자ID</th>
                        <th>사용자명</th>
                        <th>사용여부</th>
                        <th className="text-right">관리항목</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length > 0 ? users.map(u => (
                        <tr key={u.id}>
                          <td className="text-xs text-slate-500">{selectedCompany?.name}</td>
                          <td className="text-xs text-slate-500">{selectedTeam?.name}</td>
                          <td className="font-bold text-blue-400">{u.userId}</td>
                          <td>{u.name}</td>
                          <td><span className="gov-badge gov-badge-blue">Y</span></td>
                           <td className="text-right">
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                              <button className="gov-icon-btn flex-shrink-0" title="상세조회" onClick={() => setDetailUser(u)}><Eye size={16} /></button>
                              <button className="gov-icon-btn flex-shrink-0" title="수정" onClick={() => { setEditingUser(u); setShowUserForm(true); }}><Edit2 size={16} /></button>
                              <button className="gov-icon-btn gov-icon-btn-danger flex-shrink-0" title="삭제" onClick={() => setShowDeletePopup({show: true, type: '사용자', target: u})}><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={6} className="text-center p-10 text-slate-500">조회된 사용자가 없습니다.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showDeletePopup.show && (
          <div className="tw-fixed tw-inset-0 tw-z-[3000] tw-flex tw-items-center tw-justify-center tw-p-6">
            <motion.div 
              className="tw-absolute tw-inset-0 tw-bg-black/95 tw-backdrop-blur-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeletePopup({show: false, type: '', target: null})}
            />
            <motion.div 
              className="tw-relative tw-bg-slate-900 tw-border tw-border-white/10 tw-p-12 tw-rounded-[48px] tw-max-w-md tw-w-full tw-shadow-[0_0_100px_rgba(244,63,94,0.15)] tw-text-center tw-overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <div className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-1 tw-bg-rose-600" />
              
              <div className="tw-w-24 tw-h-24 tw-bg-rose-500 tw-rounded-[32px] tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-8 tw-shadow-xl tw-shadow-rose-500/20">
                <AlertTriangle size={48} className="tw-text-white" />
              </div>
              
              <h2 className="tw-text-3xl tw-font-black tw-text-white tw-mb-4 tw-tracking-tighter tw-leading-none">
                {showDeletePopup.type} Permanently Deletion
              </h2>
              
              <p className="tw-text-slate-400 tw-text-sm tw-mb-12 tw-leading-relaxed tw-px-4">
                Are you absolutely sure you want to terminate <span className="tw-text-white tw-font-bold">"{showDeletePopup.target?.name || showDeletePopup.target?.customerId}"</span>? 
                {showDeletePopup.type !== '사용자' && (
                  <>
                    <br />
                    <span className="tw-text-rose-400 tw-mt-2 tw-block tw-font-black tw-uppercase tw-text-[10px] tw-tracking-widest tw-bg-rose-500/10 tw-py-2 tw-rounded-xl tw-border tw-border-rose-500/20">
                      Warning: All cascading child nodes (Teams/Users) will be purged.
                    </span>
                  </>
                )}
              </p>
              
              <div className="tw-flex tw-gap-4">
                <button 
                  className="tw-flex-1 tw-py-5 tw-bg-rose-600 hover:tw-bg-rose-500 tw-text-white tw-rounded-3xl tw-font-black tw-uppercase tw-tracking-widest tw-text-[11px] tw-transition-all tw-shadow-lg tw-shadow-rose-600/20 tw-transform hover:tw--translate-y-1 active:tw-translate-y-0" 
                  onClick={handleConfirmDelete}
                >
                  Confirm Purge
                </button>
                <button 
                  className="tw-flex-1 tw-py-5 tw-bg-white/5 hover:tw-bg-white/10 tw-text-slate-400 hover:tw-text-white tw-rounded-3xl tw-font-black tw-uppercase tw-tracking-widest tw-text-[11px] tw-transition-all tw-border tw-border-white/5" 
                  onClick={() => setShowDeletePopup({show: false, type: '', target: null})}
                >
                  Abort Action
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Forms */}
      {showCompanyForm && (
        <CustomerCompanyForm 
          onClose={() => { setShowCompanyForm(false); setEditingCompany(null); }} 
          company={editingCompany} 
          onSave={handleSaveCompany}
        />
      )}
      {detailCompany && <CustomerCompanyDetail company={detailCompany} onClose={() => setDetailCompany(null)} />}
      
      {showTeamForm && (
        <CustomerTeamForm 
          onClose={() => { setShowTeamForm(false); setEditingTeam(null); }} 
          team={editingTeam} 
          onSave={handleSaveTeam}
        />
      )}
      {detailTeam && <CustomerTeamDetail team={detailTeam} onClose={() => setDetailTeam(null)} />}
      
      {showUserForm && (
        <CustomerUserForm 
          onClose={() => { setShowUserForm(false); setEditingUser(null); }} 
          user={editingUser} 
          onSave={handleSaveUser}
        />
      )}
      {detailUser && <CustomerUserDetail user={detailUser} onClose={() => setDetailUser(null)} />}
    </div>
  );
};

export default CustomerGovernanceHub;
