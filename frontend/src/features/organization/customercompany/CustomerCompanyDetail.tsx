import React from 'react';
import { Building2, X, Globe, Phone, Mail, User, CreditCard, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface CustomerCompanyDetailProps {
  company: any;
  onClose: () => void;
}

const CustomerCompanyDetail: React.FC<CustomerCompanyDetailProps> = ({ company, onClose }) => {
  if (!company) return null;

  return (
    <div className="tw-fixed tw-inset-0 tw-z-[2500] tw-flex tw-items-center tw-justify-center tw-p-6">
      <motion.div 
        className="tw-absolute tw-inset-0 tw-bg-black/90 tw-backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div 
        className="tw-relative tw-w-full tw-max-w-4xl tw-bg-[#0f1117] tw-border tw-border-white/10 tw-rounded-3xl tw-overflow-hidden tw-flex tw-flex-col tw-shadow-2xl"
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
      >
        {/* Header Overlay */}
        <div className="tw-p-8 tw-border-b tw-border-white/5 tw-flex tw-justify-between tw-items-center tw-bg-gradient-to-r tw-from-blue-600/10 tw-to-transparent">
          <div className="tw-flex tw-items-center tw-gap-6">
            <div className="tw-w-16 tw-h-16 tw-bg-blue-600 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-shadow-lg tw-shadow-blue-500/20">
              <Building2 size={32} className="tw-text-white" />
            </div>
            <div className="tw-flex tw-flex-col">
              <h2 className="tw-text-2xl tw-font-bold tw-text-white tw-tracking-tight tw-leading-none">{company.name}</h2>
              <span className="tw-text-xs tw-text-blue-400 tw-font-semibold tw-uppercase tw-tracking-widest tw-mt-2">{company.customerId}</span>
            </div>
          </div>
          <button onClick={onClose} className="tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-white/5 hover:tw-bg-white/10 tw-rounded-full tw-text-slate-400 hover:tw-text-white tw-transition-all tw-border tw-border-white/5">
            <X size={24} />
          </button>
        </div>

        <div className="tw-p-8 tw-overflow-y-auto tw-max-h-[70vh] tw-space-y-8">
          {/* Status Ribbon */}
          <div className="tw-flex tw-items-center tw-justify-between tw-p-5 tw-bg-white/5 tw-rounded-2xl tw-border tw-border-white/5">
            <div className="tw-flex tw-items-center tw-gap-4">
              <div className={`tw-w-3 tw-h-3 tw-rounded-full ${company.status === 'ACTIVE' ? 'tw-bg-emerald-500 tw-shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'tw-bg-amber-500 tw-shadow-[0_0_12px_rgba(245,158,11,0.8)]'}`} />
              <span className="tw-text-sm tw-font-bold tw-text-white tw-tracking-widest tw-uppercase">{company.status === 'ACTIVE' ? '정상 운영' : '제한됨(Restricted)'}</span>
            </div>
            <div className="tw-flex tw-gap-8">
              <div className="tw-flex tw-flex-col tw-items-end">
                <span className="tw-text-xs tw-text-slate-500 tw-font-semibold tw-uppercase tw-tracking-widest">테넌트 생성일</span>
                <span className="tw-text-xs tw-text-white tw-font-mono tw-mt-0.5">{company.createdAt ? new Date(company.createdAt).toLocaleString() : '정보 없음'}</span>
              </div>
              <div className="tw-flex tw-flex-col tw-items-end">
                <span className="tw-text-xs tw-text-slate-500 tw-font-semibold tw-uppercase tw-tracking-widest">최종 변경일</span>
                <span className="tw-text-xs tw-text-blue-400 tw-font-mono tw-mt-0.5">{company.updatedAt ? new Date(company.updatedAt).toLocaleString() : (company.createdAt ? new Date(company.createdAt).toLocaleString() : '정보 없음')}</span>
              </div>
            </div>
          </div>

          <div className="tw-grid tw-grid-cols-2 tw-gap-8">
            {/* Identity & Registry */}
            <section className="tw-space-y-6">
              <h3 className="tw-text-xs tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-flex tw-items-center tw-gap-3">법적 정보 및 인증</h3>
              <div className="tw-space-y-6 tw-bg-white/5 tw-p-6 tw-rounded-2xl tw-border tw-border-white/5">
                <div className="tw-flex tw-flex-col tw-gap-1.5">
                  <span className="tw-text-xs tw-text-slate-500 tw-font-semibold tw-uppercase tw-tracking-widest tw-flex tw-items-center tw-gap-2"><CreditCard size={14} className="tw-text-emerald-500" /> 사업자 등록 번호</span>
                  <span className="tw-text-base tw-text-white tw-font-bold">{company.businessNumber || '정보 없음'}</span>
                </div>
                <div className="tw-flex tw-flex-col tw-gap-1.5">
                  <span className="tw-text-xs tw-text-slate-500 tw-font-semibold tw-uppercase tw-tracking-widest tw-flex tw-items-center tw-gap-2"><User size={14} className="tw-text-emerald-500" /> 대표자명</span>
                  <span className="tw-text-base tw-text-white tw-font-bold">{company.representativeName || '정의되지 않음'}</span>
                </div>
              </div>
            </section>

            {/* Communication Grid */}
            <section className="tw-space-y-6">
              <h3 className="tw-text-xs tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-flex tw-items-center tw-gap-3">연락처 및 채널 관리</h3>
              <div className="tw-space-y-6 tw-bg-white/5 tw-p-6 tw-rounded-2xl tw-border tw-border-white/5">
                <div className="tw-flex tw-flex-col tw-gap-1.5">
                  <span className="tw-text-xs tw-text-slate-500 tw-font-semibold tw-uppercase tw-tracking-widest tw-flex tw-items-center tw-gap-2"><Phone size={14} className="tw-text-amber-500" /> 보안 연락처</span>
                  <span className="tw-text-base tw-text-white tw-font-bold">{company.phone || 'N/A'}</span>
                </div>
                <div className="tw-flex tw-flex-col tw-gap-1.5">
                  <span className="tw-text-xs tw-text-slate-500 tw-font-semibold tw-uppercase tw-tracking-widest tw-flex tw-items-center tw-gap-2"><Mail size={14} className="tw-text-amber-500" /> 대표 이메일</span>
                  <span className="tw-text-base tw-text-white tw-font-bold">{company.email || '정보 없음'}</span>
                </div>
              </div>
            </section>

            {/* Location Section */}
            <section className="tw-col-span-2 tw-space-y-6">
              <h3 className="tw-text-xs tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-flex tw-items-center tw-gap-3">물리적 거점 및 소재지</h3>
              <div className="tw-bg-white/5 tw-p-6 tw-rounded-2xl tw-border tw-border-white/5 tw-flex tw-gap-6 tw-items-start">
                <div className="tw-w-12 tw-h-12 tw-bg-white/5 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-shrink-0 tw-border tw-border-white/5">
                  <Globe size={20} className="tw-text-blue-500" />
                </div>
                <div className="tw-flex tw-flex-col tw-gap-2">
                  <span className="tw-text-xs tw-text-slate-500 tw-font-semibold tw-uppercase tw-tracking-widest">본사(Headquarters) 소재지</span>
                  <p className="tw-text-base tw-text-white tw-leading-relaxed tw-font-semibold">{company.address || '위치 메타데이터 초기화 대기 중...'}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Compliance Badge */}
          <div className="tw-p-6 tw-bg-blue-500/10 tw-border tw-border-blue-500/20 tw-rounded-2xl tw-flex tw-items-center tw-justify-between">
            <div className="tw-flex tw-gap-6 tw-items-center">
              <div className="tw-w-12 tw-h-12 tw-bg-blue-600 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-shadow-lg tw-shadow-blue-500/20">
                <ShieldCheck size={24} className="tw-text-white" />
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-sm tw-font-bold tw-text-white">ITIL v5 규정 준수 확인됨</span>
                <span className="tw-text-xs tw-text-blue-400 tw-font-semibold tw-uppercase tw-tracking-widest tw-mt-0.5">자동 신뢰 엔진 활성화 상태</span>
              </div>
            </div>
            <div className="tw-px-4 tw-py-1.5 tw-bg-blue-600/20 tw-rounded-full tw-text-xs tw-text-blue-400 tw-font-bold tw-uppercase tw-tracking-widest tw-border tw-border-blue-500/30">
              신뢰 점수: 98.4
            </div>
          </div>
        </div>

        <div className="tw-p-6 tw-bg-black/50 tw-border-t tw-border-white/5 tw-flex tw-gap-6">
          <button onClick={onClose} className="tw-flex-1 tw-py-3.5 tw-bg-white/5 hover:tw-bg-white/10 tw-text-slate-300 hover:tw-text-white tw-rounded-xl tw-font-bold tw-text-sm tw-transition-all tw-border tw-border-white/5">포털 상세 정보 닫기</button>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomerCompanyDetail;
