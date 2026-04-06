import React from 'react';
import { LayoutGrid, X, FileText, Info, ShieldCheck, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface CustomerTeamDetailProps {
  team: any;
  onClose: () => void;
}

const CustomerTeamDetail: React.FC<CustomerTeamDetailProps> = ({ team, onClose }) => {
  if (!team) return null;

  return (
    <div className="tw-fixed tw-inset-0 tw-z-[2500] tw-flex tw-items-center tw-justify-center tw-p-6">
      <motion.div 
        className="tw-absolute tw-inset-0 tw-bg-black/90 tw-backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div 
        className="tw-relative tw-w-full tw-max-w-2xl tw-bg-[#0f1117] tw-border tw-border-white/10 tw-rounded-[48px] tw-overflow-hidden tw-flex tw-flex-col tw-shadow-[0_0_100px_rgba(0,0,0,0.8)]"
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
      >
        <div className="tw-p-10 tw-border-b tw-border-white/5 tw-flex tw-justify-between tw-items-center tw-bg-gradient-to-r tw-from-emerald-600/10 tw-to-transparent">
          <div className="tw-flex tw-items-center tw-gap-6">
            <div className="tw-w-16 tw-h-16 tw-bg-emerald-600 tw-rounded-3xl tw-flex tw-items-center tw-justify-center tw-shadow-lg tw-shadow-emerald-500/20">
              <LayoutGrid size={32} className="tw-text-white" />
            </div>
            <div className="tw-flex tw-flex-col">
              <h2 className="tw-text-3xl tw-font-black tw-text-white tw-tracking-tighter tw-leading-none">{team.name}</h2>
              <span className="tw-text-xs tw-text-emerald-400 tw-font-bold tw-uppercase tw-tracking-[0.2em] tw-mt-1">Operational Structural Unit</span>
            </div>
          </div>
          <button onClick={onClose} className="tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-white/5 hover:tw-bg-white/10 tw-rounded-full tw-text-slate-400 hover:tw-text-white tw-transition-all tw-border tw-border-white/5">
            <X size={24} />
          </button>
        </div>

        <div className="tw-p-12 tw-overflow-y-auto tw-max-h-[60vh] tw-space-y-10">
          <div className="tw-flex tw-items-center tw-justify-between tw-p-6 tw-bg-white/5 tw-rounded-3xl tw-border tw-border-white/5">
            <div className="tw-flex tw-items-center tw-gap-4">
               <div className={`tw-w-3 tw-h-3 tw-rounded-full ${team.status !== 'INACTIVE' ? 'tw-bg-emerald-500 tw-shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'tw-bg-amber-500 tw-shadow-[0_0_12px_rgba(245,158,11,0.8)]'}`} />
              <span className="tw-text-sm tw-font-black tw-text-white tw-tracking-widest tw-uppercase">{team.status !== 'INACTIVE' ? 'Primary Active' : 'Restricted'}</span>
            </div>
            <div className="tw-flex tw-gap-4 tw-items-center tw-text-blue-400">
               <Activity size={14} />
               <span className="tw-text-[10px] tw-font-black tw-uppercase tw-tracking-widest">Routing Traffic Optimized</span>
            </div>
          </div>

          <section className="tw-space-y-6">
            <div className="tw-space-y-3">
              <span className="tw-text-[10px] tw-text-slate-500 tw-font-bold tw-uppercase tw-tracking-widest tw-flex tw-items-center tw-gap-2">
                <FileText size={12} className="tw-text-emerald-500" /> Unit Designation
              </span>
              <p className="tw-text-xl tw-text-white tw-font-black tw-tracking-tight">{team.name}</p>
            </div>

            <div className="tw-space-y-3">
              <span className="tw-text-[10px] tw-text-slate-500 tw-font-bold tw-uppercase tw-tracking-widest tw-flex tw-items-center tw-gap-2">
                <Info size={12} className="tw-text-emerald-500" /> Operational Charter & Mission
              </span>
              <div className="tw-bg-white/5 tw-p-8 tw-rounded-[32px] tw-border tw-border-white/5">
                <p className="tw-text-base tw-text-slate-300 tw-leading-relaxed font-semibold italic">
                  "{team.description || 'No strategic charter currently defined for this organizational node.'}"
                </p>
              </div>
            </div>
          </section>

          <div className="tw-p-8 tw-bg-emerald-500/10 tw-border tw-border-emerald-500/20 tw-rounded-[32px] tw-flex tw-items-center tw-justify-between">
            <div className="tw-flex tw-gap-6 tw-items-center">
              <div className="tw-w-12 tw-h-12 tw-bg-emerald-600 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-shadow-lg tw-shadow-emerald-500/20">
                <ShieldCheck size={24} className="tw-text-white" />
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-sm tw-font-black tw-text-white">Structural Integrity Verified</span>
                <span className="tw-text-[10px] tw-text-emerald-400 tw-font-bold tw-uppercase tw-tracking-widest tw-mt-0.5">Authorization Flow Validated</span>
              </div>
            </div>
          </div>
        </div>

        <div className="tw-p-10 tw-bg-black/50 tw-border-t tw-border-white/5">
          <button onClick={onClose} className="tw-w-full tw-py-5 tw-bg-white/5 hover:tw-bg-white/10 tw-text-slate-400 hover:tw-text-white tw-rounded-[24px] tw-font-black tw-uppercase tw-tracking-widest tw-text-[11px] tw-transition-all tw-border tw-border-white/5">Close Portal</button>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomerTeamDetail;
