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
    NEW: '신규 (등록됨)',
    ASSIGNED: '배정 (담당자 지정됨)',
    IN_PROGRESS: '처리 중 (작업 진행)',
    ON_HOLD: '보류 (외부 대기 중)',
    RESOLVED: '조치 완료 (복구됨)',
    CLOSED: '최종 종료 (아카이브됨)'
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
                  {incident ? '인시던트 조치 업데이트' : '신규 인시던트 등록'}
                  <span className="tw-text-[10px] tw-font-bold tw-py-1 tw-px-3 tw-bg-blue-500/10 tw-rounded-full tw-text-blue-400 tw-border tw-border-blue-500/20 tw-tracking-widest">
                    {incident ? incident.incidentId : 'RAPID'}
                  </span>
                </h2>
                <p className="tw-text-[10px] tw-text-slate-500 tw-font-bold tw-uppercase tw-tracking-widest tw-mt-1">ITIL v5 표준 서비스 복구 프로세스</p>
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
                  <label className="tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest">인시던트 식별 및 요약</label>
                  <label className="tw-flex tw-items-center tw-gap-2 tw-cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="tw-w-4 tw-h-4 tw-accent-rose-500" 
                      checked={formData.isMajorIncident}
                      disabled={!isEditable('isMajorIncident')}
                      onChange={e => handlePriorityChange('isMajorIncident', e.target.checked)}
                    />
                    <span className="tw-text-[10px] tw-font-black tw-text-rose-500 tw-uppercase">대형 장애 (Major)</span>
                  </label>
                </div>
                <input 
                  className={`tw-w-full tw-bg-white/5 tw-border tw-border-white/10 tw-rounded-2xl tw-px-6 tw-py-4 tw-text-white tw-font-bold tw-outline-none focus:tw-border-blue-500/50 transition-all placeholder:tw-text-slate-700 ${!isEditable('title') ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`}
                  placeholder="요약 제목을 입력하세요 (예: 서울 데이터센터 서버 중단)"
                  value={formData.title}
                  readOnly={!isEditable('title')}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
                <textarea 
                  className={`tw-w-full tw-bg-white/5 tw-border tw-border-white/10 tw-rounded-2xl tw-px-6 tw-py-4 tw-text-white tw-text-sm tw-outline-none focus:tw-border-blue-500/50 transition-all tw-min-h-[140px] placeholder:tw-text-slate-700 ${!isEditable('description') ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`}
                  placeholder="상세 증상, 에러 코드 및 업무 영향도를 입력하세요..."
                  value={formData.description}
                  readOnly={!isEditable('description')}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="tw-grid tw-grid-cols-2 tw-gap-8">
                <div className="tw-space-y-4">
                  <label className="tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest">접수 채널</label>
                  <select 
                    className={`tw-w-full tw-bg-white/5 tw-border tw-border-white/10 tw-rounded-2xl tw-px-6 tw-py-4 tw-text-white tw-font-bold tw-appearance-none focus:tw-border-blue-500/50 transition-all tw-cursor-pointer ${!isEditable('channel') ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`}
                    disabled={!isEditable('channel')}
                    value={formData.channel || 'OTHER'}
                    onChange={e => setFormData({...formData, channel: e.target.value as any})}
                  >
                    <option value="PHONE">전화 (Phone)</option>
                    <option value="EMAIL">이메일 (Email)</option>
                    <option value="SELF_SERVICE">셀프 서비스 Portal</option>
                    <option value="MONITORING">모니터링 시스템</option>
                    <option value="CHAT">채팅 (Messenger)</option>
                    <option value="OTHER">기타 (Other)</option>
                  </select>
                </div>
                <div className="tw-space-y-4">
                  <label className="tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest">영향 사용자 ID</label>
                  <input 
                    className={`tw-w-full tw-bg-white/5 tw-border tw-border-white/10 tw-rounded-2xl tw-px-6 tw-py-4 tw-text-white tw-font-bold tw-outline-none focus:tw-border-blue-500/50 transition-all placeholder:tw-text-slate-700 ${!isEditable('affectedUserId') ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`}
                    placeholder="영향 받는 사용자 ID (현재 사용자외)"
                    readOnly={!isEditable('affectedUserId')}
                    value={formData.affectedUserId || ''}
                    onChange={e => setFormData({...formData, affectedUserId: e.target.value})}
                  />
                </div>
              </div>

              <div className="tw-grid tw-grid-cols-2 tw-gap-8">
                <div className="tw-space-y-4">
                  <label className="tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest">영향도 수준 (Impact)</label>
                  <div className="tw-relative">
                    <select 
                      className={`tw-w-full tw-bg-white/5 tw-border tw-border-white/10 tw-rounded-2xl tw-px-6 tw-py-4 tw-text-white tw-font-bold tw-appearance-none focus:tw-border-blue-500/50 transition-all tw-cursor-pointer ${(!isEditable('impact') || formData.isMajorIncident) ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`}
                      disabled={!isEditable('impact') || formData.isMajorIncident}
                      value={formData.impact}
                      onChange={e => handlePriorityChange('impact', e.target.value)}
                    >
                      <option value="HIGH">높음 (전체 중단)</option>
                      <option value="MEDIUM">중간 (성능 저하)</option>
                      <option value="LOW">낮음 (국소적)</option>
                    </select>
                  </div>
                </div>
                <div className="tw-space-y-4">
                  <label className="tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest">시급성 지표 (Urgency)</label>
                  <div className="tw-relative">
                    <select 
                      className={`tw-w-full tw-bg-white/5 tw-border tw-border-white/10 tw-rounded-2xl tw-px-6 tw-py-4 tw-text-white tw-font-bold tw-appearance-none focus:tw-border-blue-500/50 transition-all tw-cursor-pointer ${(!isEditable('urgency') || formData.isMajorIncident) ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`}
                      disabled={!isEditable('urgency') || formData.isMajorIncident}
                      value={formData.urgency}
                      onChange={e => handlePriorityChange('urgency', e.target.value)}
                    >
                      <option value="HIGH">높음 (즉시 조치)</option>
                      <option value="MEDIUM">중간 (당일 이내)</option>
                      <option value="LOW">낮음 (정기/계획)</option>
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
                    <label className="tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest">보류 사유 (On-Hold Reason)</label>
                    <textarea 
                      className={`tw-w-full tw-bg-amber-500/5 tw-border tw-border-amber-500/20 tw-rounded-2xl tw-px-6 tw-py-4 tw-text-white tw-text-sm tw-outline-none focus:tw-border-amber-500/50 transition-all tw-min-h-[100px] placeholder:tw-text-slate-700 ${!isEditable('onHoldReason') ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`}
                      placeholder="인시던트가 일시 중단된 사유를 입력하세요 (예: 벤더사 회신 대기, 고객 추가 정보 필요)..."
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
                          <label className="tw-text-[10px] tw-font-black tw-text-emerald-500 tw-uppercase tw-tracking-widest">해결 코드 (Resolution Code)</label>
                          <select 
                            className={`tw-w-full tw-bg-emerald-500/5 tw-border tw-border-emerald-500/20 tw-rounded-2xl tw-px-6 tw-py-4 tw-text-white tw-font-bold tw-appearance-none focus:tw-border-emerald-500/50 transition-all tw-cursor-pointer ${!isEditable('resolutionCode') ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`}
                            disabled={!isEditable('resolutionCode')}
                            value={formData.resolutionCode || ''}
                            onChange={e => setFormData({...formData, resolutionCode: e.target.value})}
                          >
                            <option value="">해결 코드를 선택하세요</option>
                            <option value="FIXED_PERMANENT">영구 해결 (Fixed)</option>
                            <option value="WORKAROUND_APPLIED">임시 조치 적용 (Workaround)</option>
                            <option value="THIRD_PARTY_FIX">제3자/벤더 조치 완료</option>
                            <option value="NOT_REPRODUCIBLE">증상 재현 불가</option>
                            <option value="BY_DESIGN">정상 동작 (By Design)</option>
                          </select>
                        </div>
                        <div className="tw-space-y-4">
                          <label className="tw-text-[10px] tw-font-black tw-text-emerald-500 tw-uppercase tw-tracking-widest">해결 상세 내용 (Workaround/Resolution)</label>
                          <textarea 
                            className={`tw-w-full tw-bg-emerald-500/5 tw-border tw-border-emerald-500/20 tw-rounded-2xl tw-px-6 tw-py-4 tw-text-white tw-text-sm tw-outline-none focus:tw-border-emerald-500/50 transition-all tw-min-h-[100px] placeholder:tw-text-slate-700 ${!isEditable('workaround') ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`}
                            placeholder="서비스 복구를 위해 수행한 조치 내용을 상세히 기록하세요..."
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
                <label className="tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest">ITIL 생명주기 상태 (Status)</label>
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
                    <span className="tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest">계산된 우선순위</span>
                    <p className={`tw-text-xl tw-font-black ${formData.priority === 'P1' ? 'tw-text-rose-500' : 'tw-text-white'}`}>{formData.priority || 'P3'}</p>
                  </div>
                </div>
                <div className="tw-text-right">
                   <span className="tw-text-[10px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest">목표 해결 시간</span>
                   <p className="tw-text-blue-400 tw-font-bold tw-flex tw-items-center tw-justify-end tw-gap-2 tw-mt-1">
                     <Clock size={16}/> {formData.priority === 'P1' ? '4시간 이내' : '8-24시간 이내'}
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
              작성 취소
            </button>
            <button 
              onClick={() => onSubmit(formData as IncidentDTO)}
              className="tw-flex-1 tw-py-4 tw-bg-blue-600 hover:tw-bg-blue-500 tw-text-white tw-font-black tw-rounded-2xl tw-shadow-xl tw-shadow-blue-600/30 tw-transition-all active:tw-scale-95 tw-flex tw-items-center tw-justify-center tw-gap-2"
            >
              <Save size={20} /> {incident ? '수정사항 적용' : '티켓 생성 등록'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default IncidentFormModal;
