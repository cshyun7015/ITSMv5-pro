import React, { useState, useEffect } from 'react';
import { 
  X, Edit2, Shield, User, 
  FileText, Check, Calendar, Hash, ShieldAlert, Info, Trash2, Clock, MapPin, Activity
} from 'lucide-react';
import requestApi from './api/requestApi';
import apiUser, { type UserDTO } from '../../api/apiUser';
import type { RequestDTO, RequestCommentDTO } from './api/requestApi';
import { apiCommonCode, type CommonCode } from '../code/api/apiCommonCode';
import { useAuth } from '../auth/AuthProvider';
import StatusStepper from './components/StatusStepper';
import Badge from './components/Badge';
import RequestAttachments from './components/RequestAttachments';
import RequestComments from './components/RequestComments';
import RequestHistoryList from './components/RequestHistoryList';

interface RequestDetailProps {
  requestId: number;
  onClose: () => void;
}

const SECTION_TITLE_CLASS = "tw-text-[11px] tw-font-black tw-text-slate-500 tw-uppercase tw-tracking-[0.1em] tw-mb-4 tw-flex tw-items-center tw-gap-2";
const INFO_BOX_CLASS = "tw-bg-obsidian-light/50 tw-border tw-border-white/5 tw-rounded-xl tw-p-3";
const LABEL_CLASS = "tw-text-[10px] tw-font-bold tw-text-slate-500 tw-uppercase tw-tracking-widest tw-whitespace-nowrap";
const VALUE_CLASS = "tw-text-sm tw-text-slate-200 tw-font-semibold tw-truncate";

