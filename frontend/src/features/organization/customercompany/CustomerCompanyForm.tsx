import React, { useState, useEffect } from 'react';
import { Building2, X, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface CustomerCompanyFormProps {
  onClose: () => void;
  company?: any;
  onSave?: (data: any) => void;
}

const CustomerCompanyForm: React.FC<CustomerCompanyFormProps> = ({ onClose, company, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    customerId: '',
    businessNumber: '',
    representativeName: '',
    phone: '',
    email: '',
    address: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        customerId: company.customerId || '',
        businessNumber: company.businessNumber || '',
        representativeName: company.representativeName || '',
        phone: company.phone || '',
        email: company.email || '',
        address: company.address || '',
        status: company.status || 'ACTIVE'
      });
    }
  }, [company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave({ 
        ...company, // Preserve ID if editing
        ...formData 
      });
    }
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
        className="tw-relative tw-w-full tw-max-w-4xl tw-bg-slate-900 tw-border tw-border-white/10 tw-rounded-[48px] tw-overflow-hidden tw-flex tw-flex-col tw-shadow-2xl"
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSubmit} className="tw-flex tw-flex-col tw-h-full">
          <div className="tw-p-10 tw-border-b tw-border-white/5 tw-flex tw-justify-between tw-items-center tw-bg-gradient-to-r tw-from-blue-600/10 tw-to-transparent">
            <h2 className="tw-text-4xl tw-font-black tw-flex tw-items-center tw-gap-6 tw-tracking-tighter tw-text-white">
              <div className="tw-w-16 tw-h-16 tw-bg-blue-600 tw-rounded-3xl tw-flex tw-items-center tw-justify-center tw-shadow-lg tw-shadow-blue-500/20">
                <Building2 size={32} className="tw-text-white" />
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-3xl tw-line-height-none">{company ? 'Governance Sync' : 'Provision New Tenant'}</span>
                <span className="tw-text-xs tw-text-blue-400 tw-font-bold tw-uppercase tw-tracking-[0.2em] tw-mt-1">ITIL v5 Organization Hub</span>
              </div>
            </h2>
            <button type="button" onClick={onClose} className="tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-white/5 hover:tw-bg-white/10 tw-rounded-full tw-text-slate-400 hover:tw-text-white tw-transition-all tw-border tw-border-white/5"><X size={24} /></button>
          </div>

          <div className="tw-p-12 tw-space-y-12 tw-overflow-y-auto tw-max-h-[70vh]">
            {/* Primary Identity Section */}
            <section className="tw-space-y-6">
              <h3 className="tw-text-xs tw-font-black tw-text-blue-500 tw-uppercase tw-tracking-[0.3em] tw-flex tw-items-center tw-gap-3">
                <div className="tw-w-1.5 tw-h-1.5 tw-bg-blue-500 tw-rounded-full tw-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                Primary Identity
              </h3>
              <div className="tw-grid tw-grid-cols-2 tw-gap-8 tw-mt-4">
                <div className="tw-space-y-3">
                  <label className="tw-text-[11px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest tw-ml-1">Entity Full Name</label>
                  <input 
                    autoFocus required type="text" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="tw-w-full tw-bg-slate-800/50 tw-border tw-border-white/10 tw-p-5 tw-rounded-3xl tw-outline-none focus:tw-border-blue-500 focus:tw-bg-slate-800 tw-transition-all tw-text-white tw-font-bold placeholder:tw-text-slate-600 tw-shadow-inner" 
                    placeholder="Enter Legal Entity Name" 
                  />
                </div>
                <div className="tw-space-y-3">
                  <label className="tw-text-[11px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest tw-ml-1">Universal Customer ID</label>
                  <input 
                    required type="text" value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    className="tw-w-full tw-bg-slate-800/50 tw-border tw-border-white/10 tw-p-5 tw-rounded-3xl tw-outline-none focus:tw-border-blue-500 focus:tw-bg-slate-800 tw-transition-all tw-text-white tw-font-mono placeholder:tw-text-slate-600 tw-shadow-inner" 
                    placeholder="E.G. CUST-AUTO-001" 
                  />
                </div>
              </div>
            </section>

            {/* Business Registry Section */}
            <section className="tw-space-y-6">
              <h3 className="tw-text-xs tw-font-black tw-text-emerald-500 tw-uppercase tw-tracking-[0.3em] tw-flex tw-items-center tw-gap-3">
                <div className="tw-w-1.5 tw-h-1.5 tw-bg-emerald-500 tw-rounded-full tw-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                Registry Details
              </h3>
              <div className="tw-grid tw-grid-cols-2 tw-gap-8 tw-mt-4">
                <div className="tw-space-y-3">
                  <label className="tw-text-[11px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest tw-ml-1">Business Registration #</label>
                  <input 
                    type="text" value={formData.businessNumber}
                    onChange={(e) => setFormData({ ...formData, businessNumber: e.target.value })}
                    className="tw-w-full tw-bg-slate-800/50 tw-border tw-border-white/10 tw-p-5 tw-rounded-3xl tw-outline-none focus:tw-border-emerald-500 tw-transition-all tw-text-white tw-font-semibold" 
                    placeholder="XXX-XX-XXXXX" 
                  />
                </div>
                <div className="tw-space-y-3">
                  <label className="tw-text-[11px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest tw-ml-1">Legal Representative</label>
                  <input 
                    type="text" value={formData.representativeName}
                    onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                    className="tw-w-full tw-bg-slate-800/50 tw-border tw-border-white/10 tw-p-5 tw-rounded-3xl tw-outline-none focus:tw-border-emerald-500 tw-transition-all tw-text-white tw-font-semibold" 
                    placeholder="Executive Name" 
                  />
                </div>
              </div>
            </section>

            {/* Contact Information Section */}
            <section className="tw-space-y-6">
              <h3 className="tw-text-xs tw-font-black tw-text-amber-500 tw-uppercase tw-tracking-[0.3em] tw-flex tw-items-center tw-gap-3">
                <div className="tw-w-1.5 tw-h-1.5 tw-bg-amber-500 tw-rounded-full tw-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                Contact Matrix
              </h3>
              <div className="tw-grid tw-grid-cols-2 tw-gap-8 tw-mt-4">
                <div className="tw-space-y-3">
                  <label className="tw-text-[11px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest tw-ml-1">Corporate Phone</label>
                  <input 
                    type="text" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="tw-w-full tw-bg-slate-800/50 tw-border tw-border-white/10 tw-p-5 tw-rounded-3xl tw-outline-none focus:tw-border-amber-500 tw-transition-all tw-text-white" 
                    placeholder="+82 2-XXX-XXXX" 
                  />
                </div>
                <div className="tw-space-y-3">
                  <label className="tw-text-[11px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest tw-ml-1">Official Email Address</label>
                  <input 
                    type="email" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="tw-w-full tw-bg-slate-800/50 tw-border tw-border-white/10 tw-p-5 tw-rounded-3xl tw-outline-none focus:tw-border-amber-500 tw-transition-all tw-text-white" 
                    placeholder="governance@company.com" 
                  />
                </div>
                <div className="tw-col-span-2 tw-space-y-3">
                  <label className="tw-text-[11px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest tw-ml-1">Headquarters Location</label>
                  <textarea 
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="tw-w-full tw-bg-slate-800/50 tw-border tw-border-white/10 tw-p-5 tw-rounded-3xl tw-outline-none focus:tw-border-amber-500 tw-transition-all tw-text-white tw-resize-none" 
                    placeholder="Full Corporate Address..." 
                  />
                </div>
              </div>
            </section>

            {/* Operational Status */}
            <section className="tw-space-y-6">
              <div className="tw-flex tw-items-center tw-justify-between tw-p-8 tw-bg-white/5 tw-rounded-[32px] tw-border tw-border-white/10">
                <div className="tw-flex tw-flex-col tw-gap-1">
                  <span className="tw-text-sm tw-font-black tw-text-white">Status Deployment</span>
                  <span className="tw-text-[10px] tw-text-slate-500 tw-font-bold tw-uppercase tw-tracking-widest">Active nodes receive full SLA monitoring</span>
                </div>
                <div className="tw-flex tw-gap-2 tw-p-1 tw-bg-slate-900 tw-rounded-2xl tw-border tw-border-white/5">
                  {['ACTIVE', 'INACTIVE'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: s })}
                      className={`tw-py-3 tw-px-10 tw-rounded-xl tw-text-[11px] tw-font-black tw-tracking-widest tw-transition-all ${formData.status === s ? 'tw-bg-blue-600 tw-text-white tw-shadow-lg tw-shadow-blue-500/30' : 'tw-text-slate-500 hover:tw-text-slate-200'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <div className="tw-p-8 tw-bg-rose-500/10 tw-border tw-border-rose-500/20 tw-rounded-[32px] tw-flex tw-gap-6 tw-items-start">
              <div className="tw-w-10 tw-h-10 tw-bg-rose-500 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-shrink-0 tw-shadow-lg tw-shadow-rose-500/20">
                <AlertTriangle size={20} className="tw-text-white" />
              </div>
              <div className="tw-flex tw-flex-col tw-gap-1">
                <span className="tw-text-xs tw-font-black tw-text-rose-200 tw-uppercase tw-tracking-widest">Critical Synchronization Warning</span>
                <p className="tw-text-[10px] tw-text-rose-200/60 tw-leading-relaxed tw-font-bold">
                  Applying these changes will immediately propagate across the strategic shard. Shard re-authorization may be required for major identity shifts.
                </p>
              </div>
            </div>
          </div>

          <div className="tw-p-12 tw-bg-black/50 tw-border-t tw-border-white/5 tw-flex tw-justify-end tw-gap-6">
            <button type="button" className="tw-py-5 tw-px-12 tw-bg-white/5 hover:tw-bg-white/10 tw-text-slate-400 hover:tw-text-white tw-rounded-[24px] tw-font-black tw-uppercase tw-tracking-widest tw-text-[11px] tw-transition-all tw-border tw-border-white/5" onClick={onClose}>Abort Sync</button>
            <button type="submit" className="tw-py-5 tw-px-20 tw-bg-blue-600 hover:tw-bg-blue-500 tw-text-white tw-font-black tw-uppercase tw-tracking-widest tw-text-[11px] tw-rounded-[24px] tw-shadow-2xl tw-shadow-blue-600/40 tw-transition-all tw-transform hover:tw--translate-y-1 active:tw-translate-y-0">
              {company ? 'Finalize Governance Update' : 'Initialize Shard Shard'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CustomerCompanyForm;
