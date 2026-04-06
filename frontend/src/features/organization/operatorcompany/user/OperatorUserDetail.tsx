import React, { useState, useEffect } from 'react';
import { Fingerprint, X, Mail, ShieldCheck, UserCircle, Key, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiCommonCode, type CommonCode } from '../../../code/api/apiCommonCode';

interface OperatorUserDetailProps {
  user: any;
  onClose: () => void;
}

const OperatorUserDetail: React.FC<OperatorUserDetailProps> = ({ user, onClose }) => {
  const [roles, setRoles] = useState<CommonCode[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await apiCommonCode.getCodesByGroup('OPE_ROLE');
        setRoles(response.data);
      } catch (err) {
        console.error('Failed to fetch OPE_ROLE for detail view', err);
      } finally {
        setFetching(false);
      }
    };
    fetchRoles();
  }, []);

  const getRoleName = (roleId: string) => {
    const found = roles.find(r => r.codeId === roleId);
    return found ? found.codeName : roleId; // 찾지 못하면 ID 그대로 표시
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
        {/* Header */}
        <div className="tw-p-10 tw-border-b tw-border-white/5 tw-flex tw-justify-between tw-items-center tw-bg-gradient-to-r tw-from-indigo-600/10 tw-to-transparent">
          <h2 className="tw-text-4xl tw-font-black tw-flex tw-items-center tw-gap-6 tw-tracking-tighter tw-text-white">
            <div className="tw-w-16 tw-h-16 tw-bg-indigo-600 tw-rounded-3xl tw-flex tw-items-center tw-justify-center tw-shadow-lg tw-shadow-indigo-500/20">
              <UserCircle size={32} className="tw-text-white" />
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-3xl tw-line-height-none">사용자 상세 프로필</span>
              <span className="tw-text-xs tw-text-indigo-400 tw-font-bold tw-uppercase tw-tracking-[0.2em] tw-mt-1">사용자 식별 정보</span>
            </div>
          </h2>
          <button onClick={onClose} className="tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-white/5 hover:tw-bg-white/10 tw-rounded-full tw-text-slate-400 hover:tw-text-white tw-transition-all tw-border tw-border-white/5"><X size={24} /></button>
        </div>

        {/* Content */}
        <div className="tw-p-12 tw-space-y-12 tw-overflow-y-auto tw-max-h-[60vh]">
          <div className="tw-flex tw-items-center tw-gap-8">
            <div className="tw-w-32 tw-h-32 tw-rounded-[40px] tw-bg-gradient-to-br tw-from-indigo-500 tw-to-indigo-700 tw-flex tw-items-center tw-justify-center tw-text-white tw-text-4xl tw-font-black tw-shadow-2xl tw-shadow-indigo-500/30">
              {user.name?.substring(0, 1) || 'U'}
            </div>
            <div className="tw-space-y-2">
               <div className="tw-flex tw-items-center tw-gap-3">
                 <span className="tw-bg-indigo-500/20 tw-text-indigo-400 tw-px-4 tw-py-1 tw-rounded-full tw-text-[9px] tw-font-black tw-uppercase tw-tracking-widest tw-border tw-border-indigo-500/30">운영자</span>
                 <span className={`tw-px-4 tw-py-1 tw-rounded-full tw-text-[9px] tw-font-black tw-uppercase tw-tracking-widest tw-border ${user.isActive ? 'tw-bg-emerald-500/20 tw-text-emerald-400 tw-border-emerald-500/30' : 'tw-bg-rose-500/20 tw-text-rose-400 tw-border-rose-500/30'}`}>
                   {user.isActive ? '활성' : '정지됨'}
                 </span>
               </div>
               <h1 className="tw-text-4xl tw-font-black tw-text-white tw-tracking-tight">{user.name}</h1>
               <p className="tw-text-slate-400 tw-font-medium tw-flex tw-items-center tw-gap-2">
                 <Mail size={14} className="tw-text-indigo-500" /> {user.email}
               </p>
            </div>
          </div>

          <div className="tw-grid tw-grid-cols-2 tw-gap-8">
            <div className="tw-bg-white/5 tw-p-8 tw-rounded-[40px] tw-border tw-border-white/5 tw-space-y-6 shadow-inner">
              <div className="tw-flex tw-items-center tw-gap-4 tw-text-indigo-400">
                <Fingerprint size={24} />
                <span className="tw-text-[11px] tw-font-black tw-uppercase tw-tracking-widest">계정 인증 정보</span>
              </div>
              <div>
                <div className="tw-text-[10px] tw-text-slate-500 tw-font-bold tw-uppercase tw-mb-1">로그인 ID</div>
                <div className="tw-text-2xl tw-text-white tw-font-mono">{user.userId}</div>
              </div>
            </div>

            <div className="tw-bg-white/5 tw-p-8 tw-rounded-[40px] tw-border tw-border-white/5 tw-space-y-6 shadow-inner">
              <div className="tw-flex tw-items-center tw-gap-4 tw-text-amber-400">
                <Key size={24} />
                <span className="tw-text-[11px] tw-font-black tw-uppercase tw-tracking-widest">권한 매트릭스</span>
              </div>
              <div>
                <div className="tw-text-[10px] tw-text-slate-500 tw-font-bold tw-uppercase tw-mb-1">시스템 운영 역할</div>
                <div className="tw-text-2xl tw-text-white tw-font-bold">
                  {fetching ? (
                    <RefreshCw size={18} className="tw-animate-spin tw-text-slate-600" />
                  ) : (
                    getRoleName(user.role)
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="tw-p-8 tw-bg-indigo-500/10 tw-border tw-border-indigo-500/20 tw-rounded-[32px] tw-flex tw-gap-6 tw-items-center">
            <div className="tw-w-12 tw-h-12 tw-bg-indigo-600 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-shrink-0 tw-shadow-lg tw-shadow-indigo-500/20 shadow-inner">
              <ShieldCheck size={24} className="tw-text-white" />
            </div>
            <div className="tw-flex tw-flex-col tw-gap-1">
              <span className="tw-text-xs tw-font-black tw-text-white tw-uppercase tw-tracking-widest">운영 권한 확인됨</span>
              <p className="tw-text-[10px] tw-text-indigo-200/60 tw-leading-relaxed tw-font-bold">
                이 사용자 프로필은 현재 시스템 운영 레이어 내에서의 전역 오케스트레이션 권한을 보유하고 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="tw-p-10 tw-bg-black/50 tw-border-t tw-border-white/5 tw-flex tw-justify-end">
          <button onClick={onClose} className="tw-py-4 tw-px-12 tw-bg-white/5 hover:tw-bg-white/10 tw-text-slate-400 hover:tw-text-white tw-rounded-[20px] tw-font-black tw-uppercase tw-tracking-widest tw-text-[11px] tw-transition-all tw-border tw-border-white/5">닫기</button>
        </div>
      </motion.div>
    </div>
  );
};

export default OperatorUserDetail;
