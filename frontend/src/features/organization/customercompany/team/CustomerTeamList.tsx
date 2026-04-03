import React, { useState } from 'react';
import { 
  Users, Plus, Edit2, Trash2, LayoutGrid, 
  ChevronRight, Calendar, UserCheck, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerTeamForm from './CustomerTeamForm';
import TeamUserMapping from '../mapping/TeamUserMapping';

interface CustomerTeamListProps {
  companyId: number;
}

const CustomerTeamList: React.FC<CustomerTeamListProps> = ({ companyId }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [showMapping, setShowMapping] = useState(false);

  // Mock Teams
  const teams = [
    { id: 101, name: 'Cloud Infrastructure', description: 'AWS/Azure Managed Services', members: 12, createdAt: '2025-01-15' },
    { id: 102, name: 'Security Operations', description: '24/7 SIEM/SOC Monitoring', members: 8, createdAt: '2025-02-10' },
    { id: 103, name: 'App Development', description: 'Full-stack Product Teams', members: 24, createdAt: '2025-03-01' },
    { id: 104, name: 'Help Desk L1', description: 'Consumer Ticket Support', members: 45, createdAt: '2025-04-12' },
  ];

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  return (
    <div className="space-y-6">
      <div className="gov-action-bar">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LayoutGrid size={24} className="text-emerald-400" />
            Operational Support Groups
          </h2>
          <p className="text-slate-500 text-sm mt-1">Foundational organizational structure for tenant context</p>
        </div>
        <button className="gov-btn gov-btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> New Support Group
        </button>
      </div>

      <div className="gov-table-card">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Team Name</th>
              <th>Scale</th>
              <th>Governance Period</th>
              <th className="text-right">Administration</th>
            </tr>
          </thead>
          <tbody>
            {teams.map(team => (
              <tr key={team.id} className="group">
                <td>
                  <div className="font-bold text-lg text-emerald-400">{team.name}</div>
                  <div className="text-slate-500 text-xs mt-1 truncate max-w-xs">{team.description}</div>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <span className="gov-badge gov-badge-blue">{team.members} Personnel</span>
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[8px] font-bold">U{i}</div>
                      ))}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Calendar size={12} /> Established {team.createdAt}
                  </div>
                </td>
                <td>
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      className="gov-btn gov-btn-ghost p-2" 
                      onClick={() => { setSelectedTeamId(team.id); setShowForm(true); }}
                      title="Edit Configuration"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="gov-btn gov-btn-ghost p-2 text-blue-400" 
                      onClick={() => { setSelectedTeamId(team.id); setShowMapping(true); }}
                      title="Personnel Mapping"
                    >
                      <UserCheck size={16} />
                    </button>
                    <button className="gov-btn gov-btn-ghost p-2 text-rose-500" title="Retire Team">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mapping Overview Context */}
      <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex items-center gap-6">
        <div className="p-4 bg-emerald-500/20 rounded-2xl">
          <ShieldCheck size={32} className="text-emerald-400" />
        </div>
        <div>
          <h4 className="font-bold text-emerald-400">Governance Integrity Check</h4>
          <p className="text-sm text-slate-500 mt-1">All {teams.length} groups are currently mapped to active customer SLAs. Personnel distribution is balanced across global regions.</p>
        </div>
        <button className="ml-auto gov-btn gov-btn-ghost">View Detailed Graph</button>
      </div>

      {/* Form Dialog */}
      <AnimatePresence>
        {showForm && (
          <CustomerTeamForm 
            onClose={() => { setShowForm(false); setSelectedTeamId(null); }} 
            team={selectedTeam} 
          />
        )}
      </AnimatePresence>

      {/* Mapping Dialog */}
      <AnimatePresence>
        {showMapping && selectedTeam && (
          <TeamUserMapping 
            team={selectedTeam} 
            onClose={() => setShowMapping(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerTeamList;
