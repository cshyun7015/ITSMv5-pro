import React from 'react';
import { Users, X, Mail, Fingerprint, Key, ShieldCheck, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface CustomerUserDetailProps {
  user: any;
  onClose: () => void;
}

const CustomerUserDetail: React.FC<CustomerUserDetailProps> = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="tw-fixed tw-inset-0 tw-z-[2500] tw-flex tw-items-center tw-justify-center tw-p-6">
      <motion.div 
        className="tw-absolute tw-inset-0 tw-bg-black/95 tw-backdrop-blur-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div 
        className="tw-relative tw-w-full tw-max-w-2xl tw-bg-slate-900 tw-border tw-border-white/10 tw-rounded-[48px] tw-overflow-hidden tw-flex tw-flex-col tw-shadow-[0_0_100px_rgba(0,0,0,0.8)]"
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
      >
        <div className="tw-p-10 tw-border-b tw-border-white/5 tw-flex tw-justify-between tw-items-center tw-bg-gradient-to-r tw-from-blue-600/10 tw-to-transparent">
          <div className="tw-flex tw-items-center tw-gap-6">
            <div className="tw-w-16 tw-h-16 tw-bg-blue-600 tw-rounded-3xl tw-flex tw-items-center tw-justify-center tw-shadow-lg tw-shadow-blue-500/20">
              <Users size={32} className="tw-text-white" />
            </div>
            <div className="tw-flex tw-flex-col">
              <h2 className="tw-text-3xl tw-font-black tw-text-white tw-tracking-tighter tw-leading-none">{user.name}</h2>
              <span className="tw-text-xs tw-text-blue-400 tw-font-bold tw-uppercase tw-tracking-[0.2em] tw-mt-1">{user.userId}</span>
            </div>
          </div>
          <button onClick={onClose} className="tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-white/5 hover:tw-bg-white/10 tw-rounded-full tw-text-slate-400 hover:tw-text-white tw-transition-all tw-border tw-border-white/5">
            <X size={24} />
          </button>
        </div>

        <div className="tw-p-12 tw-overflow-y-auto tw-max-h-[65vh] tw-space-y-10">
          <div className="tw-flex tw-items-center tw-justify-between tw-p-6 tw-bg-white/5 tw-rounded-[32px] tw-border tw-border-white/5">
            <div className="tw-flex tw-items-center tw-gap-4">
               <div className="tw-w-3 tw-h-3 tw-rounded-full tw-bg-blue-500 tw-shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
              <span className="tw-text-sm tw-font-black tw-text-white tw-tracking-widest tw-uppercase">Authenticated Profile</span>
            </div>
            <div className="tw-flex tw-gap-4 tw-items-center tw-text-emerald-400">
               <Activity size={14} />
               <span className="tw-text-[10px] tw-font-black tw-uppercase tw-tracking-widest">Active Governance Shard</span>
            </div>
          </div>

          <section className="tw-grid tw-grid-cols-2 tw-gap-8">
            <div className="tw-space-y-6">
              <div className="tw-space-y-2">
                <span className="tw-text-[10px] tw-text-slate-500 tw-font-bold tw-uppercase tw-tracking-widest tw-flex tw-items-center tw-gap-2">
                  <Fingerprint size={12} className="tw-text-blue-500" /> Identity Anchor
                </span>
                <p className="tw-text-xl tw-text-white tw-font-black tw-tracking-tight">{user.userId}</p>
              </div>

              <div className="tw-space-y-2">
                <span className="tw-text-[10px] tw-text-slate-500 tw-font-bold tw-uppercase tw-tracking-widest tw-flex tw-items-center tw-gap-2">
                  <Key size={12} className="tw-text-amber-500" /> Governed Privilege
                </span>
                <p className="tw-text-xl tw-text-white tw-font-black tw-tracking-tight">{user.role || 'Standard User'}</p>
              </div>
            </div>

            <div className="tw-space-y-6">
              <div className="tw-space-y-2">
                <span className="tw-text-[10px] tw-text-slate-500 tw-font-bold tw-uppercase tw-tracking-widest tw-flex tw-items-center tw-gap-2">
                  <Mail size={12} className="tw-text-blue-500" /> IAM Email Target
                </span>
                <p className="tw-text-lg tw-text-white tw-font-bold tw-tracking-tight">{user.email || 'N/A'}</p>
              </div>
            </div>
          </section>

          <div className="tw-p-8 tw-bg-blue-500/10 tw-border tw-border-blue-500/20 tw-rounded-[32px] tw-flex tw-items-center tw-justify-between">
            <div className="tw-flex tw-gap-6 tw-items-center">
              <div className="tw-w-12 tw-h-12 tw-bg-blue-600 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-shadow-lg tw-shadow-blue-500/20">
                <ShieldCheck size={24} className="tw-text-white" />
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-sm tw-font-black tw-text-white">Identity Compliance Optimized</span>
                <span className="tw-text-[10px] tw-text-blue-400 tw-font-bold tw-uppercase tw-tracking-widest tw-mt-0.5">Authorization Flow Validated</span>
              </div>
            </div>
          </div>
        </div>

        <div className="tw-p-10 tw-bg-black/50 tw-border-t tw-border-white/5">
          <button onClick={onClose} className="tw-w-full tw-py-5 tw-bg-white/5 hover:tw-bg-white/10 tw-text-slate-400 hover:tw-text-white tw-rounded-[24px] tw-font-black tw-uppercase tw-tracking-widest tw-text-[11px] tw-transition-all tw-border tw-border-white/5">Terminate View</button>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomerUserDetail;
