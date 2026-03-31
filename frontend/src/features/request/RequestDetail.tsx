import React, { useState, useEffect } from 'react';
import { 
  X, Edit2, Clock, Shield, User, 
  FileText, Check, Calendar, Hash, ShieldAlert, Info
} from 'lucide-react';
import requestApi from './api/requestApi';
import type { RequestDTO, RequestCommentDTO } from './api/requestApi';
import { apiCommonCode, type CommonCode } from '../../api/apiCommonCode';
import StatusStepper from './components/StatusStepper';
import Badge from './components/Badge';
import RequestAttachments from './components/RequestAttachments';
import RequestComments from './components/RequestComments';

interface RequestDetailProps {
  requestId: number;
  onClose: () => void;
}

const RequestDetail: React.FC<RequestDetailProps> = ({ requestId, onClose }) => {
  const [request, setRequest] = useState<RequestDTO | null>(null);
  const [comments, setComments] = useState<RequestCommentDTO[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<RequestDTO>>({});
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [codes, setCodes] = useState<{
    types: CommonCode[];
    categories: CommonCode[];
    impacts: CommonCode[];
    urgencies: CommonCode[];
    resolutions: CommonCode[];
  }>({
    types: [],
    categories: [],
    impacts: [],
    urgencies: [],
    resolutions: []
  });

  const fetchDetail = async () => {
    try {
      const [reqRes, commRes] = await Promise.all([
        requestApi.getRequest(requestId),
        requestApi.getComments(requestId)
      ]);
      setRequest(reqRes.data);
      setComments(commRes.data);
      setEditedData(reqRes.data);
    } catch (err) {
      console.error('Failed to fetch detail', err);
    }
  };

  const fetchCodes = async () => {
    try {
      const [types, categories, impacts, urgencies, resolutions] = await Promise.all([
        apiCommonCode.getCodesByGroup('SR_TYPE'),
        apiCommonCode.getCodesByGroup('SR_CATEGORY'),
        apiCommonCode.getCodesByGroup('SR_IMPACT'),
        apiCommonCode.getCodesByGroup('SR_URGENCY'),
        apiCommonCode.getCodesByGroup('SR_RESOLUTION')
      ]);

      setCodes({
        types: types.data,
        categories: categories.data,
        impacts: impacts.data,
        urgencies: urgencies.data,
        resolutions: resolutions.data
      });
    } catch (err) {
      console.error('Failed to fetch codes', err);
    }
  };

  useEffect(() => {
    fetchDetail();
    fetchCodes();
  }, [requestId]);

  const handleSave = async () => {
    try {
      // Validation for RESOLVED state
      if (editedData.status === 'RESOLVED' && (!editedData.srResolutionCode || !editedData.resolutionText)) {
        alert('요청 해결을 위해서는 해결 코드와 처리 내용을 입력해야 합니다.');
        return;
      }

      await requestApi.updateRequest(requestId, editedData as RequestDTO);
      
      if (pendingFiles.length > 0) {
        for (const file of pendingFiles) {
          await requestApi.uploadAttachment(requestId, file);
        }
      }
      
      setPendingFiles([]);
      setIsEditing(false);
      fetchDetail();
    } catch (err) {
      console.error('Failed to save', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      setCommentLoading(true);
      await requestApi.addComment(requestId, {
        authorId: 'admin_user', // Mock
        content: newComment,
        isInternal: false
      });
      setNewComment('');
      const res = await requestApi.getComments(requestId);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to add comment', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDownload = async (attachmentId: number, fileName: string) => {
    try {
      const res = await requestApi.downloadAttachment(attachmentId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download', err);
    }
  };

  if (!request) return null;

  // Matrix Logic
  const isClosed = request.status === 'CLOSED' || request.status === 'CANCELLED';
  const isResolved = request.status === 'RESOLVED';
  const canEdit = !isClosed;
  const isClassificationLocked = isResolved || isClosed;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return dateStr.replace('T', ' ').substring(0, 16);
  };

  return (
    <div className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-obsidian/80 tw-backdrop-blur-md">
      <div className="tw-bg-obsidian tw-border tw-border-slate-800 tw-rounded-2xl tw-w-full tw-max-w-6xl tw-max-h-[90vh] tw-overflow-hidden tw-flex tw-flex-col tw-shadow-2xl tw-animate-slide-up">
        
        {/* Modal Header */}
        <div className="tw-p-6 tw-border-b tw-border-slate-800 tw-flex tw-items-center tw-justify-between tw-bg-slate-800/30">
          <div className="tw-flex tw-items-center tw-gap-4">
             <div className="tw-flex tw-flex-col">
               <span className="tw-text-[10px] tw-text-slate-500 tw-font-bold tw-uppercase tw-tracking-widest">요청 번호</span>
               <span className="tw-text-brand-400 tw-font-mono tw-text-lg tw-font-bold">{request.reqNumber}</span>
             </div>
             <div className="tw-h-8 tw-w-[1px] tw-bg-slate-700"></div>
             <h2 className="tw-text-xl tw-font-bold tw-text-white tw-flex-1">
                {isEditing ? (
                  <input 
                    type="text" 
                    className="tw-input tw-py-2 tw-text-lg tw-w-full tw-max-w-2xl"
                    value={editedData.title}
                    onChange={(e) => setEditedData(d => ({ ...d, title: e.target.value }))}
                  />
                ) : request.title}
             </h2>
          </div>
          <button 
            onClick={onClose}
            className="tw-p-2 tw-rounded-lg hover:tw-bg-slate-700 tw-text-slate-400 tw-transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="tw-flex-1 tw-overflow-y-auto tw-p-8 tw-custom-scrollbar">
          
          {/* Top Section: Stepper */}
          <div className="tw-mb-10 tw-bg-slate-900/40 tw-p-6 tw-rounded-xl tw-border tw-border-slate-800">
            <StatusStepper currentStatus={request.status || 'NEW'} />
          </div>

          {/* Main Grid Layout */}
          <div className="tw-grid tw-grid-cols-12 tw-gap-10">
            
            {/* Left: Content (8 cols) */}
            <div className="tw-col-span-12 lg:tw-col-span-8 tw-flex tw-flex-col tw-gap-8">
              
              {/* Description Section */}
              <section className="tw-card tw-p-8">
                <div className="tw-flex tw-items-center tw-gap-3 tw-mb-6 tw-text-brand-400">
                  <FileText size={20} />
                  <h3 className="tw-text-sm tw-font-bold tw-uppercase tw-tracking-widest">요청 상세 내용</h3>
                </div>
                <div className="tw-space-y-6">
                  {isEditing ? (
                    <textarea 
                      className="tw-input tw-w-full tw-min-h-[200px] tw-resize-none tw-leading-relaxed"
                      value={editedData.description}
                      onChange={(e) => setEditedData(d => ({ ...d, description: e.target.value }))}
                    />
                  ) : (
                    <div className="tw-text-slate-300 tw-leading-relaxed tw-text-[15px] tw-bg-slate-900/50 tw-p-6 tw-rounded-xl tw-border tw-border-slate-800/50">
                      {request.description}
                    </div>
                  )}
                </div>
              </section>

              {/* Resolution Section (Visible if RESOLVED or CLOSED or in editing) */}
              {(isResolved || isClosed || isEditing) && (
                <section className="tw-card tw-p-8 tw-border-brand-500/20 tw-bg-brand-500/5">
                  <div className="tw-flex tw-items-center tw-gap-3 tw-mb-6 tw-text-emerald-400">
                    <Check size={20} />
                    <h3 className="tw-text-sm tw-font-bold tw-uppercase tw-tracking-widest">해결 및 조치 내용</h3>
                  </div>
                  <div className="tw-grid tw-grid-cols-1 tw-gap-6">
                    <div>
                      <label className="tw-text-[12px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block tw-uppercase">해결 코드</label>
                      {isEditing ? (
                        <select 
                          className="tw-input tw-w-full"
                          value={editedData.srResolutionCode}
                          onChange={e => setEditedData(d => ({ ...d, srResolutionCode: e.target.value }))}
                        >
                          <option value="">-- 해결 코드 선택 --</option>
                          {codes.resolutions.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                        </select>
                      ) : (
                         <div className="tw-text-emerald-400 tw-font-bold">{request.srResolutionCode || '미입력'}</div>
                      )}
                    </div>
                    <div>
                      <label className="tw-text-[12px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block tw-uppercase">조치 내용 상세</label>
                      {isEditing ? (
                        <textarea 
                          className="tw-input tw-w-full tw-min-h-[120px] tw-resize-none"
                          value={editedData.resolutionText}
                          onChange={e => setEditedData(d => ({ ...d, resolutionText: e.target.value }))}
                          placeholder="조치 완료 내용을 상세히 입력하세요."
                        />
                      ) : (
                        <div className="tw-text-slate-300 tw-text-sm tw-bg-obsidian tw-p-4 tw-rounded-lg tw-border tw-border-slate-800">
                          {request.resolutionText || '기록된 조치 내용이 없습니다.'}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Attachments & Comments */}
              <RequestAttachments 
                attachments={request.attachments}
                pendingFiles={pendingFiles}
                onUpload={(file) => setPendingFiles(prev => [...prev, file])}
                onDelete={() => {}} // Placeholder
                onRemovePending={(idx) => setPendingFiles(prev => prev.filter((_, i) => i !== idx))}
                onDownload={handleDownload}
                canEdit={isEditing}
              />

              <RequestComments 
                comments={comments}
                newCommentValue={newComment}
                onNewCommentChange={setNewComment}
                onAddComment={handleAddComment}
                loading={commentLoading}
              />
            </div>

            {/* Right: Sidebar (4 cols) */}
            <div className="tw-col-span-12 lg:tw-col-span-4 tw-flex tw-flex-col tw-gap-8">
              
              {/* Status & Reopen Info */}
              {request.reopenCount && request.reopenCount > 0 ? (
                <div className="tw-bg-amber-500/10 tw-border tw-border-amber-500/20 tw-p-4 tw-rounded-xl tw-flex tw-items-center tw-gap-3">
                  <ShieldAlert className="tw-text-amber-500" size={20} />
                  <div>
                    <div className="tw-text-xs tw-font-bold tw-text-amber-500 tw-uppercase">재오픈됨</div>
                    <div className="tw-text-sm tw-text-slate-300">이 요청은 총 <b>{request.reopenCount}회</b> 재오픈되었습니다.</div>
                  </div>
                </div>
              ) : null}

              {/* Ownership */}
              <section className="tw-card tw-p-6">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-6 tw-text-brand-400">
                  <User size={18} />
                  <h3 className="tw-text-xs tw-font-bold tw-uppercase tw-tracking-widest">배정 및 신청 정보</h3>
                </div>
                <div className="tw-space-y-5">
                  <div className="tw-flex tw-justify-between tw-items-center">
                    <span className="tw-text-[13px] tw-text-slate-500">신청자</span>
                    <span className="tw-text-sm tw-text-slate-200 tw-font-medium">{request.requesterId}</span>
                  </div>
                  <div className="tw-flex tw-justify-between tw-items-center">
                    <span className="tw-text-[13px] tw-text-slate-500">담당자</span>
                    {isEditing && !isClassificationLocked ? (
                       <input 
                        type="text" 
                        className="tw-input tw-py-1 tw-text-xs tw-w-32"
                        value={editedData.assigneeId || ''}
                        onChange={e => setEditedData(d => ({ ...d, assigneeId: e.target.value }))}
                       />
                    ) : (
                      <span className="tw-text-sm tw-text-brand-400 tw-font-bold">{request.assigneeId || '미정 (배정 대기)'}</span>
                    )}
                  </div>
                </div>
              </section>

              {/* Assessment Section */}
              <section className="tw-card tw-p-6">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-6 tw-text-brand-400">
                  <Shield size={18} />
                  <h3 className="tw-text-xs tw-font-bold tw-uppercase tw-tracking-widest">속성 분류 및 평가</h3>
                </div>
                <div className="tw-space-y-6">
                  <div className="tw-flex tw-justify-between tw-items-center">
                    <span className="tw-text-[13px] tw-text-slate-500">요청 유형</span>
                    {isEditing && !isClassificationLocked ? (
                      <select className="tw-input tw-py-1 tw-text-xs" value={editedData.srTypeCode} onChange={e => setEditedData(d => ({ ...d, srTypeCode: e.target.value }))}>
                        {codes.types.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                      </select>
                    ) : <Badge label={request.srTypeCode || 'INCIDENT'} type="status" />}
                  </div>
                  <div className="tw-flex tw-justify-between tw-items-center">
                    <span className="tw-text-[13px] tw-text-slate-500">서비스 카테고리</span>
                    {isEditing && !isClassificationLocked ? (
                      <select className="tw-input tw-py-1 tw-text-xs tw-max-w-[150px]" value={editedData.srCategoryCode} onChange={e => setEditedData(d => ({ ...d, srCategoryCode: e.target.value }))}>
                        {codes.categories.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                      </select>
                    ) : <span className="tw-text-sm tw-text-slate-300">{request.srCategoryCode}</span>}
                  </div>
                  <div className="tw-flex tw-justify-between tw-items-center">
                    <span className="tw-text-[13px] tw-text-slate-500">영향도</span>
                    {isEditing && !isClassificationLocked ? (
                      <select className="tw-input tw-py-1 tw-text-xs" value={editedData.srImpactCode} onChange={e => setEditedData(d => ({ ...d, srImpactCode: e.target.value }))}>
                        {codes.impacts.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                      </select>
                    ) : <Badge label={request.srImpactCode || 'LOW'} type="priority" />}
                  </div>
                  <div className="tw-flex tw-justify-between tw-items-center">
                    <span className="tw-text-[13px] tw-text-slate-500">긴급도</span>
                    {isEditing && !isClassificationLocked ? (
                      <select className="tw-input tw-py-1 tw-text-xs" value={editedData.srUrgencyCode} onChange={e => setEditedData(d => ({ ...d, srUrgencyCode: e.target.value }))}>
                        {codes.urgencies.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                      </select>
                    ) : <Badge label={request.srUrgencyCode || 'LOW'} type="priority" />}
                  </div>
                  
                  <div className="tw-pt-4 tw-border-t tw-border-slate-800">
                    <label className="tw-text-[13px] tw-text-slate-500 tw-mb-2 tw-block">구성 요소 (CI)</label>
                    <div className="tw-relative">
                      <Hash size={14} className="tw-absolute tw-left-3 tw-top-1/2 tw--translate-y-1/2 tw-text-slate-500" />
                      <input 
                        type="text" 
                        disabled={!isEditing || isClassificationLocked}
                        className="tw-input tw-w-full tw-pl-10 tw-py-2 tw-text-sm"
                        value={isEditing ? editedData.ciId || '' : request.ciId || ''}
                        onChange={e => setEditedData(d => ({ ...d, ciId: e.target.value }))}
                        placeholder="자산/시스템 코드"
                      />
                    </div>
                  </div>

                  <div className="tw-pt-4 tw-border-t tw-border-slate-800 tw-flex tw-justify-between tw-items-end">
                    <span className="tw-text-[13px] tw-text-slate-500">종합 우선순위</span>
                    <Badge label={request.priority || 'P3'} type="priority" className="tw-scale-125" />
                  </div>
                </div>
              </section>

              {/* SLA & Timeline */}
              <section className="tw-card tw-p-6 tw-bg-gradient-to-br tw-from-slate-800/30 tw-to-transparent">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-6 tw-text-brand-400">
                  <Clock size={18} />
                  <h3 className="tw-text-xs tw-font-bold tw-uppercase tw-tracking-widest">SLA 및 타임라인</h3>
                </div>
                <div className="tw-space-y-4">
                  <div className="tw-bg-obsidian tw-p-4 tw-rounded-xl tw-border tw-border-slate-800">
                    <div className="tw-flex tw-justify-between tw-mb-2">
                      <span className="tw-text-[10px] tw-text-slate-500 tw-uppercase">처리 목표 일시 (SLA)</span>
                      <span className="tw-text-[10px] tw-text-emerald-500 tw-font-bold">정상</span>
                    </div>
                    <div className="tw-text-sm tw-text-slate-200 tw-font-mono">
                      {formatDate(request.slaTargetAt)}
                    </div>
                  </div>
                  
                  <div className="tw-space-y-3 tw-px-2 tw-pt-2">
                    <div className="tw-flex tw-justify-between tw-items-center">
                      <span className="tw-text-[11px] tw-text-slate-500">등록 일시</span>
                      <span className="tw-text-[11px] tw-text-slate-400">{formatDate(request.createdAt)}</span>
                    </div>
                    <div className="tw-flex tw-justify-between tw-items-center">
                      <span className="tw-text-[11px] tw-text-slate-500">희망 완료일</span>
                      {isEditing ? (
                         <input 
                          type="date"
                          className="tw-input tw-py-0 tw-text-[10px] tw-w-28"
                          value={editedData.expectedAt?.substring(0, 10) || ''}
                          onChange={e => setEditedData(d => ({ ...d, expectedAt: e.target.value }))}
                         />
                      ) : (
                        <span className="tw-text-[11px] tw-text-slate-400">{formatDate(request.expectedAt)}</span>
                      )}
                    </div>
                    {request.resolvedAt && (
                      <div className="tw-flex tw-justify-between tw-items-center">
                        <span className="tw-text-[11px] tw-text-emerald-500/70">해결 일시</span>
                        <span className="tw-text-[11px] tw-text-emerald-500/70">{formatDate(request.resolvedAt)}</span>
                      </div>
                    )}
                    {request.closedAt && (
                      <div className="tw-flex tw-justify-between tw-items-center">
                        <span className="tw-text-[11px] tw-text-slate-500">종료 일시</span>
                        <span className="tw-text-[11px] tw-text-slate-400">{formatDate(request.closedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Status Change Note */}
              {isEditing && (
                <div className="tw-p-4 tw-bg-blue-500/5 tw-border tw-border-blue-500/20 tw-rounded-xl tw-flex tw-gap-3">
                  <Info className="tw-text-blue-500 tw-shrink-0" size={16} />
                  <p className="tw-text-[11px] tw-text-slate-400 tw-leading-relaxed">
                    <b>RESOLVED</b> 상태로 변경하려면 해결 코드와 조치 내용을 반드시 입력해야 합니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="tw-p-6 tw-border-t tw-border-slate-800 tw-flex tw-items-center tw-justify-end tw-gap-3 tw-bg-slate-800/30">
          <button 
            onClick={onClose}
            className="tw-bg-slate-800 hover:tw-bg-slate-700 tw-text-slate-300 tw-px-6 tw-py-2 tw-rounded-lg tw-transition-all"
          >
            닫기
          </button>
          {canEdit && (
            !isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="tw-bg-brand-600 hover:tw-bg-brand-700 tw-text-white tw-px-8 tw-py-2 tw-rounded-xl tw-transition-all tw-flex tw-items-center tw-gap-2 tw-font-bold tw-shadow-lg tw-shadow-brand-600/20"
              >
                <Edit2 size={18} />
                요청 편집
              </button>
            ) : (
              <button 
                onClick={handleSave}
                className="tw-bg-emerald-600 hover:tw-bg-emerald-700 tw-text-white tw-px-8 tw-py-2 tw-rounded-xl tw-transition-all tw-flex tw-items-center tw-gap-2 tw-font-bold tw-shadow-lg tw-shadow-emerald-600/20"
              >
                <Check size={18} />
                변경 사항 저장
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;
