import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Users, Mail, Phone, MapPin, ShieldCheck, Star, Trash2, Edit3, UserPlus, Plus } from 'lucide-react';
import { customerApi } from '../api/customerApi';
import { CustomerCompany, CustomerTeam, CustomerUser } from '../types/customerType';
import Modal from '../../../components/common/Modal';
import CustomerCompanyForm from './CustomerCompanyForm';
import CustomerTeamForm from './CustomerTeamForm';
import { useCustomerMutations } from '../hooks/useCustomerMutations';
import ConfirmModal from '../../../components/common/ConfirmModal';
import CustomerUserForm from './CustomerUserForm';

interface CustomerDetailProps {
  selectedNode: { type: 'COMPANY' | 'TEAM'; id: number } | null;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ selectedNode }) => {
  if (!selectedNode) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-30 select-none">
        <h2 className="text-5xl font-black text-white italic tracking-tighter">SELECT A NODE</h2>
        <p className="max-w-[300px] text-sm leading-relaxed italic text-text-muted">
          좌측 트리에서 고객사나 팀을 선택하여 상세 정보와 ITIL 메타데이터를 확인하고 관리하십시오.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 animate-fade-in">
      {selectedNode.type === 'COMPANY' ? (
        <CompanyDetail id={selectedNode.id} />
      ) : (
        <TeamDetail id={selectedNode.id} />
      )}
    </div>
  );
};

// --- Sub-components ---

const CompanyDetail: React.FC<{ id: number }> = ({ id }) => {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  
  const { updateCompany, createTeam, deleteCompany } = useCustomerMutations();

  const { data: company, isLoading } = useQuery<CustomerCompany>({
    queryKey: ['company', id],
    queryFn: () => customerApi.fetchCompany(id),
  });

  const handleEdit = async (data: any) => {
    try {
      await updateCompany.mutateAsync({ id, company: data });
      setIsEditModalOpen(false);
    } catch (error) {
      alert('고객사 정보 수정에 실패했습니다.');
    }
  };

  const handleAddTeam = async (data: any) => {
    try {
      await createTeam.mutateAsync({ companyId: id, team: data });
      setIsAddTeamModalOpen(false);
    } catch (error) {
      alert('팀 생성에 실패했습니다.');
    }
  };

  const handleDelete = async (hardDelete: boolean) => {
    try {
      await deleteCompany.mutateAsync({ id, hardDelete });
      setIsDeleteModalOpen(false);
    } catch (error) {
      alert('고객사 삭제에 실패했습니다.');
    }
  };

  if (isLoading) return <DetailSkeleton />;
  if (!company) return null;

  return (
    <div className="p-8 flex flex-col h-full space-y-8">
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                <Building2 size={24} />
             </div>
             <div>
                <h3 className="text-2xl font-black tracking-tight">{company.name}</h3>
                <p className="text-xs font-mono text-text-muted uppercase tracking-widest">{company.customerId}</p>
             </div>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-text-secondary">
             <div className="flex items-center gap-2"><Mail size={14} className="text-text-muted" /> {company.email || 'N/A'}</div>
             <div className="flex items-center gap-2"><Phone size={14} className="text-text-muted" /> {company.phone || 'N/A'}</div>
             <div className="flex items-center gap-2"><MapPin size={14} className="text-text-muted" /> {company.address || '주소 정보 없음'}</div>
          </div>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setIsAddTeamModalOpen(true)}
             className="btn-md bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl px-4 flex items-center gap-2 text-xs font-bold transition-all"
           >
              <Plus size={14} /> 팀 추가
           </button>
           <button 
             onClick={() => setIsEditModalOpen(true)}
             className="btn-md bg-white/5 border border-white/10 hover:bg-amber-400/20 hover:text-amber-400 rounded-xl px-4 flex items-center gap-2 text-xs font-bold transition-all"
           >
              <Edit3 size={14} /> 수정
           </button>
           <button 
             onClick={() => setIsDeleteModalOpen(true)}
             className="btn-md bg-white/5 border border-white/10 hover:bg-red-400/20 hover:text-red-400 rounded-xl px-4 flex items-center gap-2 text-xs font-bold transition-all"
           >
              <Trash2 size={14} /> 삭제
           </button>
        </div>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="고객사 정보 수정">
        <CustomerCompanyForm initialData={company} onSubmit={handleEdit} isLoading={updateCompany.isPending} />
      </Modal>

      <Modal isOpen={isAddTeamModalOpen} onClose={() => setIsAddTeamModalOpen(false)} title="신규 팀 등록">
        <CustomerTeamForm 
          companyId={id} 
          defaultTenantId={company.tenantId} 
          onSubmit={handleAddTeam} 
          isLoading={createTeam.isPending} 
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="고객사 삭제"
        message={`'${company.name}' 고객사를 삭제하시겠습니까?\n이 작업은 소속된 팀과 사용자에게 영향을 줄 수 있습니다.`}
        confirmLabel="삭제하기"
        isDangerous={true}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
           <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={16} className="text-cyan-400" />
              <h4 className="text-xs font-black uppercase tracking-widest text-text-muted">System Metadata</h4>
           </div>
           <div className="space-y-3">
              <MetaItem label="Record ID" value={company.id} isMono />
              <MetaItem label="Status" value={company.status} isStatus />
              <MetaItem label="Tenant" value={company.tenantId} />
           </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Edit3 size={16} className="text-amber-400" />
              <h4 className="text-xs font-black uppercase tracking-widest text-text-muted">Audit Information</h4>
           </div>
           <div className="space-y-3">
              <MetaItem label="Created At" value={company.createdAt} isDate />
              <MetaItem label="Created By" value={company.createdBy} />
              <MetaItem label="Updated At" value={company.updatedAt} isDate />
              <MetaItem label="Updated By" value={company.updatedBy} />
           </div>
        </div>
      </div>
    </div>
  );
};

