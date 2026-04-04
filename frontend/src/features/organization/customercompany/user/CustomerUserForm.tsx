import React, { useState, useEffect } from 'react';
import { Users, X, ShieldCheck, Mail, Fingerprint, UserCircle, Key, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiCommonCode, type CommonCode } from '../../../code/api/apiCommonCode';

interface CustomerUserFormProps {
  onClose: () => void;
  user?: any;
  onSave?: (data: any) => void;
}

const CustomerUserForm: React.FC<CustomerUserFormProps> = ({ onClose, user, onSave }) => {
  const [roles, setRoles] = useState<CommonCode[]>([]);
  const [fetchingRoles, setFetchingRoles] = useState(true);
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    email: '',
    role: 'ROLE_CUS_USER',
    status: 'ACTIVE'
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await apiCommonCode.getCodesByGroup('CUS_ROLE');
        setRoles(response.data);
      } catch (err) {
        console.error('Failed to fetch CUS_ROLE codes', err);
      } finally {
        setFetchingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        userId: user.userId || '',
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'ROLE_CUS_USER',
        status: user.status || 'ACTIVE'
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
        className="tw-relative tw-w-full tw-max-w-2xl tw-bg-slate-900 tw-border tw-border-white/10 tw-rounded-[48px] tw-overflow-hidden tw-flex tw-flex-col tw-shadow-2xl"
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSubmit} className="tw-flex tw-flex-col tw-h-full">
          <div className="tw-p-10 tw-border-b tw-border-white/5 tw-flex tw-justify-between tw-items-center tw-bg-gradient-to-r tw-from-blue-600/10 tw-to-transparent">
            <h2 className="tw-text-4xl tw-font-black tw-flex tw-items-center tw-gap-6 tw-tracking-tighter tw-text-white">
              <div className="tw-w-16 tw-h-16 tw-bg-blue-600 tw-rounded-3xl tw-flex tw-items-center tw-justify-center tw-shadow-lg tw-shadow-blue-500/20">
                <Users size={32} className="tw-text-white" />
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-3xl tw-line-height-none">{user ? 'ID 정보 동기화' : '사용자 IAM 등록'}</span>
                <span className="tw-text-xs tw-text-blue-400 tw-font-bold tw-uppercase tw-tracking-[0.2em] tw-mt-1">사용자 권한 관리 허브</span>
              </div>
            </h2>
            <button type="button" onClick={onClose} className="tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-white/5 hover:tw-bg-white/10 tw-rounded-full tw-text-slate-400 hover:tw-text-white tw-transition-all tw-border tw-border-white/5"><X size={24} /></button>
          </div>

          <div className="tw-p-12 tw-space-y-10 tw-overflow-y-auto tw-max-h-[60vh]">
            {/* Identity Core */}
            <section className="tw-space-y-6">
              <h3 className="tw-text-xs tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-[0.2em] tw-flex tw-items-center tw-gap-4">
                <Fingerprint size={14} className="tw-text-blue-500" /> 기본 식별 정보 (Identity Core)
              </h3>
              <div className="tw-grid tw-grid-cols-2 tw-gap-6 tw-mt-4">
                <div className="tw-space-y-3">
                  <label className="tw-text-[11px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest tw-ml-1">로그인 식별 ID</label>
                  <input 
                    required type="text" value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="tw-w-full tw-bg-slate-800/50 tw-border tw-border-white/10 tw-p-5 tw-rounded-3xl tw-outline-none focus:tw-border-blue-500 tw-transition-all tw-text-white tw-font-mono" 
                    placeholder="예: itops_admin" 
                  />
                </div>
                <div className="tw-space-y-3">
                  <label className="tw-text-[11px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest tw-ml-1">사용자 성명 (Full Name)</label>
                  <input 
                    required type="text" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="tw-w-full tw-bg-slate-800/50 tw-border tw-border-white/10 tw-p-5 tw-rounded-3xl tw-outline-none focus:tw-border-blue-500 tw-transition-all tw-text-white tw-font-bold" 
                    placeholder="표시 성명을 입력하세요" 
                  />
                </div>
              </div>
              <div className="tw-space-y-3">
                <label className="tw-text-[11px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest tw-ml-1 tw-flex tw-items-center tw-gap-2">
                  <Mail size={12} className="tw-text-blue-500" /> 통신 채널 (IAM 이메일)
                </label>
                <input 
                  required type="email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="tw-w-full tw-bg-slate-800/50 tw-border tw-border-white/10 tw-p-5 tw-rounded-3xl tw-outline-none focus:tw-border-blue-500 tw-transition-all tw-text-white" 
                  placeholder="name@customer-domain.com" 
                />
              </div>
            </section>

            {/* Privileges & Roles */}
            <section className="tw-space-y-6">
              <h3 className="tw-text-xs tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-[0.2em] tw-flex tw-items-center tw-gap-4">
                <Key size={14} className="tw-text-amber-500" /> 거버넌스 기반 권한 할당 (Privileges)
              </h3>
              <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                {fetchingRoles ? (
                  <div className="tw-col-span-2 tw-flex tw-items-center tw-justify-center tw-py-8 tw-gap-3 tw-text-slate-500 tw-text-xs tw-font-bold tw-uppercase tw-tracking-widest">
                    <RefreshCw size={16} className="tw-animate-spin tw-text-blue-500" />
                    거버넌스 권한 동기화 중...
                  </div>
                ) : roles.length > 0 ? (
                  roles.map(r => (
                    <button
                      key={r.codeId}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r.codeId })}
                      className={`tw-p-5 tw-rounded-[24px] tw-border tw-text-xs tw-font-black tw-uppercase tw-tracking-widest tw-transition-all tw-text-left tw-flex tw-justify-between tw-items-center ${formData.role === r.codeId ? 'tw-bg-blue-600 tw-border-blue-500 tw-text-white tw-shadow-lg tw-shadow-blue-500/20' : 'tw-bg-white/5 tw-border-white/5 tw-text-slate-500 hover:tw-border-white/20'}`}
                    >
                      {r.codeName}
                      {formData.role === r.codeId && <UserCircle size={14} />}
                    </button>
                  ))
                ) : (
                  <div className="tw-col-span-2 tw-p-6 tw-bg-rose-500/10 tw-border tw-border-rose-500/20 tw-rounded-3xl tw-text-rose-400 tw-text-xs tw-font-bold tw-text-center">
                    역할 체계가 정의되지 않았습니다. (CUS_ROLE)
                  </div>
                )}
              </div>
            </section>

            <div className="tw-p-8 tw-bg-blue-500/10 tw-border tw-border-blue-500/20 tw-rounded-[32px] tw-flex tw-gap-6 tw-items-start shadow-inner">
               <div className="tw-w-10 tw-h-10 tw-bg-blue-600 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-shrink-0 tw-shadow-lg tw-shadow-blue-500/20">
                <ShieldCheck size={20} className="tw-text-white" />
              </div>
              <div className="tw-flex tw-flex-col tw-gap-1">
                <span className="tw-text-xs tw-font-black tw-text-white tw-uppercase tw-tracking-widest">IAM 정책 규정 준수 확인됨</span>
                <p className="tw-text-[10px] tw-text-blue-200/60 tw-leading-relaxed tw-font-bold">
                   이 식별 프로필 초기화 시 전략적 테넌트 내에 자동 프로비저닝이 트리거됩니다. <br />
                   권한 상승 로그는 감사 준수를 위해 아카이브됩니다.
                </p>
              </div>
            </div>
          </div>

          <div className="tw-p-12 tw-bg-black/50 tw-border-t tw-border-white/5 tw-flex tw-justify-end tw-gap-6">
            <button type="button" className="tw-py-5 tw-px-12 tw-bg-white/5 hover:tw-bg-white/10 tw-text-slate-400 hover:tw-text-white tw-rounded-[24px] tw-font-black tw-uppercase tw-tracking-widest tw-text-[11px] tw-transition-all tw-border tw-border-white/5" onClick={onClose}>설정 폐기</button>
            <button type="submit" className="tw-py-5 tw-px-20 tw-bg-blue-600 hover:tw-bg-blue-500 tw-text-white tw-font-black tw-uppercase tw-tracking-widest tw-text-[11px] tw-rounded-[24px] tw-shadow-2xl tw-shadow-blue-600/40 tw-transition-all tw-transform hover:tw--translate-y-1 active:tw-translate-y-0">
              {user ? '수정 완료' : '등록 완료'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CustomerUserForm;
