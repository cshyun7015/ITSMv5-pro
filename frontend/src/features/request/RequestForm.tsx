import React, { useState, useEffect } from 'react';
import { X, Send, Plus, AlertCircle, Calendar, Hash, User } from 'lucide-react';
import requestApi from './api/requestApi';
import { apiCommonCode, type CommonCode } from '../../api/apiCommonCode';
import RequestAttachments from './components/RequestAttachments';
import { useAuth } from '../auth/AuthProvider';

interface RequestFormProps {
  onClose: () => void;
}

const LABEL_CLASS = "tw-text-[12px] tw-font-bold tw-text-slate-500 tw-uppercase tw-tracking-wider tw-whitespace-nowrap tw-shrink-0 tw-w-32";

const RequestForm: React.FC<RequestFormProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    srTypeCode: '',
    srCategoryCode: '',
    srImpactCode: '',
    srUrgencyCode: '',
    ciId: '',
    expectedAt: '',
    companyId: user?.companyId || '',
    requesterId: user?.userId || '',
    srSourceCode: 'PORTAL'
  });

  const [codes, setCodes] = useState<{
    types: CommonCode[];
    categories: CommonCode[];
    impacts: CommonCode[];
    urgencies: CommonCode[];
  }>({
    types: [],
    categories: [],
    impacts: [],
    urgencies: []
  });

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const [types, categories, impacts, urgencies] = await Promise.all([
          apiCommonCode.getCodesByGroup('SR_TYPE'),
          apiCommonCode.getCodesByGroup('SR_CATEGORY'),
          apiCommonCode.getCodesByGroup('SR_IMPACT'),
          apiCommonCode.getCodesByGroup('SR_URGENCY')
        ]);

        setCodes({
          types: types.data,
          categories: categories.data,
          impacts: impacts.data,
          urgencies: urgencies.data
        });

        // Set defaults
        setFormData(prev => ({
          ...prev,
          srTypeCode: types.data[0]?.codeId || '',
          srCategoryCode: categories.data[0]?.codeId || '',
          srImpactCode: impacts.data[0]?.codeId || '',
          srUrgencyCode: urgencies.data[0]?.codeId || '',
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
      // Format date for backend LocalDateTime (ISO-8601)
      const submissionData = {
        ...formData,
        expectedAt: formData.expectedAt ? `${formData.expectedAt}T23:59:59` : undefined
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
    <div className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-obsidian/80 tw-backdrop-blur-md">
      <div className="tw-bg-obsidian tw-border tw-border-slate-800 tw-rounded-2xl tw-w-full tw-max-w-5xl tw-h-fit tw-max-h-[90vh] tw-overflow-hidden tw-flex tw-flex-col tw-shadow-2xl tw-animate-slide-up">
        
        {/* Modal Header */}
        <div className="tw-p-6 tw-border-b tw-border-slate-800 tw-flex tw-items-center tw-justify-between tw-bg-slate-800/30">
          <div className="tw-flex tw-items-center tw-gap-3">
             <div className="tw-bg-brand-600/20 tw-p-2 tw-rounded-lg">
                <Plus size={20} className="tw-text-brand-500" />
             </div>
             <h2 className="tw-text-xl tw-font-bold tw-text-white">신규 서비스 요청 등록</h2>
          </div>
          <button 
            onClick={onClose}
            className="tw-p-2 tw-rounded-lg hover:tw-bg-slate-700 tw-text-slate-400 tw-transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="tw-flex-1 tw-overflow-y-auto tw-p-8 tw-custom-scrollbar">
          <div className="tw-grid tw-grid-cols-12 tw-gap-10">
            
            {/* Left: General Info (7 cols) */}
            <div className="tw-col-span-12 lg:tw-col-span-7 tw-flex tw-flex-col tw-gap-8">
               <div>
                <label className="tw-text-[13px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block tw-uppercase tw-tracking-wider">요청 제목</label>
                <input 
                  type="text"
                  placeholder="요청 내용의 요약을 입력하세요..."
                  className="tw-input tw-w-full tw-text-lg tw-py-3"
                  value={formData.title}
                  onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
               <div>
                <label className="tw-text-[13px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block tw-uppercase tw-tracking-wider">상세 내용</label>
                <textarea 
                  placeholder="처리자가 이해할 수 있도록 상세 내용을 입력해 주세요..."
                  className="tw-input tw-w-full tw-min-h-[200px] tw-resize-none tw-py-3"
                  value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  required
                />
              </div>

               <div>
                <label className="tw-text-[13px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block tw-uppercase tw-tracking-wider">첨부 파일</label>
                <RequestAttachments 
                   pendingFiles={files}
                   onUpload={(file) => setFiles(prev => [...prev, file])}
                   onRemovePending={(idx) => setFiles(prev => prev.filter((_, i) => i !== idx))}
                   canEdit={true}
                />
              </div>
            </div>

            {/* Right: Categorization & Additional (5 cols) */}
            <div className="tw-col-span-12 lg:tw-col-span-5 tw-bg-slate-900/40 tw-p-8 tw-rounded-2xl tw-flex tw-flex-col tw-gap-6 tw-border tw-border-slate-800">
               <div>
                <label className="tw-text-[13px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block tw-uppercase tw-tracking-wider">요청 유형</label>
                <select 
                  className="tw-input tw-w-full tw-bg-obsidian"
                  value={formData.srTypeCode}
                  onChange={e => setFormData(f => ({ ...f, srTypeCode: e.target.value }))}
                >
                  {codes.types.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                </select>
              </div>
               <div>
                <label className="tw-text-[13px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block tw-uppercase tw-tracking-wider">서비스 카테고리</label>
                <select 
                  className="tw-input tw-w-full tw-bg-obsidian"
                  value={formData.srCategoryCode}
                  onChange={e => setFormData(f => ({ ...f, srCategoryCode: e.target.value }))}
                >
                  {codes.categories.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                </select>
              </div>
                <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                 <div className="tw-flex tw-items-center tw-gap-4">
                   <label className={LABEL_CLASS}>영향도</label>
                   <select 
                     className="tw-input tw-w-full tw-bg-obsidian"
                     value={formData.srImpactCode}
                     onChange={e => setFormData(f => ({ ...f, srImpactCode: e.target.value }))}
                   >
                     {codes.impacts.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                   </select>
                 </div>
                 <div className="tw-flex tw-items-center tw-gap-4">
                   <label className={LABEL_CLASS}>긴급도</label>
                   <select 
                     className="tw-input tw-w-full tw-bg-obsidian"
                     value={formData.srUrgencyCode}
                     onChange={e => setFormData(f => ({ ...f, srUrgencyCode: e.target.value }))}
                   >
                     {codes.urgencies.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                   </select>
                 </div>
                </div>

               <div className="tw-pt-6 tw-mt-2 tw-border-t tw-border-slate-800 tw-space-y-6">
                <div>
                  <label className="tw-text-[13px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block tw-uppercase tw-tracking-wider">구성 요소 (CI)</label>
                  <div className="tw-relative">
                    <Hash size={16} className="tw-absolute tw-left-3 tw-top-1/2 tw--translate-y-1/2 tw-text-slate-500" />
                    <input 
                      type="text"
                      placeholder="시스템 또는 자산명 입력..."
                      className="tw-input tw-w-full tw-pl-10"
                      value={formData.ciId}
                      onChange={e => setFormData(f => ({ ...f, ciId: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="tw-text-[13px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block tw-uppercase tw-tracking-wider">희망 완료일</label>
                  <div className="tw-relative">
                    <Calendar size={16} className="tw-absolute tw-left-3 tw-top-1/2 tw--translate-y-1/2 tw-text-slate-500" />
                    <input 
                      type="date"
                      className="tw-input tw-w-full tw-pl-10"
                      value={formData.expectedAt}
                      onChange={e => setFormData(f => ({ ...f, expectedAt: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>

               <div className="tw-bg-obsidian tw-p-6 tw-rounded-2xl tw-border tw-border-slate-800">
                 <div className="tw-flex tw-items-center tw-gap-2 tw-text-brand-400 tw-mb-6">
                    <User size={18} />
                    <h3 className="tw-text-xs tw-font-bold tw-uppercase tw-tracking-widest">신청자 정보</h3>
                 </div>
                 <div className="tw-space-y-4">
                    <div className="tw-flex tw-items-center tw-justify-between tw-gap-4">
                      <span className={LABEL_CLASS}>회사명</span>
                      <span className="tw-text-sm tw-text-slate-200 tw-font-medium">{user?.companyName || '-'}</span>
                    </div>
                    <div className="tw-flex tw-items-center tw-justify-between tw-gap-4">
                      <span className={LABEL_CLASS}>신청자</span>
                      <span className="tw-text-sm tw-text-slate-200 tw-font-medium">{user?.name} ({user?.userId})</span>
                    </div>
                 </div>
               </div>

               <div className="tw-mt-4 tw-p-5 tw-bg-brand-500/5 tw-border tw-border-brand-500/10 tw-rounded-2xl">
                <div className="tw-flex tw-items-center tw-gap-2 tw-text-brand-500 tw-mb-2">
                  <AlertCircle size={16} />
                  <span className="tw-text-[11px] tw-font-bold tw-uppercase tw-tracking-widest">SLA 안내</span>
                </div>
                <p className="tw-text-[13px] tw-text-slate-400 tw-leading-relaxed">
                  선택한 조건에 따라 기본 SLA는 **4시간**으로 설정됩니다. 긴급도가 높은 건은 자동으로 에스컬레이션됩니다.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="tw-p-6 tw-border-t tw-border-slate-800 tw-flex tw-items-center tw-justify-end tw-bg-slate-800/30">
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="tw-bg-brand-600 hover:tw-bg-brand-700 tw-text-white tw-px-10 tw-py-3 tw-rounded-xl tw-transition-all tw-flex tw-items-center tw-gap-3 tw-font-bold tw-shadow-lg tw-shadow-brand-600/20 disabled:tw-opacity-50"
          >
             {loading ? (
              <div className="tw-animate-spin tw-rounded-full tw-h-5 tw-w-5 tw-border-b-2 tw-border-white"></div>
            ) : (
              <Send size={20} />
            )}
            요청 등록
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestForm;
