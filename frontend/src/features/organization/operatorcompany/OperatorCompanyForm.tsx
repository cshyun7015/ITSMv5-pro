import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface OperatorCompanyFormProps {
  onClose: () => void;
  company?: any;
  onSave?: (data: any) => void;
}

const OperatorCompanyForm: React.FC<OperatorCompanyFormProps> = ({ onClose, company, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    operatorCompanyId: '',
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
        operatorCompanyId: company.operatorCompanyId || '',
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
        ...company,
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
        className="tw-relative tw-w-full tw-max-w-4xl tw-bg-slate-900 tw-border tw-border-white/10 tw-rounded-3xl tw-overflow-hidden tw-flex tw-flex-col tw-shadow-2xl"
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSubmit} className="tw-flex tw-flex-col tw-h-full">
          <div className="tw-p-10 tw-border-b tw-border-white/5 tw-flex tw-justify-between tw-items-center tw-bg-gradient-to-r tw-from-indigo-600/10 tw-to-transparent">
            <h2 className="tw-text-4xl tw-font-black tw-flex tw-items-center tw-gap-6 tw-tracking-tighter tw-text-white">
            <div className="tw-w-16 tw-h-16 tw-bg-indigo-600 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-shadow-lg tw-shadow-indigo-500/20">
                <ShieldCheck size={32} className="tw-text-white" />
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-3xl tw-line-height-none">{company ? 'MSP 정보 수정' : '신규 MSP 등록'}</span>
              <span className="tw-text-xs tw-text-indigo-400 tw-font-semibold tw-uppercase tw-tracking-widest tw-mt-1">ITIL v5 운영 거버넌스</span>
              </div>
            </h2>
            <button type="button" onClick={onClose} className="tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-white/5 hover:tw-bg-white/10 tw-rounded-full tw-text-slate-400 hover:tw-text-white tw-transition-all tw-border tw-border-white/5"><X size={24} /></button>
          </div>

        <div className="tw-p-8 tw-space-y-8 tw-overflow-y-auto tw-max-h-[70vh]">
            <section className="tw-space-y-6">
              <h3 className="tw-text-xs tw-font-black tw-text-indigo-500 tw-uppercase tw-tracking-[0.3em] tw-flex tw-items-center tw-gap-3">
                <div className="tw-w-1.5 tw-h-1.5 tw-bg-indigo-500 tw-rounded-full tw-shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
                MSP 기본 정보
              </h3>
            <div className="tw-grid tw-grid-cols-2 tw-gap-6 tw-mt-4">
                <div className="tw-space-y-3">
                <label className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-ml-1">MSP ID</label>
                  <input 
                    required type="text" value={formData.operatorCompanyId}
                    readOnly={!!company}
                    onChange={(e) => setFormData({ ...formData, operatorCompanyId: e.target.value })}
                    className={`tw-w-full tw-border tw-border-white/10 tw-px-4 tw-py-3 tw-rounded-xl tw-outline-none tw-transition-all tw-text-white tw-font-mono placeholder:tw-text-slate-600 tw-shadow-inner ${!!company ? 'tw-bg-slate-900/50 tw-text-slate-500 tw-cursor-not-allowed' : 'tw-bg-slate-800/50 focus:tw-border-indigo-500 focus:tw-bg-slate-800'}`} 
                    placeholder="예: OP-001" 
                  />
                </div>
                <div className="tw-space-y-3">
                <label className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-ml-1">MSP 명</label>
                  <input 
                    autoFocus={!company} required type="text" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="tw-w-full tw-bg-slate-800/50 tw-border tw-border-white/10 tw-px-4 tw-py-3 tw-rounded-xl tw-outline-none focus:tw-border-indigo-500 focus:tw-bg-slate-800 tw-transition-all tw-text-white tw-font-bold placeholder:tw-text-slate-600 tw-shadow-inner" 
                    placeholder="MSP 이름을 입력하세요" 
                  />
                </div>
              </div>
            </section>

            {/* Business Registry Section */}
            <section className="tw-space-y-6">
              <h3 className="tw-text-xs tw-font-black tw-text-emerald-500 tw-uppercase tw-tracking-[0.3em] tw-flex tw-items-center tw-gap-3">
                <div className="tw-w-1.5 tw-h-1.5 tw-bg-emerald-500 tw-rounded-full tw-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                사업자 정보
              </h3>
            <div className="tw-grid tw-grid-cols-2 tw-gap-6 tw-mt-4">
                <div className="tw-space-y-3">
                <label className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-ml-1">사업자 등록 번호</label>
                  <input 
                    type="text" value={formData.businessNumber}
                    onChange={(e) => setFormData({ ...formData, businessNumber: e.target.value })}
                  className="tw-w-full tw-bg-slate-800/50 tw-border tw-border-white/10 tw-px-4 tw-py-3 tw-rounded-xl tw-outline-none focus:tw-border-emerald-500 tw-transition-all tw-text-white tw-font-semibold" 
                    placeholder="000-00-00000" 
                  />
                </div>
                <div className="tw-space-y-3">
                <label className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-ml-1">대표자 성명</label>
                  <input 
                    type="text" value={formData.representativeName}
                    onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                  className="tw-w-full tw-bg-slate-800/50 tw-border tw-border-white/10 tw-px-4 tw-py-3 tw-rounded-xl tw-outline-none focus:tw-border-emerald-500 tw-transition-all tw-text-white tw-font-semibold" 
                    placeholder="대표자 이름을 입력하세요" 
                  />
                </div>
              </div>
            </section>

            {/* Operational Status */}
            <section className="tw-space-y-6">
            <div className="tw-flex tw-items-center tw-justify-between tw-p-6 tw-bg-white/5 tw-rounded-2xl tw-border tw-border-white/10">
                <div className="tw-flex tw-flex-col tw-gap-1">
                  <span className="tw-text-sm tw-font-black tw-text-white">운영 상태 설정</span>
                <span className="tw-text-xs tw-text-slate-400 tw-font-medium tw-uppercase tw-tracking-widest">활성 상태인 경우에만 시스템 운영 권한이 부여됩니다.</span>
                </div>
                <div className="tw-flex tw-gap-2 tw-p-1 tw-bg-slate-900 tw-rounded-2xl tw-border tw-border-white/5">
                  {[
                    { key: 'ACTIVE', label: '활성' },
                    { key: 'INACTIVE', label: '비활성' }
                  ].map(s => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: s.key })}
                    className={`tw-py-2.5 tw-px-8 tw-rounded-xl tw-text-xs tw-font-bold tw-tracking-widest tw-transition-all ${formData.status === s.key ? 'tw-bg-indigo-600 tw-text-white tw-shadow-lg tw-shadow-indigo-500/30' : 'tw-text-slate-500 hover:tw-text-slate-200'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

          <div className="tw-p-6 tw-bg-rose-500/10 tw-border tw-border-rose-500/20 tw-rounded-2xl tw-flex tw-gap-4 tw-items-start">
              <div className="tw-w-10 tw-h-10 tw-bg-rose-500 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-shrink-0 tw-shadow-lg tw-shadow-rose-500/20">
                <AlertTriangle size={20} className="tw-text-white" />
              </div>
              <div className="tw-flex tw-flex-col tw-gap-1">
                <span className="tw-text-xs tw-font-black tw-text-rose-200 tw-uppercase tw-tracking-widest">운영 동기화 경고</span>
              <p className="tw-text-xs tw-text-rose-200/80 tw-leading-relaxed tw-font-medium">
                  운영사 정보 변경은 전체 멀티 테넌트 환경에 영향을 줄 수 있습니다. 변경 전 내용을 다시 확인해 주세요.
                </p>
              </div>
            </div>
          </div>

        <div className="tw-p-8 tw-bg-black/50 tw-border-t tw-border-white/5 tw-flex tw-justify-end tw-gap-4">
          <button type="button" className="tw-py-3.5 tw-px-8 tw-bg-white/5 hover:tw-bg-white/10 tw-text-slate-300 hover:tw-text-white tw-rounded-xl tw-font-bold tw-text-sm tw-transition-all tw-border tw-border-white/5" onClick={onClose}>취소</button>
          <button type="submit" className="tw-py-3.5 tw-px-10 tw-bg-indigo-600 hover:tw-bg-indigo-500 tw-text-white tw-font-bold tw-text-sm tw-rounded-xl tw-shadow-2xl tw-shadow-indigo-600/40 tw-transition-all tw-transform hover:tw--translate-y-1 active:tw-translate-y-0">
              {company ? '수정 완료' : '등록 완료'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default OperatorCompanyForm;
