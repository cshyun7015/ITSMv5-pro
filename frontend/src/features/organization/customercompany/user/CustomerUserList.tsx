import React, { useState } from 'react';
import { 
  Users, Mail, Shield, UserPlus, Edit2, 
  Trash2, Search, Filter, MoreVertical, 
  UserCheck, UserMinus, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerUserForm from './CustomerUserForm';

interface CustomerUserListProps {
  companyId: number;
}

const CustomerUserList: React.FC<CustomerUserListProps> = ({ companyId }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock Users
  const users = [
    { id: 1001, name: 'John Doe', email: 'john.doe@tech-corp.com', role: 'Tenant Admin', team: 'Cloud Infrastructure', status: 'ACTIVE' },
    { id: 1002, name: 'Alice Wong', email: 'alice.w@sec-ops.net', role: 'Security Ops', team: 'Security Operations', status: 'ACTIVE' },
    { id: 1003, name: 'Bob Smith', email: 'b.smith@app-dev.io', role: 'Developer', team: 'App Development', status: 'INACTIVE' },
    { id: 1004, name: 'Jane Miller', email: 'jane.m@it-help.com', role: 'Support Specialist', team: 'Help Desk L1', status: 'ACTIVE' },
    { id: 1005, name: 'Mike Johnson', email: 'm.johnson@corp.com', role: 'Business User', team: 'App Development', status: 'ACTIVE' },
  ];

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="space-y-6">
      <div className="gov-action-bar">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users size={24} className="text-blue-400" />
            Global Personnel Directory
          </h2>
          <p className="text-slate-500 text-sm mt-1">Unified registry of all authenticated identities within the customer tenant</p>
        </div>
        <div className="flex gap-4">
           <div className="gov-search-inner w-64">
              <Search size={14} className="text-slate-500" />
              <input 
                type="text" 
                placeholder="Search personnel..." 
                className="text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <button className="gov-btn gov-btn-primary" onClick={() => setShowForm(true)}>
             <UserPlus size={18} /> Onboard Personnel
           </button>
        </div>
      </div>

      <div className="gov-table-card">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Personnel</th>
              <th>IAM Identity / Role</th>
              <th>Assigned Unit</th>
              <th>Status</th>
              <th className="text-right">Access Controls</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="group">
                <td className="w-1/4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${user.status === 'ACTIVE' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-bold text-slate-200">{user.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1"><Mail size={10} /> {user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-blue-500" />
                    <span className="text-sm font-semibold">{user.role}</span>
                  </div>
                </td>
                <td>
                  <div className="text-emerald-400 font-bold text-sm tracking-tight">{user.team}</div>
                </td>
                <td>
                  <span className={`gov-badge ${user.status === 'ACTIVE' ? 'gov-badge-emerald' : 'bg-slate-800 text-slate-500'}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                   <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="gov-btn gov-btn-ghost p-1" onClick={() => { setSelectedUserId(user.id); setShowForm(true); }}>
                       <Edit2 size={14} />
                     </button>
                     <button className="gov-btn gov-btn-ghost p-1 text-amber-500">
                       <ShieldAlert size={14} />
                     </button>
                     <button className="gov-btn gov-btn-ghost p-1 text-rose-500">
                       <UserMinus size={14} />
                     </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showForm && (
          <CustomerUserForm 
            onClose={() => { setShowForm(false); setSelectedUserId(null); }} 
            user={selectedUser} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerUserList;
