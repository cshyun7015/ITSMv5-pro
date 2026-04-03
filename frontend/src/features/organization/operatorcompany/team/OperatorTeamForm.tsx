import React, { useState, useEffect } from 'react';
import { Target, X, ShieldAlert, FileText, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface OperatorTeamFormProps {
  onClose: () => void;
  team?: any;
  onSave?: (data: any) => void;
}

const OperatorTeamForm: React.FC<OperatorTeamFormProps> = ({ onClose, team, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || '',
        description: team.description || '',
      });
    }
  }, [team]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) onSave({ ...team, ...formData });
    onClose();
  };

  return (
    <div className="tw-fixed tw-inset-0 tw-z-[2500] tw-flex tw-items-center tw-justify-center tw-p-6">
      <motion.div 
        className="tw-absolute tw-inset-0 tw-bg-black/90 tw-backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div 
        className="tw-relative tw-w-full tw-max-w-2xl tw-bg-slate-900 tw-border tw-border-white/10 tw-rounded-[48px] tw-overflow-hidden tw-flex tw-flex-col tw-shadow-2xl"
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSubmit} className="tw-flex tw-flex-col tw-h-full">
          {/* Form Header */}
          <div className="tw-p-10 tw-border-b tw-border-white/5 tw-flex tw-justify-between tw-items-center tw-bg-gradient-to-r tw-from-indigo-600/10 tw-to-transparent">
            <h2 className="tw-text-4xl tw-font-black tw-flex tw-items-center tw-gap-6 tw-tracking-tighter tw-text-white">
              <div className="tw-w-16 tw-h-16 tw-bg-indigo-600 tw-rounded-3xl tw-flex tw-items-center tw-justify-center tw-shadow-lg tw-shadow-indigo-500/20">
                <Target size={32} className="tw-text-white" />
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-3xl tw-line-height-none">{team ? 'Command Unit Refinement' : 'Tactical Unit Provision'}</span>
                <span className="tw-text-xs tw-text-indigo-400 tw-font-bold tw-uppercase tw-tracking-[0.2em] tw-mt-1">Operational Command Shard</span>
              </div>
            </h2>
            <button type="button" onClick={onClose} className="tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-white/5 hover:tw-bg-white/10 tw-rounded-full tw-text-slate-400 hover:tw-text-white tw-transition-all tw-border tw-border-white/5"><X size={24} /></button>
          </div>

          <div className="tw-p-12 tw-space-y-10 tw-overflow-y-auto tw-max-h-[60vh]">
            <section className="tw-space-y-6">
              <div className="tw-space-y-3">
                <label className="tw-text-[11px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest tw-ml-1 tw-flex tw-items-center tw-gap-2">
                  <FileText size={12} className="tw-text-indigo-500" /> Tactical Designation
                </label>
                <input 
                  autoFocus required type="text" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="tw-w-full tw-bg-slate-800/50 tw-border tw-border-white/10 tw-p-5 tw-rounded-3xl tw-outline-none focus:tw-border-indigo-500 tw-transition-all tw-text-white tw-font-bold placeholder:tw-text-slate-600" 
                  placeholder="E.G. Global Security Operations Center" 
                />
              </div>

              <div className="tw-space-y-3">
                <label className="tw-text-[11px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest tw-ml-1 tw-flex tw-items-center tw-gap-2">
                  <Info size={12} className="tw-text-indigo-500" /> Operational Mandate
                </label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="tw-w-full tw-bg-slate-800/50 tw-border tw-border-white/10 tw-p-6 tw-rounded-[32px] tw-outline-none focus:tw-border-indigo-500 tw-transition-all tw-text-white tw-resize-none tw-leading-relaxed placeholder:tw-text-slate-600" 
                  placeholder="Define the primary operational objectives and scope for this tactical unit..." 
                />
              </div>
            </section>

            <div className="tw-p-8 tw-bg-indigo-500/10 tw-border tw-border-indigo-500/20 tw-rounded-[32px] tw-flex tw-gap-6 tw-items-start">
               <div className="tw-w-10 tw-h-10 tw-bg-indigo-600 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-shrink-0 tw-shadow-lg tw-shadow-indigo-500/20">
                <ShieldAlert size={20} className="tw-text-white" />
              </div>
              <div className="tw-flex tw-flex-col tw-gap-1">
                <span className="tw-text-xs tw-font-black tw-text-indigo-200 tw-uppercase tw-tracking-widest">Tactical Authority Chain Verified</span>
                <p className="tw-text-[10px] tw-text-indigo-200/60 tw-leading-relaxed tw-font-bold">
                  Establishing this tactical unit will grant operational jurisdiction over the assigned identity clusters.
                </p>
              </div>
            </div>
          </div>

          <div className="tw-p-12 tw-bg-black/50 tw-border-t tw-border-white/5 tw-flex tw-justify-end tw-gap-6">
            <button type="button" className="tw-py-5 tw-px-12 tw-bg-white/5 hover:tw-bg-white/10 tw-text-slate-400 hover:tw-text-white tw-rounded-[24px] tw-font-black tw-uppercase tw-tracking-widest tw-text-[11px] tw-transition-all tw-border tw-border-white/5" onClick={onClose}>Abort Change</button>
            <button type="submit" className="tw-py-5 tw-px-20 tw-bg-indigo-600 hover:tw-bg-indigo-500 tw-text-white tw-font-black tw-uppercase tw-tracking-widest tw-text-[11px] tw-rounded-[24px] tw-shadow-2xl tw-shadow-indigo-600/40 tw-transition-all tw-transform hover:tw--translate-y-1 active:tw-translate-y-0">
              {team ? 'Finalize Tactical Refinement' : 'Initialize Command Unit'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default OperatorTeamForm;
