import React, { useState } from 'react';
import { 
  Users, X, Search, ChevronRight, 
  ArrowLeftRight, UserPlus, UserMinus, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TeamUserMappingProps {
  team: any;
  onClose: () => void;
}

const TeamUserMapping: React.FC<TeamUserMappingProps> = ({ team, onClose }) => {
  const [searchAvailable, setSearchAvailable] = useState('');
  const [searchCurrent, setSearchCurrent] = useState('');

  // Mock Users
  const availableUsers = [
    { id: 2001, name: 'Kevin Hart', email: 'kh@tech.com' },
    { id: 2002, name: 'Sara Jones', email: 'sj@tech.com' },
    { id: 2003, name: 'Liam Neeson', email: 'ln@tech.com' },
    { id: 2004, name: 'Emma Watson', email: 'ew@tech.com' },
  ];

  const currentMembers = [
    { id: 1001, name: 'John Doe', email: 'jd@tech.com' },
    { id: 1002, name: 'Alice Wong', email: 'aw@tech.com' },
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
      <motion.div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div 
        className="relative w-full max-w-5xl bg-slate-900 border border-white/10 rounded-[40px] overflow-hidden flex flex-col shadow-2xl"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 border-bottom border-white/5 bg-white/2 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black flex items-center gap-4 tracking-tighter">
              <Users size={32} className="text-blue-500" />
              Personnel Configuration: <span className="text-blue-400">{team.name}</span>
            </h2>
            <p className="text-slate-500 text-sm mt-2">Manage N:M relationship between team roles and global personnel registry</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 p-10 grid grid-cols-[1fr,80px,1fr] gap-4">
          {/* Left: Available Pool */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Available Pool</h3>
              <div className="bg-black/40 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 border border-white/5">
                {availableUsers.length} PERSONS
              </div>
            </div>
            <div className="gov-search-inner">
               <Search size={14} className="text-slate-500" />
               <input 
                type="text" 
                placeholder="Search global directory..." 
                className="text-xs"
                value={searchAvailable}
                onChange={e => setSearchAvailable(e.target.value)}
              />
            </div>
            <div className="flex-1 bg-black/20 rounded-3xl border border-white/5 overflow-y-auto custom-scrollbar p-2">
               {availableUsers.map(user => (
                 <div key={user.id} className="p-4 hover:bg-white/5 rounded-2xl flex items-center justify-between group cursor-pointer border border-transparent hover:border-white/5">
                   <div>
                     <div className="font-bold text-sm">{user.name}</div>
                     <div className="text-[10px] text-slate-500">{user.email}</div>
                   </div>
                   <button className="p-2 bg-blue-500/10 text-blue-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                     <UserPlus size={16} />
                   </button>
                 </div>
               ))}
            </div>
          </div>

          {/* Middle: Actions */}
          <div className="flex flex-col items-center justify-center gap-4 pt-16">
             <div className="p-4 bg-slate-800 rounded-2xl border border-white/10 text-slate-500">
                <ArrowLeftRight size={24} />
             </div>
             <p className="text-[8px] font-black text-slate-600 uppercase text-center vertical-text">Mapping System</p>
          </div>

          {/* Right: Current Members */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest">Team Deployment</h3>
              <div className="bg-blue-500/20 px-3 py-1 rounded-full text-[10px] font-bold text-blue-400 border border-blue-500/20">
                {currentMembers.length} MEMBERS
              </div>
            </div>
            <div className="gov-search-inner">
               <Search size={14} className="text-slate-500" />
               <input 
                type="text" 
                placeholder="Filter deployed personnel..." 
                className="text-xs"
                value={searchCurrent}
                onChange={e => setSearchCurrent(e.target.value)}
              />
            </div>
            <div className="flex-1 bg-blue-500/5 rounded-3xl border border-blue-500/10 overflow-y-auto custom-scrollbar p-2">
               {currentMembers.map(user => (
                 <div key={user.id} className="p-4 hover:bg-blue-500/10 rounded-2xl flex items-center justify-between group cursor-pointer border border-transparent hover:border-blue-500/10">
                   <div>
                     <div className="font-bold text-sm text-blue-200">{user.name}</div>
                     <div className="text-[10px] text-blue-500/60 font-semibold uppercase">{user.email}</div>
                   </div>
                   <button className="p-2 bg-rose-500/10 text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                     <UserMinus size={16} />
                   </button>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="p-10 bg-black/40 border-t border-white/5 flex justify-between items-center">
           <div className="flex items-center gap-4 text-slate-500 text-xs">
              <ShieldCheck size={20} className="text-emerald-500" />
              <span>Real-time deployment sync enabled. Membership changes reflect immediately in IAM.</span>
           </div>
           <div className="flex gap-4">
              <button className="gov-btn gov-btn-ghost px-8 py-4" onClick={onClose}>Finish Configuration</button>
              <button className="gov-btn gov-btn-primary px-8 py-4 bg-emerald-500 hover:bg-emerald-600">Apply Commit</button>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TeamUserMapping;