const MetaItem: React.FC<{ label: string; value: any; isMono?: boolean; isDate?: boolean; isStatus?: boolean }> = ({ 
  label, value, isMono, isDate, isStatus 
}) => (
  <div className="flex items-center justify-between text-[10px]">
    <span className="text-text-muted font-bold uppercase tracking-tighter">{label}</span>
    <span className={`
      ${isMono ? 'font-mono text-cyan-400' : 'text-text-secondary'}
      ${isStatus ? 'px-2 py-0.5 bg-cyan-400/10 text-cyan-400 rounded-full font-black' : ''}
    `}>
      {isDate ? (value ? new Date(value).toLocaleString() : 'N/A') : (value?.toString() || 'N/A')}
    </span>
  </div>
);

const TeamDetail: React.FC<{ id: number }> = ({ id }) => {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<CustomerUser | null>(null);
  const [deletingUser, setDeletingUser] = React.useState<CustomerUser | null>(null);

  const { updateTeam, deleteTeam, createUser, updateUser, deleteUser } = useCustomerMutations();

  const { data: team, isLoading: teamLoading } = useQuery<CustomerTeam>({
    queryKey: ['team', id],
    queryFn: () => customerApi.fetchTeam(id),
  });

  const handleEditTeam = async (data: any) => {
    try {
      await updateTeam.mutateAsync({ id, team: data });
      setIsEditModalOpen(false);
    } catch (error) {
      alert('팀 정보 수정에 실패했습니다.');
    }
  };

  const handleDeleteTeam = async (hardDelete: boolean) => {
    try {
      await deleteTeam.mutateAsync({ id, hardDelete });
      setIsDeleteModalOpen(false);
    } catch (error) {
      alert('팀 삭제에 실패했습니다.');
    }
  };

  const handleAddUser = async (data: any) => {
    try {
      await createUser.mutateAsync({ teamId: id, user: data });
      setIsAddUserModalOpen(false);
    } catch (error) {
      alert('사용자 등록에 실패했습니다.');
    }
  };

  const handleUpdateUser = async (data: any) => {
    if (!editingUser) return;
    try {
      await updateUser.mutateAsync({ id: editingUser.id, user: data });
      setEditingUser(null);
    } catch (error) {
      alert('사용자 정보 수정에 실패했습니다.');
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      await deleteUser.mutateAsync(deletingUser.id);
      setDeletingUser(null);
    } catch (error) {
      alert('사용자 삭제에 실패했습니다.');
    }
  };

  const { data: users, isLoading: usersLoading } = useQuery<CustomerUser[]>({
    queryKey: ['teamUsers', id],
    queryFn: () => customerApi.fetchUsersByTeam(id),
  });

  if (teamLoading) return <DetailSkeleton />;
  if (!team) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="p-8 border-b border-white/5 bg-white/[0.01]">
         <div className="flex items-start justify-between">
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                    <Users size={24} />
                 </div>
                 <div>
                    <div className="flex items-center gap-2">
                       <h3 className="text-2xl font-black tracking-tight">{team.name}</h3>
                       <span className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-[9px] font-black text-brand-primary tracking-tighter uppercase">
                          <span className="w-1 h-1 rounded-full bg-brand-primary animate-pulse" />
                          Team
                       </span>
                    </div>
                    <p className="text-xs text-text-muted mt-1 italic">{team.customerCompanyName} {team.parentTeamName && `> ${team.parentTeamName}`}</p>
                 </div>
              </div>
              <div className="flex flex-wrap gap-6 text-xs text-text-secondary font-medium tracking-wide">
                 <div className="flex items-center gap-2 uppercase tracking-widest"><ShieldCheck size={14} className="text-cyan-400" /> CC: {team.costCenter || 'CC-000'}</div>
                 <div className="flex items-center gap-2 italic text-text-muted">Descr: {team.description || '팀 설명이 없습니다.'}</div>
              </div>
           </div>
            <div className="flex gap-2">
               <button 
                 onClick={() => setIsEditModalOpen(true)}
                 className="btn-md bg-white/5 border border-white/10 hover:bg-amber-400/20 hover:text-amber-400 rounded-xl px-4 flex items-center gap-2 text-xs font-black transition-all"
               >
                  <Edit3 size={14} /> 팀 수정
               </button>
               <button 
                 onClick={() => setIsAddUserModalOpen(true)}
                 className="btn-md bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:text-cyan-400 rounded-xl px-4 flex items-center gap-2 text-xs font-black transition-all"
               >
                  <UserPlus size={14} /> 사용자 초대
               </button>
               <button 
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="btn-md bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 rounded-xl px-4 flex items-center gap-2 text-xs font-black transition-all"
               >
                  <Trash2 size={14} /> 팀 삭제
               </button>
            </div>
         </div>

         <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="팀 정보 수정">
            {team && (
              <CustomerTeamForm 
                companyId={team.customerCompanyId} 
                initialData={team} 
                onSubmit={handleEditTeam} 
                isLoading={updateTeam.isPending} 
              />
            )}
         </Modal>

         <ConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteTeam}
            title="팀 삭제"
            message={`'${team.name}' 팀 정보를 정말로 삭제하시겠습니까?`}
            confirmLabel="삭제하기"
            isDangerous={true}
          />

          <Modal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} title="신규 사용자 등록">
             <CustomerUserForm 
               defaultTenantId={team.tenantId} 
               onSubmit={handleAddUser} 
               isLoading={createUser.isPending} 
             />
          </Modal>

          <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="사용자 정보 수정">
             {editingUser && (
               <CustomerUserForm initialData={editingUser} onSubmit={handleUpdateUser} isLoading={updateUser.isPending} />
             )}
          </Modal>

          <ConfirmModal
            isOpen={!!deletingUser}
            onClose={() => setDeletingUser(null)}
            onConfirm={handleDeleteUser}
            title="사용자 삭제"
            message={`'${deletingUser?.name}' 사용자를 정말로 삭제하시겠습니까?\n이 작업은 시스템 접속 권한 박탈을 의미합니다.`}
            confirmLabel="삭제하기"
            isDangerous={true}
          />
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
         <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/40">Team Members</h4>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full font-bold">{users?.length || 0} Members</span>
         </div>

         {usersLoading ? (
            <div className="space-y-2 animate-pulse">
               {[1, 2, 3].map(i => <div key={i} className="h-14 bg-white/5 rounded-2xl" />)}
            </div>
         ) : Array.isArray(users) && users.length > 0 ? (
            <div className="grid gap-3">
               {users.map(user => (
                  <div key={user.id} className="group flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-2xl transition-all cursor-default">
                     <div className="flex items-center gap-4">
                        <div className="relative">
                           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-bold text-xs text-text-secondary">
                              {user.name.charAt(0)}
                           </div>
                           {user.isVip && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-[8px] text-black shadow-lg shadow-amber-400/50 outline outline-2 outline-background-primary">
                                 <Star size={8} fill="currentColor" />
                              </div>
                           )}
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{user.name}</span>
                              <span className="text-[10px] text-text-muted font-mono uppercase tracking-widest">{user.userId}</span>
                           </div>
                           <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-black tracking-widest ${
                                 user.userCriticality === 'HIGH' ? 'bg-red-400/10 text-red-400' : 'bg-white/5 text-text-muted'
                              }`}>{user.userCriticality || 'NORMAL'}</span>
                              <span className="text-[10px] text-text-muted italic">{user.email || 'no-email'}</span>
                           </div>
                        </div>
                     </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditingUser(user)}
                          className="p-2 hover:bg-white/10 rounded-xl text-text-muted hover:text-amber-400 transition-all"
                          title="사용자 수정"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => setDeletingUser(user)}
                          className="p-2 hover:bg-white/10 rounded-xl text-text-muted hover:text-red-400 transition-all"
                          title="사용자 삭제"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                  </div>
               ))}
            </div>
         ) : (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted opacity-50 space-y-2">
               <Users size={32} strokeWidth={1} />
               <p className="text-xs italic">등록된 팀 멤버가 없습니다.</p>
            </div>
         )}
      </div>

      <div className="p-8 pt-0 grid grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={16} className="text-cyan-400" />
              <h4 className="text-xs font-black uppercase tracking-widest text-text-muted">System Metadata</h4>
           </div>
           <div className="space-y-3">
              <MetaItem label="Team ID" value={team.id} isMono />
              <MetaItem label="Status" value={team.status} isStatus />
              <MetaItem label="Cost Center" value={team.costCenter} />
           </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Edit3 size={16} className="text-amber-400" />
              <h4 className="text-xs font-black uppercase tracking-widest text-text-muted">Audit Information</h4>
           </div>
           <div className="space-y-3">
              <MetaItem label="Created At" value={team.createdAt} isDate />
              <MetaItem label="Created By" value={team.createdBy} />
              <MetaItem label="Updated At" value={team.updatedAt} isDate />
              <MetaItem label="Updated By" value={team.updatedBy} />
           </div>
        </div>
      </div>
    </div>
  );
};

const DetailSkeleton = () => (
   <div className="p-8 space-y-8 animate-pulse">
      <div className="flex justify-between">
         <div className="flex gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl" />
            <div className="space-y-2">
               <div className="w-48 h-6 bg-white/5 rounded-lg" />
               <div className="w-24 h-4 bg-white/5 rounded-lg" />
            </div>
         </div>
      </div>
      <div className="flex-1 h-64 bg-white/5 rounded-3xl" />
   </div>
);

export default CustomerDetail;
