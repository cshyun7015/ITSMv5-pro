import React from 'react';
import { ShieldCheck, X, Activity, Globe, Scale, Clock, Building } from 'lucide-react';
import { motion } from 'framer-motion';

interface OperatorCompanyDetailProps {
  company: any;
  onClose: () => void;
}

const OperatorCompanyDetail: React.FC<OperatorCompanyDetailProps> = ({ company, onClose }) => {
  return (
    <div className="tw-fixed tw-inset-0 tw-z-[2500] tw-flex tw-items-center tw-justify-center tw-p-6">
      <motion.div 
        className="tw-absolute tw-inset-0 tw-bg-black/95 tw-backdrop-blur-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div 
        className="tw-relative tw-w-full tw-max-w-5xl tw-bg-slate-900 tw-border tw-border-white/10 tw-rounded-[64px] tw-overflow-hidden tw-flex tw-flex-col tw-shadow-2xl"
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
      >
        {/* Detail Header */}
        <div className="tw-p-12 tw-pb-24 tw-bg-gradient-to-br tw-from-indigo-600/20 tw-via-transparent tw-to-transparent tw-relative tw-overflow-hidden">
          <div className="tw-absolute tw-top-[-10%] tw-right-[-5%] tw-w-[400px] tw-h-[400px] tw-bg-indigo-500/10 tw-rounded-full tw-blur-[100px]" />
          
          <div className="tw-flex tw-justify-between tw-items-start tw-relative tw-z-10">
            <div className="tw-flex tw-items-center tw-gap-10">
              <div className="tw-w-32 tw-h-32 tw-bg-indigo-600 tw-rounded-[40px] tw-flex tw-items-center tw-justify-center tw-shadow-2xl tw-shadow-indigo-500/40 tw-rotate-3">
                <Building size={64} className="tw-text-white" />
              </div>
              <div className="tw-space-y-4">
                <div className="tw-flex tw-items-center tw-gap-4">
                  <span className="tw-bg-indigo-500/20 tw-text-indigo-400 tw-px-5 tw-py-1.5 tw-rounded-full tw-text-[10px] tw-font-black tw-uppercase tw-tracking-[0.2em] tw-border tw-border-indigo-500/30">Strategic Shard</span>
                  <span className={`tw-px-5 tw-py-1.5 tw-rounded-full tw-text-[10px] tw-font-black tw-uppercase tw-tracking-[0.2em] tw-border ${company.status === 'ACTIVE' ? 'tw-bg-emerald-500/20 tw-text-emerald-400 tw-border-emerald-500/30' : 'tw-bg-rose-500/20 tw-text-rose-400 tw-border-rose-500/30'}`}>
                    {company.status} Deployment
                  </span>
                </div>
                <h1 className="tw-text-7xl tw-font-black tw-text-white tw-tracking-tightest tw-leading-none">
                  {company.name}
                </h1>
                <p className="tw-text-xl tw-text-slate-400 tw-font-medium tw-max-w-2xl tw-leading-relaxed">
                  Strategic governance shard for {company.representativeName || 'the assigned commanding officer'}. Operational integrity maintained via ITIL v5 standards.
                </p>
              </div>
            </div>
            <button onClick={onClose} className="tw-w-16 tw-h-16 tw-flex tw-items-center tw-justify-center tw-bg-white/5 hover:tw-bg-white/10 tw-rounded-full tw-text-slate-400 hover:tw-text-white tw-transition-all tw-border tw-border-white/5"><X size={32} /></button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="tw-p-16 tw-pt-0 tw-grid tw-grid-cols-3 tw-gap-10 tw-relative tw-z-10">
          <div className="tw-col-span-2 tw-grid tw-grid-cols-2 tw-gap-8">
            <div className="tw-bg-white/5 tw-p-8 tw-rounded-[40px] tw-border tw-border-white/5 tw-space-y-6 hover:tw-bg-white/10 tw-transition-all">
              <div className="tw-flex tw-items-center tw-gap-4 tw-text-indigo-400">
                <Globe size={24} />
                <span className="tw-text-[11px] tw-font-black tw-uppercase tw-tracking-widest">Shard Registry Overview</span>
              </div>
              <div className="tw-space-y-4">
                <div>
                  <div className="tw-text-[10px] tw-text-slate-500 tw-font-bold tw-uppercase tw-mb-1">Universal Identity</div>
                  <div className="tw-text-2xl tw-text-white tw-font-mono">{company.operatorCompanyId}</div>
                </div>
                <div>
                  <div className="tw-text-[10px] tw-text-slate-500 tw-font-bold tw-uppercase tw-mb-1">Business Registration</div>
                  <div className="tw-text-2xl tw-text-white tw-font-bold">{company.businessNumber || 'NON-DISCLOSED'}</div>
                </div>
              </div>
            </div>

            <div className="tw-bg-white/5 tw-p-8 tw-rounded-[40px] tw-border tw-border-white/5 tw-space-y-6 hover:tw-bg-white/10 tw-transition-all">
              <div className="tw-flex tw-items-center tw-gap-4 tw-text-amber-400">
                <Activity size={24} />
                <span className="tw-text-[11px] tw-font-black tw-uppercase tw-tracking-widest">Command Matrix Status</span>
              </div>
              <div className="tw-space-y-4">
                <div>
                  <div className="tw-text-[10px] tw-text-slate-500 tw-font-bold tw-uppercase tw-mb-1">Operational Lead</div>
                  <div className="tw-text-2xl tw-text-white tw-font-bold">{company.representativeName || 'PENDING'}</div>
                </div>
                <div className="tw-flex tw-gap-4">
                  <div className="tw-flex-1">
                    <div className="tw-text-[10px] tw-text-slate-500 tw-font-bold tw-uppercase tw-mb-1">Health</div>
                    <div className="tw-text-xl tw-text-emerald-400 tw-font-black">OPTIMAL</div>
                  </div>
                  <div className="tw-flex-1">
                    <div className="tw-text-[10px] tw-text-slate-500 tw-font-bold tw-uppercase tw-mb-1">SLA Tier</div>
                    <div className="tw-text-xl tw-text-amber-400 tw-font-black">PLATINUM</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="tw-col-span-2 tw-bg-white/5 tw-p-10 tw-rounded-[48px] tw-border tw-border-white/5 hover:tw-bg-white/10 tw-transition-all">
              <div className="tw-flex tw-items-center tw-gap-6">
                <div className="tw-w-20 tw-h-20 tw-bg-slate-800 tw-rounded-3xl tw-flex tw-items-center tw-justify-center tw-text-indigo-400">
                  <Scale size={32} />
                </div>
                <div className="tw-space-y-2">
                  <span className="tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest">Global Resource Allocation</span>
                  <p className="tw-text-white tw-text-lg tw-font-medium tw-leading-relaxed">
                    This strategic shard is authorized for multi-node orchestration and has been audited for compliance with ISO/IEC 20000 standards.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline / Meta */}
          <div className="tw-bg-black/40 tw-rounded-[48px] tw-p-10 tw-border tw-border-white/5 tw-space-y-10 shadow-inner">
            <h3 className="tw-text-xs tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-[0.3em]">Governance Audit</h3>
            
            <div className="tw-space-y-10">
              <div className="tw-flex tw-gap-6">
                <div className="tw-w-1 tw-h-12 tw-bg-indigo-500 tw-rounded-full" />
                <div className="tw-space-y-1">
                   <div className="tw-text-[10px] tw-text-slate-500 tw-font-bold tw-uppercase tw-flex tw-items-center tw-gap-2"><Clock size={10} /> Initialization Date</div>
                   <div className="tw-text-white tw-font-bold">{company.createdAt ? new Date(company.createdAt).toLocaleDateString('ko-KR') : '2024.11.23'}</div>
                </div>
              </div>
              <div className="tw-flex tw-gap-6">
                <div className="tw-w-1 tw-h-12 tw-bg-emerald-500 tw-rounded-full" />
                <div className="tw-space-y-1">
                   <div className="tw-text-[10px] tw-text-slate-500 tw-font-bold tw-uppercase tw-flex tw-items-center tw-gap-2"><ShieldCheck size={10} /> Compliance Level</div>
                   <div className="tw-text-white tw-font-bold">L3 - Strategic Excellence</div>
                </div>
              </div>
            </div>

             <div className="tw-mt-12 tw-p-8 tw-bg-indigo-500/10 tw-rounded-3xl tw-border tw-border-indigo-500/20">
               <p className="tw-text-[10px] tw-text-indigo-300 tw-leading-relaxed tw-font-bold tw-italic uppercase tracking-widest">
                 "Strategic nodes dictate operational flow across the entire federation."
               </p>
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="tw-p-12 tw-bg-black/50 tw-border-t tw-border-white/5 tw-flex tw-justify-end">
          <button onClick={onClose} className="tw-py-5 tw-px-20 tw-bg-white/5 hover:tw-bg-white/10 tw-text-white tw-rounded-[24px] tw-font-black tw-uppercase tw-tracking-widest tw-text-[11px] tw-transition-all tw-border tw-border-white/5 shadow-lg shadow-black/20">Acknowledge Audit</button>
        </div>
      </motion.div>
    </div>
  );
};

export default OperatorCompanyDetail;
