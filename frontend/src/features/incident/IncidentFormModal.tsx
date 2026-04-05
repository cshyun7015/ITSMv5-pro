import React, { useState, useEffect } from 'react';
import { type IncidentDTO } from './api/apiIncident';
import { X, ShieldAlert, Zap, Clock, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIncidentStatusRules } from './hooks/useIncidentStatusRules';
import { canEditField } from './utils/incidentRules';

interface Props {
  incident: IncidentDTO | null;
  onClose: () => void;
  onSubmit: (data: IncidentDTO) => void;
}

const IncidentFormModal: React.FC<Props> = ({ incident, onClose, onSubmit }) => {
  const defaultForm: Partial<IncidentDTO> = {
    title: '',
    description: '',
    impact: 'MEDIUM',
    urgency: 'MEDIUM',
    priority: 'P3',
    status: 'NEW',
    categoryId: 'SOFTWARE',
    tenantId: 'SYSTEM'
  };

  const { getAllowedNextStatuses, isBackendFailed } = useIncidentStatusRules();
  const [formData, setFormData] = useState<Partial<IncidentDTO>>(defaultForm);

  const STATUS_LABELS: Record<string, string> = {
    NEW: 'NEW (Initial Log)',
    ASSIGNED: 'ASSIGNED (Ownership)',
    IN_PROGRESS: 'IN_PROGRESS (Tactical Action)',
    ON_HOLD: 'ON_HOLD (Pending External)',
    RESOLVED: 'RESOLVED (Restored)',
    CLOSED: 'CLOSED (Final Audit)'
  };

  const currentStatus = incident?.status || 'NEW';
  const isEditable = (field: string) => canEditField(currentStatus, field);

  useEffect(() => {
    if (incident) {
      setFormData({ ...incident }); // Clone to avoid direct mutation
    } else {
      setFormData(defaultForm); // Reset for Create mode
    }
  }, [incident]);

  const calculatePriority = (impact: string, urgency: string, isMajor: boolean): string => {
    if (isMajor) return 'P1';
    if (impact === 'HIGH' && urgency === 'HIGH') return 'P1';
    if (impact === 'HIGH' || urgency === 'HIGH') return 'P2';
    if (impact === 'LOW' && urgency === 'LOW') return 'P4';
    return 'P3';
  };

  const handlePriorityChange = (field: 'impact' | 'urgency' | 'isMajorIncident', value: any) => {
    const newData = { ...formData, [field]: value };
    const priority = calculatePriority(newData.impact!, newData.urgency!, !!newData.isMajorIncident);
    setFormData({ ...newData, priority: priority as any });
  };

  return (
    <div className="inc-scoped">
      <div className="tw-fixed tw-inset-0 tw-z-[9999] tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-slate-950/70 tw-backdrop-blur-xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="tw-bg-slate-900 tw-border tw-border-white/10 tw-w-full tw-max-w-2xl tw-rounded-[40px] tw-shadow-2xl tw-overflow-hidden"
        >
          {/* Header */}
          <div className="tw-p-8 tw-border-b tw-border-white/5 tw-flex tw-justify-between tw-items-center tw-bg-white/2">
            <div className="tw-flex tw-items-center tw-gap-4">
              <div className="tw-p-3 tw-bg-blue-600/20 tw-rounded-2xl tw-border tw-border-blue-500/20">
                <Zap className="tw-text-blue-400" size={24} />
              </div>
              <div>
                <h2 className="tw-text-xl tw-font-black tw-text-white tw-flex tw-items-center tw-gap-3">
                  {incident ? 'UPDATE OPERATIONAL TICKET' : 'NEW INCIDENT LOG'}
                  <span className="tw-text-[10px] tw-font-bold tw-py-1 tw-px-3 tw-bg-blue-500/10 tw-rounded-full tw-text-blue-400 tw-border tw-border-blue-500/20 tw-tracking-widest">
                    {incident ? incident.incidentId : 'RAPID'}
                  </span>
                </h2>
                <p className="tw-text-[10px] tw-text-slate-500 tw-font-bold tw-uppercase tw-tracking-widest tw-mt-1">ITIL v5 Compliance Restore Process</p>
              </div>
            </div>
            <button onClick={onClose} className="tw-p-3 hover:tw-bg-white/5 tw-rounded-full tw-text-slate-500 tw-transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="tw-p-8 tw-max-h-[75vh] tw-overflow-y-auto">
            <div className="tw-space-y-8">
              <div className="tw-space-y-4">
                <div className="tw-flex tw-justify-between tw-items-center">
                  <label className="tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest">Identification & Summary</label>
                  <label className="tw-flex tw-items-center tw-gap-2 tw-cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="tw-w-4 tw-h-4 tw-accent-rose-500" 
                      checked={formData.isMajorIncident}
                      disabled={!isEditable('isMajorIncident')}
                      onChange={e => handlePriorityChange('isMajorIncident', e.target.checked)}
                    />
                    <span className="tw-text-[10px] tw-font-black tw-text-rose-500 tw-uppercase">Major Incident</span>
                  </label>
                </div>
                <input 
                  className={`tw-w-full tw-bg-white/5 tw-border tw-border-white/10 tw-rounded-2xl tw-px-6 tw-py-4 tw-text-white tw-font-bold tw-outline-none focus:tw-border-blue-500/50 transition-all placeholder:tw-text-slate-700 ${!isEditable('title') ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`}
                  placeholder="Enter a brief title (e.g. Server down in Seoul)"
                  value={formData.title}
                  readOnly={!isEditable('title')}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
                <textarea 
                  className={`tw-w-full tw-bg-white/5 tw-border tw-border-white/10 tw-rounded-2xl tw-px-6 tw-py-4 tw-text-white tw-text-sm tw-outline-none focus:tw-border-blue-500/50 transition-all tw-min-h-[140px] placeholder:tw-text-slate-700 ${!isEditable('description') ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`}
                  placeholder="Provide detailed symptoms, error codes, and business impact..."
                  value={formData.description}
                  readOnly={!isEditable('description')}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="tw-grid tw-grid-cols-2 tw-gap-8">
                <div className="tw-space-y-4">
                  <label className="tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest">Reporting Channel</label>
                  <select 
                    className={`tw-w-full tw-bg-white/5 tw-border tw-border-white/10 tw-rounded-2xl tw-px-6 tw-py-4 tw-text-white tw-font-bold tw-appearance-none focus:tw-border-blue-500/50 transition-all tw-cursor-pointer ${!isEditable('channel') ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`}
                    disabled={!isEditable('channel')}
                    value={formData.channel || 'OTHER'}
                    onChange={e => setFormData({...formData, channel: e.target.value as any})}
                  >
                    <option value="PHONE">PHONE</option>
                    <option value="EMAIL">EMAIL</option>
                    <option value="SELF_SERVICE">SELF_SERVICE</option>
                    <option value="MONITORING">MONITORING</option>
                    <option value="CHAT">CHAT</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div className="tw-space-y-4">
                  <label className="tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest">Affected User ID</label>
                  <input 
                    className={`tw-w-full tw-bg-white/5 tw-border tw-border-white/10 tw-rounded-2xl tw-px-6 tw-py-4 tw-text-white tw-font-bold tw-outline-none focus:tw-border-blue-500/50 transition-all placeholder:tw-text-slate-700 ${!isEditable('affectedUserId') ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`}
                    placeholder="Affected user ID (if different)"
                    readOnly={!isEditable('affectedUserId')}
                    value={formData.affectedUserId || ''}
                    onChange={e => setFormData({...formData, affectedUserId: e.target.value})}
                  />
                </div>
              </div>

              <div className="tw-grid tw-grid-cols-2 tw-gap-8">
                <div className="tw-space-y-4">
                  <label className="tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest">Impact Level</label>
                  <div className="tw-relative">
                    <select 
                      className={`tw-w-full tw-bg-white/5 tw-border tw-border-white/10 tw-rounded-2xl tw-px-6 tw-py-4 tw-text-white tw-font-bold tw-appearance-none focus:tw-border-blue-500/50 transition-all tw-cursor-pointer ${(!isEditable('impact') || formData.isMajorIncident) ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`}
                      disabled={!isEditable('impact') || formData.isMajorIncident}
                      value={formData.impact}
                      onChange={e => handlePriorityChange('impact', e.target.value)}
                    >
                      <option value="HIGH">HIGH (Total Outage)</option>
                      <option value="MEDIUM">MEDIUM (Degraded)</option>
                      <option value="LOW">LOW (Localized)</option>
                    </select>
                  </div>
                </div>
                <div className="tw-space-y-4">
                  <label className="tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest">Urgency Metric</label>
                  <div className="tw-relative">
                    <select 
                      className={`tw-w-full tw-bg-white/5 tw-border tw-border-white/10 tw-rounded-2xl tw-px-6 tw-py-4 tw-text-white tw-font-bold tw-appearance-none focus:tw-border-blue-500/50 transition-all tw-cursor-pointer ${(!isEditable('urgency') || formData.isMajorIncident) ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`}
                      disabled={!isEditable('urgency') || formData.isMajorIncident}
                      value={formData.urgency}
                      onChange={e => handlePriorityChange('urgency', e.target.value)}
                    >
                      <option value="HIGH">HIGH (Immediate)</option>
                      <option value="MEDIUM">MEDIUM (NBD)</option>
                      <option value="LOW">LOW (Planned)</option>
                    </select>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {formData.status === 'ON_HOLD' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="tw-space-y-4 tw-overflow-hidden"
                  >
                    <label className="tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest">On-Hold Reason</label>
                    <textarea 
                      className={`tw-w-full tw-bg-amber-500/5 tw-border tw-border-amber-500/20 tw-rounded-2xl tw-px-6 tw-py-4 tw-text-white tw-text-sm tw-outline-none focus:tw-border-amber-500/50 transition-all tw-min-h-[100px] placeholder:tw-text-slate-700 ${!isEditable('onHoldReason') ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`}
                      placeholder="Specify why this incident is paused (e.g. Awaiting vendor, Customer info needed)..."
                      value={formData.onHoldReason || ''}
                      readOnly={!isEditable('onHoldReason')}
                      onChange={e => setFormData({...formData, onHoldReason: e.target.value})}
                    />
                  </motion.div>
                )}

                {(formData.status === 'RESOLVED' || formData.status === 'IN_PROGRESS') && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="tw-space-y-6 tw-overflow-hidden tw-pt-4 tw-border-t tw-border-white/5"
                  >
                     <div className="tw-grid tw-grid-cols-1 tw-gap-6">
                        <div className="tw-space-y-4">
                          <label className="tw-text-[10px] tw-font-black tw-text-emerald-500 tw-uppercase tw-tracking-widest">Resolution Code</label>
                          <select 
                            className={`tw-w-full tw-bg-emerald-500/5 tw-border tw-border-emerald-500/20 tw-rounded-2xl tw-px-6 tw-py-4 tw-text-white tw-font-bold tw-appearance-none focus:tw-border-emerald-500/50 transition-all tw-cursor-pointer ${!isEditable('resolutionCode') ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`}
                            disabled={!isEditable('resolutionCode')}
                            value={formData.resolutionCode || ''}
                            onChange={e => setFormData({...formData, resolutionCode: e.target.value})}
                          >
                            <option value="">Select Resolution Code</option>
                            <option value="FIXED_PERMANENT">FIXED (Permanent)</option>
                            <option value="WORKAROUND_APPLIED">WORKAROUND Applied</option>
                            <option value="THIRD_PARTY_FIX">THIRD PARTY Fix</option>
                            <option value="NOT_REPRODUCIBLE">NOT REPRODUCIBLE</option>
                            <option value="BY_DESIGN">BY DESIGN / NO FIX</option>
                          </select>
                        </div>
                        <div className="tw-space-y-4">
                          <label className="tw-text-[10px] tw-font-black tw-text-emerald-500 tw-uppercase tw-tracking-widest">Workaround / Resolution Details</label>
                          <textarea 
                            className={`tw-w-full tw-bg-emerald-500/5 tw-border tw-border-emerald-500/20 tw-rounded-2xl tw-px-6 tw-py-4 tw-text-white tw-text-sm tw-outline-none focus:tw-border-emerald-500/50 transition-all tw-min-h-[100px] placeholder:tw-text-slate-700 ${!isEditable('workaround') ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`}
                            placeholder="Detail the steps taken to restore service..."
                            value={formData.workaround || ''}
                            readOnly={!isEditable('workaround')}
                            onChange={e => setFormData({...formData, workaround: e.target.value})}
                          />
                        </div>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="tw-space-y-4">
                <label className="tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest">ITIL Lifecycle Status</label>
                <div className="tw-relative">
                  <select 
                    className={`tw-w-full tw-bg-white/5 tw-border tw-border-white/10 tw-rounded-2xl tw-px-6 tw-py-4 tw-text-white tw-font-bold tw-appearance-none focus:tw-border-blue-500/50 transition-all tw-cursor-pointer ${!incident ? 'tw-opacity-50 tw-cursor-not-allowed' : 'tw-text-emerald-400'}`}
                    disabled={!incident}
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                  >
                    {!incident ? (
                      <option value="NEW">NEW (Initial Log)</option>
                    ) : (
                      // Fetch next allowed statuses via hook (Backend check with Frontend fallback)
                      getAllowedNextStatuses(incident.status).map(status => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status] || status}
                        </option>
                      ))
                    )}
                  </select>
                  {isBackendFailed && (
                     <div className="tw-mt-2 tw-text-[10px] tw-text-orange-400 tw-font-bold tw-flex tw-items-center tw-gap-1">
                        <span className="tw-w-1.5 tw-h-1.5 tw-bg-orange-500 tw-rounded-full tw-animate-pulse" />
                        BACKEND SYNC OFFLINE - ENFORCING FRONTEND GOVERNANCE
                     </div>
                  )}
                </div>
              </div>

              {/* Priority Scoped Info Card */}
              <div className="tw-p-6 tw-bg-blue-600/5 tw-border tw-border-blue-500/20 tw-rounded-[32px] tw-flex tw-items-center tw-justify-between tw-shadow-inner">
                <div className="tw-flex tw-items-center tw-gap-4">
                  <div className={`tw-p-3 tw-rounded-xl tw-shadow-lg ${formData.priority === 'P1' ? 'tw-bg-rose-500' : 'tw-bg-blue-600'}`}>
                    <ShieldAlert className="tw-text-white" size={24} />
                  </div>
                  <div>
                    <span className="tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest">Calculated Priority</span>
                    <p className={`tw-text-xl tw-font-black ${formData.priority === 'P1' ? 'tw-text-rose-500' : 'tw-text-white'}`}>{formData.priority || 'P3'}</p>
                  </div>
                </div>
                <div className="tw-text-right">
                   <span className="tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest">Resolution Target</span>
                   <p className="tw-text-blue-400 tw-font-bold tw-flex tw-items-center tw-justify-end tw-gap-2 tw-mt-1">
                     <Clock size={16}/> {formData.priority === 'P1' ? '4 Hours' : '8-24 Hours'}
                   </p>
                </div>
              </div>
            </div>
          </div>

          <div className="tw-p-8 tw-bg-white/2 tw-border-t tw-border-white/5 tw-flex tw-gap-4">
            <button 
              onClick={onClose}
              className="tw-px-8 tw-py-4 tw-bg-slate-800 hover:tw-bg-slate-700 tw-text-white tw-font-black tw-rounded-2xl tw-transition-all"
            >
              DISCARD
            </button>
            <button 
              onClick={() => onSubmit(formData as IncidentDTO)}
              className="tw-flex-1 tw-py-4 tw-bg-blue-600 hover:tw-bg-blue-500 tw-text-white tw-font-black tw-rounded-2xl tw-shadow-xl tw-shadow-blue-600/30 tw-transition-all active:tw-scale-95 tw-flex tw-items-center tw-justify-center tw-gap-2"
            >
              <Save size={20} /> {incident ? 'APPLY MODIFICATIONS' : 'CREATE TICKET'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default IncidentFormModal;
