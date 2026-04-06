import React, { useState } from 'react';
import { X, Save, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface CustomerCompanyFormProps {
  onClose: () => void;
  company?: any;
  onSave: (data: any) => Promise<void>;
}

const CustomerCompanyForm: React.FC<CustomerCompanyFormProps> = ({ onClose, company, onSave }) => {
  const [formData, setFormData] = useState({
    id: company?.id || null,
    customerId: company?.customerId || '',
    name: company?.name || '',
    businessNumber: company?.businessNumber || '',
    representativeName: company?.representativeName || '',
    status: company?.status || 'ACTIVE'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    onClose();
  };

  return (
    <div className="tw-fixed tw-inset-0 tw-z-[2000] tw-flex tw-items-center tw-justify-center tw-p-6">
      <motion.div 
        className="tw-absolute tw-inset-0 tw-bg-black/90 tw-backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div 
        className="tw-relative tw-w-full tw-max-w-2xl tw-bg-slate-900 tw-border tw-border-white/10 tw-rounded-[40px] tw-overflow-hidden tw-flex tw-flex-col tw-shadow-2xl"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSubmit} className="tw-flex tw-flex-col tw-h-full">
          {/* Header */}
          <div className="tw-p-8 tw-border-b tw-border-white/5 tw-flex tw-justify-between tw-items-center tw-bg-gradient-to-r tw-from-blue-600/10 tw-to-transparent">
            <div className="tw-flex tw-items-center tw-gap-4">
              <div className="tw-w-12 tw-h-12 tw-bg-blue-600 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-shadow-2xl tw-shadow-blue-500/20">
                <ShieldCheck size={24} className="tw-text-white" />
              </div>
              <h2 className="tw-text-2xl tw-font-bold tw-tracking-tight tw-text-white tw-uppercase">
                {company ? '고객사 정보 수정' : '신규 고객사 정보 등록'}
              </h2>
            </div>
            <button type="button" onClick={onClose} className="tw-p-2 hover:tw-bg-white/5 tw-rounded-full tw-transition-colors"><X size={20} /></button>
          </div>

          <div className="tw-p-10 tw-space-y-8">
            {/* Identity Section */}
            <section className="tw-space-y-4">
              <div className="tw-grid tw-grid-cols-2 tw-gap-6">
                <div className="tw-space-y-3">
                  <label className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-ml-1">고객사 식별 ID</label>
                  <input 
                    type="text" 
                    value={formData.customerId}
                    readOnly={!!company}
                    onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                    className={`tw-w-full tw-bg-white/5 tw-border tw-border-white/10 tw-px-5 tw-py-4 tw-rounded-2xl tw-outline-none focus:tw-border-blue-500 tw-transition-all tw-text-white tw-font-mono ${company ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`} 
                    placeholder="CUST-000-00A" 
                    required
                  />
                </div>
                <div className="tw-space-y-3">
                  <label className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-ml-1">고객사 명칭</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="tw-w-full tw-bg-white/5 tw-border tw-border-white/10 tw-px-5 tw-py-4 tw-rounded-2xl tw-outline-none focus:tw-border-blue-500 tw-transition-all tw-text-white tw-font-bold" 
                    placeholder="법인 명칭을 입력하세요" 
                    required
                  />
                </div>
              </div>
            </section>

            {/* Business Info Section */}
            <section className="tw-space-y-6">
              <h3 className="tw-text-[10px] tw-font-black tw-text-blue-500 tw-uppercase tw-tracking-[0.4em] tw-flex tw-items-center tw-gap-3">
                <div className="tw-w-1.5 tw-h-1.5 tw-bg-blue-500 tw-rounded-full" />
                사업자 및 법무 정보
              </h3>
              <div className="tw-grid tw-grid-cols-2 tw-gap-6">
                <div className="tw-space-y-3">
                  <label className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-ml-1">사업자 등록 번호</label>
                  <input 
                    type="text" 
                    value={formData.businessNumber}
                    onChange={(e) => setFormData({...formData, businessNumber: e.target.value})}
                    className="tw-w-full tw-bg-white/5 tw-border tw-border-white/10 tw-px-5 tw-py-4 tw-rounded-2xl tw-outline-none focus:tw-border-blue-500 tw-transition-all tw-text-white" 
                    placeholder="xxx-xx-xxxxx"
                  />
                </div>
                <div className="tw-space-y-3">
                  <label className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-ml-1">대표자 성명</label>
                  <input 
                    type="text" 
                    value={formData.representativeName}
                    onChange={(e) => setFormData({...formData, representativeName: e.target.value})}
                    className="tw-w-full tw-bg-white/5 tw-border tw-border-white/10 tw-px-5 tw-py-4 tw-rounded-2xl tw-outline-none focus:tw-border-blue-500 tw-transition-all tw-text-white" 
                  />
                </div>
              </div>
            </section>

            <div className="tw-p-6 tw-bg-blue-500/5 tw-border tw-border-blue-500/10 tw-rounded-[30px] tw-flex tw-gap-5 tw-items-start">
               <AlertTriangle size={24} className="tw-text-blue-500 tw-shrink-0" />
               <div className="tw-text-xs tw-text-blue-200/70 tw-leading-relaxed tw-font-medium">
                 신규 고객 테넌트 등록 시 격리된 보안 리소스 생성이 즉시 시작됩니다. <br />
                 IAM 정책 및 데이터베이스 샤드 할당 프로세스가 백그라운드에서 진행됩니다.
               </div>
            </div>
          </div>

          {/* Footer */}
          <div className="tw-p-8 tw-bg-black/30 tw-border-t tw-border-white/5 tw-flex tw-justify-end tw-gap-4">
            <button type="button" className="tw-px-8 tw-py-3.5 tw-bg-white/5 hover:tw-bg-white/10 tw-text-slate-300 tw-rounded-[20px] tw-font-bold tw-transition-all tw-text-sm" onClick={onClose}>취소</button>
            <button type="submit" className="tw-px-10 tw-py-3.5 tw-bg-blue-600 hover:tw-bg-blue-500 tw-text-white tw-rounded-[20px] tw-font-bold tw-shadow-xl tw-shadow-blue-600/30 tw-transition-all tw-text-sm tw-flex tw-items-center tw-gap-2">
              <Save size={18} /> 정보 저장
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CustomerCompanyForm;
