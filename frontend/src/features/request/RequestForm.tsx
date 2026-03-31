import React, { useState } from 'react';
import { X, Send, Plus, AlertCircle } from 'lucide-react';
import requestApi from './api/requestApi';
import RequestAttachments from './components/RequestAttachments';

interface RequestFormProps {
  onClose: () => void;
}

const RequestForm: React.FC<RequestFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    srTypeCode: 'INCIDENT',
    srCategoryCode: 'HARDWARE',
    srImpactCode: 'LOW',
    srUrgencyCode: 'LOW',
    companyId: 'COMP-ALPHA', // Mock
    requesterId: 'admin_user' // Mock
  });
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    try {
      setLoading(true);
      // 1. Create Request
      const res = await requestApi.createRequest(formData);
      const requestId = res.data.id;

      // 2. Upload Files if any
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
      <div className="tw-bg-obsidian tw-border tw-border-slate-800 tw-rounded-2xl tw-w-full tw-max-w-4xl tw-h-[67%] tw-max-h-[90vh] tw-overflow-hidden tw-flex tw-flex-col tw-shadow-2xl tw-animate-slide-up">
        
        {/* Modal Header */}
        <div className="tw-p-4 tw-border-b tw-border-slate-800 tw-flex tw-items-center tw-justify-between tw-bg-slate-800/30">
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
          <div className="tw-grid tw-grid-cols-12 tw-gap-8">
            
            {/* Left: General Info (7 cols) */}
            <div className="tw-col-span-12 lg:tw-col-span-7 tw-flex tw-flex-col tw-gap-6">
               <div>
                <label className="tw-text-[14px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block">요청 제목</label>
                <input 
                  type="text"
                  placeholder="요청 내용의 요약을 입력하세요..."
                  className="tw-input tw-w-full tw-text-lg"
                  value={formData.title}
                  onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
               <div>
                <label className="tw-text-[14px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block">상세 내용</label>
                <textarea 
                  placeholder="처리자가 이해할 수 있도록 상세 내용을 입력해 주세요..."
                  className="tw-input tw-w-full tw-min-h-[150px] tw-resize-none"
                  value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  required
                />
              </div>

              {/* Upload Zone & File List Component */}
               <div>
                <label className="tw-text-[14px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block">첨부 파일 (파일당 최대 10MB)</label>
                <RequestAttachments 
                   pendingFiles={files}
                   onUpload={(file) => setFiles(prev => [...prev, file])}
                   onRemovePending={(idx) => setFiles(prev => prev.filter((_, i) => i !== idx))}
                   canEdit={true}
                />
              </div>
            </div>

            {/* Right: Categorization (5 cols) */}
            <div className="tw-col-span-12 lg:tw-col-span-5 tw-bg-slate-800/20 tw-p-6 tw-rounded-xl tw-flex tw-flex-col tw-gap-6 tw-border tw-border-slate-800/50">
               <div>
                <label className="tw-text-[14px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block">요청 유형</label>
                <select 
                  className="tw-input tw-w-full"
                  value={formData.srTypeCode}
                  onChange={e => setFormData(f => ({ ...f, srTypeCode: e.target.value }))}
                >
                  <option value="INCIDENT">장애</option>
                  <option value="SERVICE_REQUEST">서비스 요청</option>
                  <option value="CHANGE">변경 요청</option>
                </select>
              </div>
               <div>
                <label className="tw-text-[14px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block">서비스 카테고리</label>
                <select 
                  className="tw-input tw-w-full"
                  value={formData.srCategoryCode}
                  onChange={e => setFormData(f => ({ ...f, srCategoryCode: e.target.value }))}
                >
                  <option value="HARDWARE">하드웨어</option>
                  <option value="SOFTWARE">소프트웨어 / OS</option>
                  <option value="NETWORK">네트워크 / 통신</option>
                  <option value="ACCESS">계정 / 권한</option>
                </select>
              </div>
               <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-pt-4 tw-border-t tw-border-slate-800">
                <div>
                  <label className="tw-text-[14px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block">영향도</label>
                  <select 
                    className="tw-input tw-w-full"
                    value={formData.srImpactCode}
                    onChange={e => setFormData(f => ({ ...f, srImpactCode: e.target.value }))}
                  >
                    <option value="LOW">낮음</option>
                    <option value="MEDIUM">중간</option>
                    <option value="HIGH">높음</option>
                  </select>
                </div>
                <div>
                  <label className="tw-text-[14px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block">긴급도</label>
                  <select 
                    className="tw-input tw-w-full"
                    value={formData.srUrgencyCode}
                    onChange={e => setFormData(f => ({ ...f, srUrgencyCode: e.target.value }))}
                  >
                    <option value="LOW">낮음</option>
                    <option value="MEDIUM">중간</option>
                    <option value="HIGH">높음</option>
                  </select>
                </div>
              </div>
               <div className="tw-mt-auto tw-p-4 tw-bg-brand-500/5 tw-border tw-border-brand-500/10 tw-rounded-lg">
                <div className="tw-flex tw-items-center tw-gap-2 tw-text-brand-500 tw-mb-2">
                  <AlertCircle size={14} />
                  <span className="tw-text-[10px] tw-font-bold tw-uppercase tw-tracking-widest">SLA 안내</span>
                </div>
                <p className="tw-text-xs tw-text-slate-400 tw-leading-relaxed">
                  선택한 조건에 따라 기본 SLA는 **4시간**으로 설정됩니다. 긴급도가 높은 건은 자동으로 에스컬레이션됩니다.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="tw-p-4 tw-border-t tw-border-slate-800 tw-flex tw-items-center tw-justify-end tw-gap-3 tw-bg-slate-800/30">
          <button 
            onClick={onClose}
             className="tw-bg-slate-800 hover:tw-bg-slate-700 tw-text-slate-300 tw-px-6 tw-py-2 tw-rounded-lg tw-transition-all"
          >
            취소
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="tw-bg-brand-600 hover:tw-bg-brand-700 tw-text-white tw-px-8 tw-py-2 tw-rounded-lg tw-transition-all tw-flex tw-items-center tw-gap-2 tw-font-bold"
          >
             {loading ? (
              <div className="tw-animate-spin tw-rounded-full tw-h-4 tw-w-4 tw-border-b-2 tw-border-white"></div>
            ) : (
              <Send size={18} />
            )}
            요청 등록
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestForm;
