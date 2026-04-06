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
        className="tw-relative tw-w-full tw-max-w-2xl tw-bg-slate-900 tw-border tw-border-white/10 tw-rounded-3xl tw-overflow-hidden tw-flex tw-flex-col tw-shadow-2xl"
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSubmit} className="tw-flex tw-flex-col tw-h-full">
          {/* Form Header */}
          <div className="tw-p-8 tw-border-b tw-border-white/5 tw-flex tw-justify-between tw-items-center tw-bg-gradient-to-r tw-from-indigo-600/10 tw-to-transparent">
            <h2 className="tw-text-4xl tw-font-bold tw-flex tw-items-center tw-gap-6 tw-tracking-tighter tw-text-white">
              <div className="tw-w-12 tw-h-12 tw-bg-indigo-600 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-shadow-lg tw-shadow-indigo-500/20">
                <Target size={28} className="tw-text-white" />
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-3xl tw-line-height-none">{team ? '운영팀 정보 수정' : '신규 운영팀 등록'}</span>
                <span className="tw-text-xs tw-text-indigo-400 tw-font-semibold tw-uppercase tw-tracking-widest tw-mt-1">시스템 운영팀 설정</span>
              </div>
            </h2>
            <button type="button" onClick={onClose} className="tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-white/5 hover:tw-bg-white/10 tw-rounded-full tw-text-slate-400 hover:tw-text-white tw-transition-all tw-border tw-border-white/5"><X size={24} /></button>
          </div>

          <div className="tw-p-8 tw-space-y-8 tw-overflow-y-auto tw-max-h-[60vh]">
            <section className="tw-space-y-6">
              <div className="tw-space-y-3">
                <label className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-ml-1 tw-flex tw-items-center tw-gap-2">
                  <FileText size={12} className="tw-text-indigo-500" /> 운영팀 명칭
                </label>
                <input 
                  autoFocus required type="text" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="tw-w-full tw-bg-slate-800/50 tw-border tw-border-white/10 tw-px-4 tw-py-3 tw-rounded-xl tw-outline-none focus:tw-border-indigo-500 tw-transition-all tw-text-white tw-font-bold placeholder:tw-text-slate-600" 
                  placeholder="예: IT 운영 1팀" 
                />
              </div>

              <div className="tw-space-y-3">
                <label className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-ml-1 tw-flex tw-items-center tw-gap-2">
                  <Info size={12} className="tw-text-indigo-500" /> 운영팀 설명 (Description)
                </label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="tw-w-full tw-bg-slate-800/50 tw-border tw-border-white/10 tw-px-4 tw-py-3 tw-rounded-xl tw-outline-none focus:tw-border-indigo-500 tw-transition-all tw-text-white tw-resize-none tw-leading-relaxed placeholder:tw-text-slate-600" 
                  placeholder="운영팀의 주요 역할과 목표를 입력하세요..." 
                />
              </div>
            </section>

            <div className="tw-p-6 tw-bg-indigo-500/10 tw-border tw-border-indigo-500/20 tw-rounded-2xl tw-flex tw-gap-6 tw-items-start">
               <div className="tw-w-10 tw-h-10 tw-bg-indigo-600 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shrink-0 tw-shadow-lg tw-shadow-indigo-500/20">
                <ShieldAlert size={20} className="tw-text-white" />
              </div>
              <div className="tw-flex tw-flex-col tw-gap-1">
                <span className="tw-text-xs tw-font-black tw-text-indigo-200 tw-uppercase tw-tracking-widest">운영 권한 체계 확인됨</span>
                <p className="tw-text-xs tw-text-indigo-200/60 tw-leading-relaxed tw-font-medium">
                  이 운영팀을 생성하면 해당 하위 조직 및 사용자에 대한 운영 권한이 부여됩니다.
                </p>
              </div>
            </div>
          </div>

          <div className="tw-p-8 tw-bg-black/50 tw-border-t tw-border-white/5 tw-flex tw-justify-end tw-gap-4">
            <button type="button" className="tw-py-3 tw-px-10 tw-bg-white/5 hover:tw-bg-white/10 tw-text-slate-300 hover:tw-text-white tw-rounded-xl tw-font-bold tw-text-sm tw-transition-all tw-border tw-border-white/5" onClick={onClose}>취소</button>
            <button type="submit" className="tw-py-3 tw-px-12 tw-bg-indigo-600 hover:tw-bg-indigo-500 tw-text-white tw-font-bold tw-text-sm tw-rounded-xl tw-shadow-2xl tw-shadow-indigo-600/40 tw-transition-all tw-transform hover:tw--translate-y-1 active:tw-translate-y-0">
              {team ? '수정 완료' : '등록 완료'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default OperatorTeamForm;
