import React, { useState, useEffect } from 'react';
import { Fingerprint, X, ShieldCheck, Mail, UserCircle, Key } from 'lucide-react';
import { motion } from 'framer-motion';

interface OperatorUserFormProps {
  onClose: () => void;
  user?: any;
  onSave?: (data: any) => void;
}

const OperatorUserForm: React.FC<OperatorUserFormProps> = ({ onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    email: '',
    role: 'Standard Operator',
    isActive: true
  });

  useEffect(() => {
    if (user) {
      setFormData({
        userId: user.userId || '',
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'Standard Operator',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) onSave({ ...user, ...formData });
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
          {/* Header */}
          <div className="tw-p-8 tw-border-b tw-border-white/5 tw-flex tw-justify-between tw-items-center tw-bg-gradient-to-r tw-from-indigo-600/10 tw-to-transparent">
            <h2 className="tw-text-4xl tw-font-bold tw-flex tw-items-center tw-gap-6 tw-tracking-tighter tw-text-white">
              <div className="tw-w-12 tw-h-12 tw-bg-indigo-600 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-shadow-lg tw-shadow-indigo-500/20">
                <Fingerprint size={28} className="tw-text-white" />
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-3xl tw-line-height-none">{user ? '운영자 정보 수정' : '신규 운영자 등록'}</span>
                <span className="tw-text-xs tw-text-indigo-400 tw-font-semibold tw-uppercase tw-tracking-widest tw-mt-1">사용자 권한 설정 센터</span>
              </div>
            </h2>
            <button type="button" onClick={onClose} className="tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-white/5 hover:tw-bg-white/10 tw-rounded-full tw-text-slate-400 hover:tw-text-white tw-transition-all tw-border tw-border-white/5"><X size={24} /></button>
          </div>

          <div className="tw-p-8 tw-space-y-8 tw-overflow-y-auto tw-max-h-[60vh]">
            {/* Identity Core */}
            <section className="tw-space-y-6">
              <h3 className="tw-text-[10px] tw-font-bold tw-text-slate-500 tw-uppercase tw-tracking-[0.2em] tw-flex tw-items-center tw-gap-3">
                <Fingerprint size={14} className="tw-text-indigo-500" /> 사용자 기본 식별 정보
              </h3>
              <div className="tw-grid tw-grid-cols-2 tw-gap-6 tw-mt-4">
                <div className="tw-space-y-3">
                  <label className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-ml-1">로그인 ID</label>
                  <input 
                    required type="text" value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="tw-w-full tw-bg-slate-800/50 tw-border tw-border-white/10 tw-px-4 tw-py-3 tw-rounded-xl tw-outline-none focus:tw-border-indigo-500 tw-transition-all tw-text-white tw-font-mono" 
                    placeholder="예: admin_1" 
                  />
                </div>
                <div className="tw-space-y-3">
                  <label className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-ml-1">운영자 성명</label>
                  <input 
                    required type="text" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="tw-w-full tw-bg-slate-800/50 tw-border tw-border-white/10 tw-px-4 tw-py-3 tw-rounded-xl tw-outline-none focus:tw-border-indigo-500 tw-transition-all tw-text-white tw-font-bold" 
                    placeholder="사용자 이름을 입력하세요" 
                  />
                </div>
              </div>
              <div className="tw-space-y-3">
                <label className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-ml-1 tw-flex tw-items-center tw-gap-2">
                  <Mail size={12} className="tw-text-indigo-500" /> 커뮤니케이션 채널 (이메일)
                </label>
                <input 
                  required type="email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="tw-w-full tw-bg-slate-800/50 tw-border tw-border-white/10 tw-px-4 tw-py-3 tw-rounded-xl tw-outline-none focus:tw-border-indigo-500 tw-transition-all tw-text-white" 
                  placeholder="user@example.com" 
                />
              </div>
            </section>

            {/* Privileges & Roles */}
            <section className="tw-space-y-6">
              <h3 className="tw-text-xs tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-[0.2em] tw-flex tw-items-center tw-gap-4">
                <Key size={14} className="tw-text-amber-500" /> 시스템 운영 권한 할당
              </h3>
              <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                {[
                  { key: 'System Admin', label: '시스템 관리자' },
                  { key: 'Security Ops', label: '보안 운영자' },
                  { key: 'Support Pro', label: '기술 지원' },
                  { key: 'Standard Operator', label: '일반 운영자' }
                ].map(r => (
                   <button
                    key={r.key}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: r.key })}
                    className={`tw-p-5 tw-rounded-[24px] tw-border tw-text-xs tw-font-black tw-uppercase tw-tracking-widest tw-transition-all tw-text-left tw-flex tw-justify-between tw-items-center ${formData.role === r.key ? 'tw-bg-indigo-600 tw-border-indigo-500 tw-text-white tw-shadow-lg tw-shadow-indigo-500/20' : 'tw-bg-white/5 tw-border-white/5 tw-text-slate-500 hover:tw-border-white/20'}`}
                   >
                     {r.label}
                     {formData.role === r.key && <UserCircle size={14} />}
                   </button>
                ))}
              </div>
            </section>

            <div className="tw-p-6 tw-bg-indigo-500/10 tw-border tw-border-indigo-500/20 tw-rounded-2xl tw-flex tw-gap-6 tw-items-start shadow-inner">
               <div className="tw-w-10 tw-h-10 tw-bg-indigo-600 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shrink-0 tw-shadow-lg tw-shadow-indigo-500/20">
                <ShieldCheck size={20} className="tw-text-white" />
              </div>
              <div className="tw-flex tw-flex-col tw-gap-1">
                <span className="tw-text-xs tw-font-black tw-text-white tw-uppercase tw-tracking-widest">IAM 정책 준수 여부 확인됨</span>
                <p className="tw-text-xs tw-text-indigo-200/60 tw-leading-relaxed tw-font-medium">
                   사용자 계정 생성 시 시스템 운영을 위한 자동 프로비저닝이 실행되며, 모든 권한 변경 내역은 감사용으로 기록됩니다.
                </p>
              </div>
            </div>
          </div>

          <div className="tw-p-8 tw-bg-black/50 tw-border-t tw-border-white/5 tw-flex tw-justify-end tw-gap-4">
            <button type="button" className="tw-py-3.5 tw-px-10 tw-bg-white/5 hover:tw-bg-white/10 tw-text-slate-300 hover:tw-text-white tw-rounded-xl tw-font-bold tw-text-sm tw-transition-all tw-border tw-border-white/5" onClick={onClose}>취소</button>
            <button type="submit" className="tw-py-3.5 tw-px-12 tw-bg-indigo-600 hover:tw-bg-indigo-500 tw-text-white tw-font-bold tw-text-sm tw-rounded-xl tw-shadow-2xl tw-shadow-indigo-600/40 tw-transition-all tw-transform hover:tw--translate-y-1 active:tw-translate-y-0">
              {user ? '수정 완료' : '등록 완료'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default OperatorUserForm;