const RequestDetail: React.FC<RequestDetailProps> = ({ requestId, onClose }) => {
  const { user } = useAuth();
  const [request, setRequest] = useState<RequestDTO | null>(null);
  const [comments, setComments] = useState<RequestCommentDTO[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<RequestDTO>>({});
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [operators, setOperators] = useState<UserDTO[]>([]);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const [codes, setCodes] = useState<{
    types: CommonCode[];
    categories: CommonCode[];
    impacts: CommonCode[];
    urgencies: CommonCode[];
    resolutions: CommonCode[];
    statuses: CommonCode[];
  }>({
    types: [],
    categories: [],
    impacts: [],
    urgencies: [],
    resolutions: [],
    statuses: []
  });

  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Requester Search States
  const [requesterSearch, setRequesterSearch] = useState('');
  const [requesterResults, setRequesterResults] = useState<UserDTO[]>([]);
  const [isSearchingRequesters, setIsSearchingRequesters] = useState(false);
  const [showRequesterDropdown, setShowRequesterDropdown] = useState(false);

  const isAdminOrOperator = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_OPER';

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

  const fetchMetadata = async () => {
    try {
      const [types, categories, impacts, urgencies, resolutions, statuses, admins, ops] = await Promise.all([
        apiCommonCode.getCodesByGroup('SR_TYPE'),
        apiCommonCode.getCodesByGroup('SR_CATEGORY'),
        apiCommonCode.getCodesByGroup('SR_IMPACT'),
        apiCommonCode.getCodesByGroup('SR_URGENCY'),
        apiCommonCode.getCodesByGroup('SR_RESOLUTION'),
        apiCommonCode.getCodesByGroup('SR_STATUS'),
        apiUser.list({ role: 'ROLE_ADMIN', size: 100 }),
        apiUser.list({ role: 'ROLE_OPER', size: 100 })
      ]);

      setCodes({
        types: types.data,
        categories: categories.data,
        impacts: impacts.data,
        urgencies: urgencies.data,
        resolutions: resolutions.data,
        statuses: statuses.data
      });

      setOperators([...admins.content, ...ops.content]);
    } catch (err) {
      console.error('Failed to fetch metadata', err);
    }
  };

  useEffect(() => {
    fetchDetail();
    fetchMetadata();
  }, [requestId]);

  const handleSave = async () => {
    try {
      const updateData = { 
        ...editedData, 
        updatedBy: user?.userId || 'SYSTEM' 
      };
      
      if (updateData.status === 'RESOLVED' && (!updateData.srResolutionCode || !updateData.resolutionText)) {
        alert('요청 해결을 위해서는 해결 코드와 처리 내용을 입력해야 합니다.');
        return;
      }
      
      await requestApi.updateRequest(requestId, updateData as RequestDTO);
      
      if (pendingFiles.length > 0) {
        for (const file of pendingFiles) {
          await requestApi.uploadAttachment(requestId, file);
        }
      }
      
      setPendingFiles([]);
      setIsEditing(false);
      setHistoryRefreshTrigger(prev => prev + 1);
      fetchDetail();
    } catch (err) {
      console.error('Failed to save', err);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await requestApi.deleteRequest(requestId);
      onClose();
    } catch (err) {
      console.error('Delete request failed:', err);
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  useEffect(() => {
    if (!isEditing) return;
    const timer = setTimeout(async () => {
      if (requesterSearch.trim().length >= 2) {
        setIsSearchingRequesters(true);
        try {
          const res = await apiUser.list({ name: requesterSearch, size: 20 });
          setRequesterResults(res.content);
          setShowRequesterDropdown(true);
        } catch (err) {
          console.error("Search failed", err);
        } finally {
          setIsSearchingRequesters(false);
        }
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [requesterSearch, isEditing]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      setCommentLoading(true);
      await requestApi.addComment(requestId, {
        authorId: user?.userId || 'admin_user',
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

  const isClosed = request.status === 'CLOSED' || request.status === 'CANCELLED';
  const isResolved = request.status === 'RESOLVED';
  const canEdit = !isClosed && isAdminOrOperator;
  const isClassificationLocked = isResolved || isClosed;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return dateStr.replace('T', ' ').substring(0, 16);
  };

  return (
    <div className="tw-fixed tw-inset-0 tw-z-[2000] tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-obsidian/80 tw-backdrop-blur-xl">
      <div className="tw-bg-obsidian tw-border tw-border-white/10 tw-rounded-3xl tw-w-full tw-max-w-5xl tw-h-[85vh] tw-overflow-hidden tw-flex tw-flex-col tw-shadow-[0_0_50px_rgba(0,0,0,0.5)] tw-animate-scale-in">
        
        {/* 🏔️ COMPACT OPERATIONAL HEADER */}
        <div className="tw-px-8 tw-py-4 tw-border-b tw-border-white/5 tw-flex tw-items-center tw-justify-between tw-bg-white/[0.02]">
          <div className="tw-flex tw-items-center tw-gap-5 tw-flex-1">
             <div className="tw-flex tw-flex-col">
               <span className="tw-text-[9px] tw-text-brand-400 tw-font-black tw-uppercase tw-tracking-[0.25em]">Ticket ID</span>
               <span className="tw-text-white tw-font-mono tw-text-base tw-font-bold">{request.reqNumber}</span>
             </div>
             <div className="tw-h-8 tw-w-[1px] tw-bg-white/10"></div>
             <div className="tw-flex-1">
                {isEditing ? (
                  <input 
                    type="text" 
                    className="tw-input tw-w-full !tw-py-1 tw-text-lg tw-font-bold tw-bg-white/[0.03]"
                    value={editedData.title}
                    onChange={(e) => setEditedData(d => ({ ...d, title: e.target.value }))}
                  />
                ) : (
                  <h2 className="tw-text-lg tw-font-bold tw-text-white tw-line-clamp-1">{request.title}</h2>
                )}
             </div>
          </div>
          <div className="tw-flex tw-items-center tw-gap-3 tw-ml-6">
            {isAdminOrOperator && (
              <button onClick={() => setIsConfirmOpen(true)} className="tw-p-2 tw-rounded-xl hover:tw-bg-red-500/10 tw-text-red-500/60 hover:tw-text-red-500 tw-transition-all">
                <Trash2 size={20} />
              </button>
            )}
            <button onClick={onClose} className="tw-p-2 tw-rounded-xl hover:tw-bg-white/5 tw-text-slate-500 hover:tw-text-white tw-transition-all">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* 🕹️ MAIN WORKSPACE */}
        <div className="tw-flex-1 tw-overflow-hidden tw-flex">
          
          {/* LEFT CONTENT AREA */}
          <div className="tw-flex-1 tw-overflow-y-auto tw-p-8 tw-custom-scrollbar tw-flex tw-flex-col tw-gap-8">
            
            {/* Status Flow */}
            <div className="tw-bg-white/[0.02] tw-p-5 tw-rounded-2xl tw-border tw-border-white/5">
              <StatusStepper currentStatus={request.status || 'NEW'} />
            </div>

            {/* Description Card */}
            <section>
                <h3 className={SECTION_TITLE_CLASS}><FileText size={14} /> 상세 설명 및 해결 방안</h3>
                <div className="tw-flex tw-flex-col tw-gap-4">
                  {isEditing ? (
                    <textarea 
                      className="tw-input tw-w-full tw-min-h-[160px] tw-resize-none tw-bg-white/[0.03] tw-text-sm tw-leading-relaxed"
                      value={editedData.description}
                      onChange={(e) => setEditedData(d => ({ ...d, description: e.target.value }))}
                    />
                  ) : (
                    <div className="tw-bg-white/[0.03] tw-p-6 tw-rounded-2xl tw-border tw-border-white/5 tw-text-slate-300 tw-text-sm tw-leading-relaxed">
                      {request.description}
                    </div>
                  )}

                  {(isResolved || isClosed || isEditing) && (
                    <div className="tw-bg-emerald-500/[0.03] tw-border tw-border-emerald-500/20 tw-p-6 tw-rounded-2xl tw-space-y-4">
                        <div>
                            <label className={LABEL_CLASS}>해결 코드 (Resolution Code)</label>
                            {isEditing ? (
                                <select className="tw-input tw-w-full tw-text-xs tw-bg-obsidian" value={editedData.srResolutionCode} onChange={e => setEditedData(d => ({ ...d, srResolutionCode: e.target.value }))}>
                                    <option value="">코드 선택...</option>
                                    {codes.resolutions.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                                </select>
                            ) : <div className="tw-text-emerald-400 tw-font-bold tw-text-sm">{request.srResolutionCode || '대기 중'}</div>}
                        </div>
                        <div>
                            <label className={LABEL_CLASS}>해결 상세 내용</label>
                            {isEditing ? (
                                <textarea className="tw-input tw-w-full tw-min-h-[100px] tw-text-xs tw-bg-obsidian" value={editedData.resolutionText} onChange={e => setEditedData(d => ({ ...d, resolutionText: e.target.value }))} placeholder="해결 내용을 입력하세요..." />
                            ) : <div className="tw-text-slate-300 tw-text-xs tw-leading-relaxed">{request.resolutionText || '해결 정보가 없습니다.'}</div>}
                        </div>
                    </div>
                  )}
                </div>
            </section>

            {/* Attachments */}
            <div className={request.attachments?.length === 0 && !isEditing ? "tw-opacity-50" : ""}>
                <h3 className={SECTION_TITLE_CLASS}><Hash size={14} /> 첨부 파일</h3>
                <RequestAttachments attachments={request.attachments} pendingFiles={pendingFiles} onUpload={f => setPendingFiles(p => [...p, f])} onDownload={handleDownload} canEdit={isEditing} />
            </div>

            {/* Comments */}
            <div className={comments.length === 0 ? "tw-opacity-50" : ""}>
                <h3 className={SECTION_TITLE_CLASS}><MapPin size={14} /> 활동 및 댓글</h3>
                <RequestComments comments={comments} newCommentValue={newComment} onNewCommentChange={setNewComment} onAddComment={handleAddComment} loading={commentLoading} />
            </div>

            {/* History Timeline */}
            <div className="tw-opacity-80">
                <h3 className={SECTION_TITLE_CLASS}><Clock size={14} /> 변경 이력 (Audit Trail)</h3>
                <RequestHistoryList requestId={requestId} refreshTrigger={historyRefreshTrigger} />
            </div>
          </div>

          {/* RIGHT SIDEBAR (META INFO) */}
          <div className="tw-w-[320px] tw-border-l tw-border-white/5 tw-bg-white/[0.01] tw-overflow-y-auto tw-p-6 tw-flex tw-flex-col tw-gap-8 tw-custom-scrollbar">
            
            {/* 👥 Stakeholders */}
            <section>
                <h3 className={SECTION_TITLE_CLASS}><User size={14} /> 관계자 정보</h3>
                <div className="tw-flex tw-flex-col tw-gap-2">
                    <div className={INFO_BOX_CLASS}>
                        <div className="tw-flex tw-justify-between tw-items-center">
                            <label className={LABEL_CLASS}>신청자</label>
                            <div className={VALUE_CLASS}>{request.requesterId}</div>
                        </div>
                        <div className="tw-text-[9px] tw-text-slate-500 tw-text-right tw-mt-1">{request.companyId}</div>
                    </div>
                    <div className={INFO_BOX_CLASS}>
                        <div className="tw-flex tw-justify-between tw-items-center">
                            <label className={LABEL_CLASS}>담당자</label>
                            {isEditing && !isClassificationLocked ? (
                                <select className="tw-input tw-w-2/3 tw-text-xs tw-bg-obsidian !tw-py-0.5" value={editedData.assigneeId || ''} onChange={e => setEditedData(d => ({ ...d, assigneeId: e.target.value }))}>
                                    <option value="">배정 대기</option>
                                    {operators.map(op => <option key={op.userId} value={op.userId}>{op.name}</option>)}
                                </select>
                            ) : <div className={VALUE_CLASS}>{request.assigneeId || '배정 대기'}</div>}
                        </div>
                    </div>
                </div>
            </section>

            {/* 🛡️ Classification */}
            <section>
                <h3 className={SECTION_TITLE_CLASS}><Shield size={14} /> 서비스 분류</h3>
                <div className="tw-flex tw-flex-col tw-gap-2">
                    <div className="tw-grid tw-grid-cols-2 tw-gap-2">
                        <div className={`${INFO_BOX_CLASS} tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-1`}>
                            <label className={LABEL_CLASS}>우선순위</label>
                            <Badge label={request.priority || 'P3'} type="priority" />
                        </div>
                        <div className={`${INFO_BOX_CLASS} tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-1`}>
                            <label className={LABEL_CLASS}>상태</label>
                            <Badge label={request.status || 'NEW'} type="status" />
                        </div>
                    </div>
                    <div className={INFO_BOX_CLASS}>
                        <div className="tw-flex tw-justify-between tw-items-center">
                            <label className={LABEL_CLASS}>서비스 유형</label>
                            <div className={VALUE_CLASS}>{request.srTypeCode}</div>
                        </div>
                    </div>
                    <div className={INFO_BOX_CLASS}>
                        <div className="tw-flex tw-justify-between tw-items-center">
                            <label className={LABEL_CLASS}>시스템 / CI</label>
                            <div className={VALUE_CLASS}>{request.ciId || 'N/A'}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ⏱️ Timeline */}
            <section>
                <h3 className={SECTION_TITLE_CLASS}><Clock size={14} /> SLA 및 타임라인</h3>
                <div className="tw-flex tw-flex-col tw-gap-3">
                    <div className="tw-bg-brand-500/5 tw-border tw-border-brand-500/20 tw-p-3 tw-rounded-xl">
                        <label className="tw-text-[9px] tw-font-black tw-text-brand-400 tw-uppercase tw-tracking-widest tw-mb-1 tw-block">처리기한 (SLA Target)</label>
                        <div className="tw-text-sm tw-font-mono tw-text-slate-200">{formatDate(request.slaTargetAt)}</div>
                    </div>
                    <div className="tw-space-y-2 tw-px-1">
                        <div className="tw-flex tw-justify-between items-center">
                            <span className="tw-text-[9px] tw-text-slate-500 tw-uppercase tw-tracking-widest">등록 일시</span>
                            <span className="tw-text-xs tw-text-slate-400">{formatDate(request.createdAt)}</span>
                        </div>
                        <div className="tw-flex tw-justify-between items-center">
                            <span className="tw-text-[9px] tw-text-slate-500 tw-uppercase tw-tracking-widest">희망 완료일</span>
                            <span className="tw-text-xs tw-text-slate-400">{formatDate(request.expectedAt)}</span>
                        </div>
                        {request.resolvedAt && (
                            <div className="tw-flex tw-justify-between items-center tw-pt-2 tw-border-t tw-border-white/5">
                                <span className="tw-text-[9px] tw-text-emerald-500 tw-uppercase tw-tracking-widest">해결 일시</span>
                                <span className="tw-text-xs tw-text-emerald-500/80">{formatDate(request.resolvedAt)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>
          </div>
        </div>

        {/* 🏁 FOOTER ACTIONS */}
        <div className="tw-px-8 tw-py-4 tw-border-t tw-border-white/5 tw-flex tw-items-center tw-justify-between tw-bg-white/[0.02]">
          <div className="tw-text-[10px] tw-text-slate-500 tw-flex tw-items-center tw-gap-2">
            <MapPin size={10} /> 로컬 시간: {new Date().toLocaleTimeString()}
          </div>
          <div className="tw-flex tw-gap-3">
             <button onClick={onClose} className="tw-px-6 tw-py-2 tw-rounded-xl tw-text-xs tw-font-bold tw-text-slate-400 hover:tw-text-white tw-transition-all">닫기 (Close)</button>
             {canEdit && (
               !isEditing ? (
                 <button onClick={() => setIsEditing(true)} className="tw-bg-brand-600 hover:tw-bg-brand-500 tw-text-white tw-px-8 tw-py-2 tw-rounded-xl tw-text-xs tw-font-black tw-uppercase tw-tracking-widest tw-transition-all tw-flex tw-items-center tw-gap-2 tw-shadow-lg tw-shadow-brand-600/20">
                    <Edit2 size={14} /> 요청 편집
                 </button>
               ) : (
                 <button onClick={handleSave} className="tw-bg-emerald-600 hover:tw-bg-emerald-500 tw-text-white tw-px-8 tw-py-2 tw-rounded-xl tw-text-xs tw-font-black tw-uppercase tw-tracking-widest tw-transition-all tw-flex tw-items-center tw-gap-2 tw-shadow-lg tw-shadow-emerald-600/20">
                    <Check size={14} /> 변경사항 저장
                 </button>
               )
             )}
          </div>
        </div>

        {/* Delete Confirmation Overlay */}
        {isConfirmOpen && (
          <div className="tw-absolute tw-inset-0 tw-z-[2100] tw-bg-obsidian/90 tw-backdrop-blur-xl tw-flex tw-items-center tw-justify-center">
            <div className="tw-bg-slate-900 tw-border tw-border-white/10 tw-p-10 tw-rounded-3xl tw-max-w-md tw-text-center tw-animate-scale-in">
              <div className="tw-w-16 tw-h-16 tw-bg-red-500/10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-6">
                <Trash2 className="tw-text-red-500" size={32} />
              </div>
              <h3 className="tw-text-xl tw-font-bold tw-text-white tw-mb-2">삭제 확인</h3>
              <p className="tw-text-slate-400 tw-text-sm tw-mb-8">이 요청을 삭제하시겠습니까? 삭제된 정보는 복구할 수 없습니다.</p>
              <div className="tw-flex tw-gap-3">
                <button onClick={() => setIsConfirmOpen(false)} className="tw-flex-1 tw-py-3 tw-bg-white/5 tw-text-slate-300 tw-rounded-xl hover:tw-bg-white/10 tw-transition-all">취소</button>
                <button onClick={handleDelete} className="tw-flex-1 tw-py-3 tw-bg-red-600 tw-text-white tw-rounded-xl tw-font-bold hover:tw-bg-red-500 tw-transition-all">삭제 실행</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestDetail;
