import React from 'react';
import { Target, X, Info, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface OperatorTeamDetailProps {
  team: any;
  onClose: () => void;
}

const OperatorTeamDetail: React.FC<OperatorTeamDetailProps> = ({ team, onClose }) => {
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
              <Target size={32} className="tw-text-white" />
            </div>
            <div className="tw-flex tw-flex-col">
              <span className="tw-text-3xl tw-line-height-none">운영팀 상세 정보</span>
              <span className="tw-text-xs tw-text-indigo-400 tw-font-bold tw-uppercase tw-tracking-[0.2em] tw-mt-1">운영 조직 핵심 프로필</span>
            </div>
          </h2>
          <button onClick={onClose} className="tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-white/5 hover:tw-bg-white/10 tw-rounded-full tw-text-slate-400 hover:tw-text-white tw-transition-all tw-border tw-border-white/5"><X size={24} /></button>
        </div>

        {/* Content */}
        <div className="tw-p-12 tw-space-y-12 tw-overflow-y-auto tw-max-h-[60vh]">
          <div className="tw-space-y-8">
            <div className="tw-space-y-3">
              <label className="tw-text-[11px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest tw-ml-1">운영팀 명칭</label>
              <div className="tw-text-4xl tw-font-black tw-text-white tw-tracking-tight">{team.name}</div>
            </div>

            <div className="tw-space-y-3">
              <label className="tw-text-[11px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-widest tw-ml-1 tw-flex tw-items-center tw-gap-2">
                <Info size={12} className="tw-text-indigo-500" /> 운영팀 설명
              </label>
              <div className="tw-bg-white/5 tw-p-8 tw-rounded-[32px] tw-border tw-border-white/5 tw-text-slate-300 tw-leading-relaxed tw-font-medium tw-text-lg shadow-inner italic">
                 "{team.description || '이 운영팀에 대해 정의된 설명이 없습니다.'}"
              </div>
            </div>
          </div>

          <div className="tw-grid tw-grid-cols-2 tw-gap-6">
            <div className="tw-p-6 tw-bg-white/5 tw-rounded-[32px] tw-border tw-border-white/5 tw-space-y-1">
              <div className="tw-text-[10px] tw-text-slate-500 tw-font-bold tw-uppercase tw-tracking-widest">소속 운영사</div>
              <div className="tw-text-white tw-font-bold tw-truncate">{team.operatorCompanyName}</div>
            </div>
            <div className="tw-p-6 tw-bg-white/5 tw-rounded-[32px] tw-border tw-border-white/5 tw-space-y-1">
              <div className="tw-text-[10px] tw-text-slate-500 tw-font-bold tw-uppercase tw-tracking-widest">조직 식별 ID</div>
              <div className="tw-text-indigo-400 tw-font-mono tw-font-bold">#UNIT-{team.id.toString().padStart(3, '0')}</div>
            </div>
          </div>

          <div className="tw-p-8 tw-bg-indigo-500/10 tw-border tw-border-indigo-500/20 tw-rounded-[32px] tw-flex tw-gap-6 tw-items-center">
            <div className="tw-w-12 tw-h-12 tw-bg-indigo-600 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-shrink-0 tw-shadow-lg tw-shadow-indigo-500/20 shadow-inner">
              <ShieldCheck size={24} className="tw-text-white" />
            </div>
            <div className="tw-flex tw-flex-col tw-gap-1">
              <span className="tw-text-xs tw-font-black tw-text-white tw-uppercase tw-tracking-widest">운영 상태 정상</span>
              <p className="tw-text-[10px] tw-text-indigo-200/60 tw-leading-relaxed tw-font-bold">
                이 운영팀은 현재 전략적 오케스트레이션 및 명령 에스컬레이션 권한을 보유하고 있습니다.
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

export default OperatorTeamDetail;
