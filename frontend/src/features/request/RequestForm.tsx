import React, { useState, useEffect } from 'react';
import { X, Send, Plus, AlertCircle, Calendar, Hash, User, FileText, Shield, Info, Activity, Monitor } from 'lucide-react';
import requestApi from './api/requestApi';
import { apiCommonCode, type CommonCode } from '../code/api/apiCommonCode';
import RequestAttachments from './components/RequestAttachments';
import { useAuth } from '../auth/AuthProvider';

interface RequestFormProps {
  onClose: () => void;
}

const SECTION_TITLE_CLASS = "tw-text-[11px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-[0.1em] tw-mb-4 tw-flex tw-items-center tw-gap-2";
const INFO_BOX_CLASS = "tw-bg-obsidian-light/50 tw-border tw-border-white/5 tw-rounded-xl tw-p-3";
const LABEL_CLASS = "tw-text-[10px] tw-font-bold tw-text-slate-500 tw-uppercase tw-tracking-widest tw-mb-1 tw-block";

const RequestForm: React.FC<RequestFormProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    srTypeCode: '',
    srCategoryCode: '',
    srImpactCode: '',
    srUrgencyCode: '',
    srSourceCode: 'PORTAL', // Default to Portal
    ciId: '',
    expectedAt: '',
    companyId: user?.companyId || '',
    requesterId: user?.userId || ''
  });

  const [codes, setCodes] = useState<{
    types: CommonCode[];
    categories: CommonCode[];
    impacts: CommonCode[];
    urgencies: CommonCode[];
    sources: CommonCode[];
  }>({
    types: [],
    categories: [],
    impacts: [],
    urgencies: [],
    sources: []
  });

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const [types, categories, impacts, urgencies, sources] = await Promise.all([
          apiCommonCode.getCodesByGroup('SR_TYPE'),
          apiCommonCode.getCodesByGroup('SR_CATEGORY'),
          apiCommonCode.getCodesByGroup('SR_IMPACT'),
          apiCommonCode.getCodesByGroup('SR_URGENCY'),
          apiCommonCode.getCodesByGroup('SR_SOURCE')
        ]);

        setCodes({
          types: types.data,
          categories: categories.data,
          impacts: impacts.data,
          urgencies: urgencies.data,
          sources: sources.data
        });

        // Set Default Codes
        setFormData(prev => ({
          ...prev,
          srTypeCode: types.data[0]?.codeId || '',
          srCategoryCode: categories.data[0]?.codeId || '',
          srImpactCode: impacts.data[0]?.codeId || '',
          srUrgencyCode: urgencies.data[0]?.codeId || '',
          srSourceCode: sources.data.find(c => c.codeId === 'PORTAL')?.codeId || sources.data[0]?.codeId || 'PORTAL',
          companyId: user?.companyId || '',
          requesterId: user?.userId || ''
        }));
      } catch (err) {
        console.error('Failed to fetch common codes', err);
      }
    };

    fetchCodes();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    try {
      setLoading(true);
      const submissionData = {
        ...formData,
        expectedAt: formData.expectedAt ? `${formData.expectedAt}T23:59:59` : undefined,
        // Ensure requester and company are always set from the current session
        companyId: user?.companyId,
        requesterId: user?.userId
      };

      const res = await requestApi.createRequest(submissionData as any);
      const requestId = res.data.id;

      if (files.length > 0 && requestId) {
        for (const file of files) {
          await requestApi.uploadAttachment(requestId, file);
        }
      }

      onClose();
    } catch (err) {
      console.error('Failed to create request', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tw-fixed tw-inset-0 tw-z-[2000] tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-obsidian/80 tw-backdrop-blur-xl">
      <div className="tw-bg-obsidian tw-border tw-border-white/10 tw-rounded-3xl tw-w-full tw-max-w-5xl tw-h-[85vh] tw-overflow-hidden tw-flex tw-flex-col tw-shadow-[0_0_50px_rgba(0,0,0,0.5)] tw-animate-scale-in">
        
        {/* 🏔️ HEADER */}
        <div className="tw-px-8 tw-py-4 tw-border-b tw-border-white/5 tw-flex tw-items-center tw-justify-between tw-bg-white/[0.02]">
          <div className="tw-flex tw-items-center tw-gap-3">
             <div className="tw-bg-brand-600/20 tw-p-2 tw-rounded-xl">
                <Plus size={20} className="tw-text-brand-500" />
             </div>
             <div className="tw-flex tw-flex-col">
                <span className="tw-text-[9px] tw-text-brand-400 tw-font-black tw-uppercase tw-tracking-[0.2em]">Service Request Manager</span>
                <h2 className="tw-text-lg tw-font-bold tw-text-white">신규 서비스 요청 등록</h2>
             </div>
          </div>
          <button onClick={onClose} className="tw-p-2 tw-rounded-xl hover:tw-bg-white/5 tw-text-slate-500 hover:tw-text-white tw-transition-all">
            <X size={24} />
          </button>
        </div>

        {/* 🕹️ WORKSPACE */}
        <div className="tw-flex-1 tw-overflow-hidden tw-flex">
          
          <form id="requestForm" onSubmit={handleSubmit} className="tw-flex-1 tw-overflow-y-auto tw-p-8 tw-custom-scrollbar tw-flex tw-flex-col tw-gap-8">
            <section>
                <h3 className={SECTION_TITLE_CLASS}><FileText size={14} /> 요청 상세 정보</h3>
                <div className="tw-space-y-5">
                    <div>
                        <label className={LABEL_CLASS}>요청 제목 (필수)</label>
                        <input 
                            type="text"
                            placeholder="요약된 요청 내용을 입력하세요..."
                            className="tw-input tw-w-full !tw-py-2.5 tw-text-base tw-font-bold tw-bg-white/[0.03]"
                            value={formData.title}
                            onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                            required
                        />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>상세 설명 (필수)</label>
                        <textarea 
                            placeholder="처리자가 명시적으로 이해할 수 있도록 구체적인 요청 사항을 적어주세요..."
                            className="tw-input tw-w-full tw-min-h-[220px] tw-resize-none !tw-py-3 tw-text-sm tw-leading-relaxed tw-bg-white/[0.02]"
                            value={formData.description}
                            onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                            required
                        />
                    </div>
                </div>
            </section>

            <section>
                <h3 className={SECTION_TITLE_CLASS}><Hash size={14} /> 첨부 파일</h3>
                <RequestAttachments 
                    pendingFiles={files}
                    onUpload={(file) => setFiles(prev => [...prev, file])}
                    onRemovePending={(idx) => setFiles(prev => prev.filter((_, i) => i !== idx))}
                    canEdit={true}
                />
            </section>
          </form>

          {/* SIDEBAR */}
          <div className="tw-w-[320px] tw-border-l tw-border-white/5 tw-bg-white/[0.01] tw-overflow-y-auto tw-p-6 tw-flex tw-flex-col tw-gap-6 tw-custom-scrollbar">
            
            <section>
                <h3 className={SECTION_TITLE_CLASS}><Shield size={14} /> 서비스 분류 (코드 데이터)</h3>
                <div className="tw-flex tw-flex-col tw-gap-2">
                    <div className={INFO_BOX_CLASS}>
                        <label className={LABEL_CLASS}>요청 유형</label>
                        <select className="tw-input tw-w-full tw-text-xs tw-bg-obsidian !tw-py-0.5" value={formData.srTypeCode} onChange={e => setFormData(f => ({ ...f, srTypeCode: e.target.value }))}>
                            {codes.types.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                        </select>
                    </div>
                    <div className={INFO_BOX_CLASS}>
                        <label className={LABEL_CLASS}>서비스 카테고리</label>
                        <select className="tw-input tw-w-full tw-text-xs tw-bg-obsidian !tw-py-0.5" value={formData.srCategoryCode} onChange={e => setFormData(f => ({ ...f, srCategoryCode: e.target.value }))}>
                            {codes.categories.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                        </select>
                    </div>
                    <div className={INFO_BOX_CLASS}>
                        <label className={LABEL_CLASS}>유입 경로 (Source)</label>
                        <select className="tw-input tw-w-full tw-text-xs tw-bg-obsidian !tw-py-0.5" value={formData.srSourceCode} onChange={e => setFormData(f => ({ ...f, srSourceCode: e.target.value }))}>
                            {codes.sources.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                        </select>
                    </div>
                    <div className="tw-grid tw-grid-cols-2 tw-gap-2">
                        <div className={INFO_BOX_CLASS}>
                            <label className={LABEL_CLASS}>영향도</label>
                            <select className="tw-input tw-w-full tw-text-xs tw-bg-obsidian !tw-py-0.5" value={formData.srImpactCode} onChange={e => setFormData(f => ({ ...f, srImpactCode: e.target.value }))}>
                                {codes.impacts.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                            </select>
                        </div>
                        <div className={INFO_BOX_CLASS}>
                            <label className={LABEL_CLASS}>긴급도</label>
                            <select className="tw-input tw-w-full tw-text-xs tw-bg-obsidian !tw-py-0.5" value={formData.srUrgencyCode} onChange={e => setFormData(f => ({ ...f, srUrgencyCode: e.target.value }))}>
                                {codes.urgencies.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h3 className={SECTION_TITLE_CLASS}><Calendar size={14} /> 대상 시스템 및 일정</h3>
                <div className="tw-flex tw-flex-col tw-gap-2">
                    <div className={INFO_BOX_CLASS}>
                        <label className={LABEL_CLASS}>대상 시스템 (CI)</label>
                        <div className="tw-relative">
                            <Info size={12} className="tw-absolute tw-left-2.5 tw-top-1/2 tw--translate-y-1/2 tw-text-slate-500" />
                            <input type="text" placeholder="시스템/자산명..." className="tw-input tw-w-full tw-pl-8 tw-text-xs tw-bg-obsidian !tw-py-0.5" value={formData.ciId} onChange={e => setFormData(f => ({ ...f, ciId: e.target.value }))} />
                        </div>
                    </div>
                    <div className={INFO_BOX_CLASS}>
                        <label className={LABEL_CLASS}>희망 완료일</label>
                        <div className="tw-relative">
                            <Calendar size={12} className="tw-absolute tw-left-2.5 tw-top-1/2 tw--translate-y-1/2 tw-text-slate-500" />
                            <input type="date" className="tw-input tw-w-full tw-pl-8 tw-text-xs tw-bg-obsidian !tw-py-0.5" value={formData.expectedAt} onChange={e => setFormData(f => ({ ...f, expectedAt: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h3 className={SECTION_TITLE_CLASS}><User size={14} /> 신청자 정보 (자동 설정)</h3>
                <div className="tw-bg-brand-500/5 tw-border tw-border-brand-500/10 tw-rounded-2xl tw-p-4 tw-space-y-2">
                    <div className="tw-flex tw-justify-between">
                        <span className="tw-text-[10px] tw-text-slate-500 tw-font-bold">고객사</span>
                        <span className="tw-text-xs tw-text-brand-400 tw-font-bold">{user?.companyName}</span>
                    </div>
                    <div className="tw-flex tw-justify-between">
                        <span className="tw-text-[10px] tw-text-slate-500 tw-font-bold">신청인</span>
                        <span className="tw-text-xs tw-text-slate-200">{user?.name} ({user?.userId})</span>
                    </div>
                </div>
            </section>

            <div className="tw-mt-auto tw-p-4 tw-bg-emerald-500/5 tw-border tw-border-emerald-500/10 tw-rounded-2xl">
                <div className="tw-flex tw-items-center tw-gap-2 tw-text-emerald-500 tw-mb-2">
                    <Monitor size={14} />
                    <span className="tw-text-[10px] tw-font-black tw-uppercase">Processing Info</span>
                </div>
                <p className="tw-text-[11px] tw-text-slate-500 tw-leading-relaxed">
                   입력하신 정보는 ITIL v5 프로세스에 따라 분석되며, 우선순위에 맞는 SLA가 자동으로 할당됩니다.
                </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="tw-px-8 tw-py-4 tw-border-t tw-border-white/5 tw-flex tw-items-center tw-justify-between tw-bg-white/[0.02]">
          <div className="tw-text-[10px] tw-text-slate-500 italic">
            * '서비스 요청 등록' 클릭 시 프로세스가 즉시 시작됩니다.
          </div>
          <div className="tw-flex tw-gap-3">
             <button type="button" onClick={onClose} className="tw-px-6 tw-py-2 tw-rounded-xl tw-text-xs tw-font-bold tw-text-slate-400 hover:tw-text-white tw-transition-all">취소</button>
             <button form="requestForm" type="submit" disabled={loading} className="tw-bg-brand-600 hover:tw-bg-brand-500 tw-text-white tw-px-10 tw-py-2 tw-rounded-xl tw-text-xs tw-font-black tw-uppercase tw-tracking-widest tw-transition-all tw-flex tw-items-center tw-gap-2 tw-shadow-lg tw-shadow-brand-600/20 disabled:tw-opacity-50">
                {loading ? <div className="tw-animate-spin tw-rounded-full tw-h-4 tw-w-4 tw-border-b-2 tw-border-white"></div> : <Send size={16} />}
                서비스 요청 등록 실행
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestForm;
