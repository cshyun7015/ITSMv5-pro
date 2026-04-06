import React from 'react';
import { ShieldCheck, X, Activity, Globe, Scale, Clock, Building } from 'lucide-react';
import { motion } from 'framer-motion';

interface OperatorCompanyDetailProps {
  company: any;
  onClose: () => void;
}

const OperatorCompanyDetail: React.FC<OperatorCompanyDetailProps> = ({ company, onClose }) => {
  return (
    <div className="tw-fixed tw-inset-0 tw-z-[2500] tw-flex tw-items-center tw-justify-center tw-p-6">
      <motion.div 
        className="tw-absolute tw-inset-0 tw-bg-black/95 tw-backdrop-blur-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div 
        className="tw-relative tw-w-full tw-max-w-5xl tw-bg-slate-900 tw-border tw-border-white/10 tw-rounded-3xl tw-overflow-hidden tw-flex tw-flex-col tw-shadow-2xl"
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
      >
        {/* Detail Header */}
        <div className="tw-p-10 tw-pb-16 tw-bg-gradient-to-br tw-from-indigo-600/20 tw-via-transparent tw-to-transparent tw-relative tw-overflow-hidden">
          <div className="tw-absolute tw-top-[-10%] tw-right-[-5%] tw-w-[400px] tw-h-[400px] tw-bg-indigo-500/10 tw-rounded-full tw-blur-[100px]" />
          
          <div className="tw-flex tw-justify-between tw-items-start tw-relative tw-z-10">
            <div className="tw-flex tw-items-center tw-gap-10">
              <div className="tw-w-32 tw-h-32 tw-bg-indigo-600 tw-rounded-[40px] tw-flex tw-items-center tw-justify-center tw-shadow-2xl tw-shadow-indigo-500/40 tw-rotate-3">
                <Building size={64} className="tw-text-white" />
              </div>
              <div className="tw-space-y-4">
                <div className="tw-flex tw-items-center tw-gap-4">
                <span className="tw-bg-indigo-500/20 tw-text-indigo-400 tw-px-4 tw-py-1.5 tw-rounded-full tw-text-xs tw-font-bold tw-uppercase tw-tracking-widest tw-border tw-border-indigo-500/30">운영 조직</span>
                <span className={`tw-px-4 tw-py-1.5 tw-rounded-full tw-text-xs tw-font-bold tw-uppercase tw-tracking-widest tw-border ${company.status === 'ACTIVE' ? 'tw-bg-emerald-500/20 tw-text-emerald-400 tw-border-emerald-500/30' : 'tw-bg-rose-500/20 tw-text-rose-400 tw-border-rose-500/30'}`}>
                    {company.status === 'ACTIVE' ? '활성' : '비활성'} 상태
                  </span>
                </div>
                <h1 className="tw-text-7xl tw-font-black tw-text-white tw-tracking-tightest tw-leading-none">
                  {company.name}
                </h1>
                <p className="tw-text-lg tw-text-slate-400 tw-font-medium tw-max-w-2xl tw-leading-relaxed">
                  {company.representativeName || '지정된 대표자'}가 관리하는 전략적 운영 조직입니다.<br />
                  ITIL v5 표준에 따라 운영 무결성이 유지됩니다.
                </p>
              </div>
            </div>
            <button onClick={onClose} className="tw-w-16 tw-h-16 tw-flex tw-items-center tw-justify-center tw-bg-white/5 hover:tw-bg-white/10 tw-rounded-full tw-text-slate-400 hover:tw-text-white tw-transition-all tw-border tw-border-white/5"><X size={32} /></button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="tw-p-10 tw-pt-0 tw-grid tw-grid-cols-3 tw-gap-8 tw-relative tw-z-10">
          <div className="tw-col-span-2 tw-grid tw-grid-cols-2 tw-gap-8">
            <div className="tw-bg-white/5 tw-p-8 tw-rounded-3xl tw-border tw-border-white/5 tw-space-y-6 hover:tw-bg-white/10 tw-transition-all">
              <div className="tw-flex tw-items-center tw-gap-4 tw-text-indigo-400">
                <Globe size={24} />
                <span className="tw-text-xs tw-font-bold tw-uppercase tw-tracking-widest">기본 정보</span>
              </div>
              <div className="tw-space-y-4">
                <div>
                  <div className="tw-text-xs tw-text-slate-500 tw-font-semibold tw-uppercase tw-mb-1">MSP ID</div>
                  <div className="tw-text-2xl tw-text-white tw-font-mono">{company.operatorCompanyId}</div>
                </div>
                <div>
                  <div className="tw-text-xs tw-text-slate-500 tw-font-semibold tw-uppercase tw-mb-1">대표자명</div>
                  <div className="tw-text-2xl tw-text-white tw-font-bold">{company.representativeName || '미지정'}</div>
                </div>
                <div>
                  <div className="tw-text-xs tw-text-slate-500 tw-font-semibold tw-uppercase tw-mb-1">사업자 등록 번호</div>
                  <div className="tw-text-2xl tw-text-white tw-font-bold">{company.businessNumber || '비공개'}</div>
                </div>
              </div>
            </div>

            <div className="tw-bg-white/5 tw-p-8 tw-rounded-3xl tw-border tw-border-white/5 tw-space-y-6 hover:tw-bg-white/10 tw-transition-all">
              <div className="tw-flex tw-items-center tw-gap-4 tw-text-amber-400">
                <Activity size={24} />
                <span className="tw-text-xs tw-font-bold tw-uppercase tw-tracking-widest">운영 및 품질 상태</span>
              </div>
              <div className="tw-space-y-4">
                <div>
                  <div className="tw-text-xs tw-text-slate-500 tw-font-semibold tw-uppercase tw-mb-1">운영 상태</div>
                  <div className={`tw-text-2xl tw-font-black ${company.status === 'ACTIVE' ? 'tw-text-emerald-400' : 'tw-text-rose-400'}`}>
                    {company.status === 'ACTIVE' ? '정상 운영 (ACTIVE)' : '운영 중지 (INACTIVE)'}
                  </div>
                </div>
                <div>
                  <div className="tw-text-xs tw-text-slate-500 tw-font-semibold tw-uppercase tw-mb-1">서비스 수준 (SLA) 등급</div>
                  <div className="tw-text-2xl tw-text-amber-400 tw-font-black">플래티넘 (PLATINUM)</div>
                </div>
              </div>
            </div>

            <div className="tw-col-span-2 tw-bg-white/5 tw-p-8 tw-rounded-3xl tw-border tw-border-white/5 hover:tw-bg-white/10 tw-transition-all">
              <div className="tw-flex tw-items-center tw-gap-6">
                <div className="tw-w-20 tw-h-20 tw-bg-slate-800/50 tw-rounded-3xl tw-flex tw-items-center tw-justify-center tw-text-indigo-400 tw-border tw-border-white/5">
                  <Scale size={32} />
                </div>
                <div className="tw-space-y-2">
                  <span className="tw-text-xs tw-font-bold tw-text-slate-500 tw-uppercase tw-tracking-widest">운영 권한 및 규정 준수</span>
                  <p className="tw-text-white tw-text-base tw-font-medium tw-leading-relaxed">
                    이 MSP(운영사)는 연합 시스템의 자원 관리 및 서비스 운영에 대한 정식 권한을 보유하고 있으며,<br />
                    IT 서비스 관리 국제 표준(ISO/IEC 20000)을 준수합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline / Meta */}
          <div className="tw-bg-black/40 tw-rounded-3xl tw-p-8 tw-border tw-border-white/5 tw-space-y-8 shadow-inner">
            <h3 className="tw-text-xs tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-[0.3em]">거버넌스 감사 정보</h3>
            
            <div className="tw-space-y-10">
              <div className="tw-flex tw-gap-6">
                <div className="tw-w-1 tw-h-12 tw-bg-indigo-500 tw-rounded-full" />
                <div className="tw-space-y-1">
                   <div className="tw-text-xs tw-text-slate-500 tw-font-semibold tw-uppercase tw-flex tw-items-center tw-gap-2"><Clock size={12} /> 초기 등록 일자</div>
                   <div className="tw-text-white tw-font-bold">{company.createdAt ? new Date(company.createdAt).toLocaleDateString('ko-KR') : '2024.11.23'}</div>
                </div>
              </div>
              <div className="tw-flex tw-gap-6">
                <div className="tw-w-1 tw-h-12 tw-bg-emerald-500 tw-rounded-full" />
                <div className="tw-space-y-1">
                   <div className="tw-text-xs tw-text-slate-500 tw-font-semibold tw-uppercase tw-flex tw-items-center tw-gap-2"><ShieldCheck size={12} /> 컴플라이언스 수준</div>
                    <div className="tw-text-white tw-font-bold">L3 - 통합 최적화 수준</div>
                </div>
              </div>
            </div>

             <div className="tw-mt-12 tw-p-8 tw-bg-indigo-500/10 tw-rounded-3xl tw-border tw-border-indigo-500/20">
               <p className="tw-text-xs tw-text-indigo-300 tw-leading-relaxed tw-font-bold tw-italic uppercase tracking-widest">
                 "표준화된 운영 프로세스는 지속 가능한 거버넌스의 핵심입니다."
               </p>
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="tw-p-8 tw-bg-black/50 tw-border-t tw-border-white/5 tw-flex tw-justify-end">
          <button onClick={onClose} className="tw-py-4 tw-px-10 tw-bg-white/5 hover:tw-bg-white/10 tw-text-white tw-rounded-xl tw-font-bold tw-text-sm tw-transition-all tw-border tw-border-white/5 shadow-lg shadow-black/20">확인 및 닫기</button>
        </div>
      </motion.div>
    </div>
  );
};

export default OperatorCompanyDetail;
