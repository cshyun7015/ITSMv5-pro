import React, { useState, useEffect } from 'react';
import { 
  X, Edit2, RotateCcw, Clock, Shield, User, 
  FileText, Paperclip, Download, File,
  Send, Check
} from 'lucide-react';
import requestApi from './api/requestApi';
import type { RequestDTO, AttachmentDTO, RequestCommentDTO } from './api/requestApi';
import StatusStepper from './components/StatusStepper';
import Badge from './components/Badge';

interface RequestDetailProps {
  requestId: number;
  onClose: () => void;
}

const RequestDetail: React.FC<RequestDetailProps> = ({ requestId, onClose }) => {
  const [request, setRequest] = useState<RequestDTO | null>(null);
  const [comments, setComments] = useState<RequestCommentDTO[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editedData, setEditedData] = useState<Partial<RequestDTO>>({});

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const [reqRes, commRes] = await Promise.all([
        requestApi.getRequest(requestId),
        requestApi.getComments(requestId)
      ]);
      setRequest(reqRes.data);
      setComments(commRes.data);
      setEditedData(reqRes.data);
    } catch (err) {
      console.error('Failed to fetch detail', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [requestId]);

  const handleSave = async () => {
    try {
      await requestApi.updateRequest(requestId, editedData as RequestDTO);
      setIsEditing(false);
      fetchDetail();
    } catch (err) {
      console.error('Failed to save', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await requestApi.addComment(requestId, {
        authorId: 'admin_user', // Mock
        content: newComment,
        isInternal: false
      });
      setNewComment('');
      fetchDetail();
    } catch (err) {
      console.error('Failed to add comment', err);
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

  return (
    <div className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-4 tw-bg-obsidian/80 tw-backdrop-blur-md">
      <div className="tw-bg-obsidian tw-border tw-border-slate-800 tw-rounded-2xl tw-w-full tw-max-w-6xl tw-max-h-[90vh] tw-overflow-hidden tw-flex tw-flex-col tw-shadow-2xl">
        
        {/* Modal Header */}
        <div className="tw-p-4 tw-border-b tw-border-slate-800 tw-flex tw-items-center tw-justify-between tw-bg-slate-800/30">
          <div className="tw-flex tw-items-center tw-gap-3">
             <span className="tw-text-brand-400 tw-font-mono tw-text-lg">{request.reqNumber}</span>
             <h2 className="tw-text-xl tw-font-medium tw-text-white">{request.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="tw-p-2 tw-rounded-lg hover:tw-bg-slate-700 tw-text-slate-400 tw-transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="tw-flex-1 tw-overflow-y-auto tw-p-6 tw-custom-scrollbar">
          
          {/* Top Section: Stepper & Core Actions */}
          <div className="tw-mb-8">
            <StatusStepper currentStatus={request.status || 'OPEN'} />
          </div>

          {/* Main Grid Layout */}
          <div className="tw-grid tw-grid-cols-12 tw-gap-8">
            
            {/* Left: Content (8 cols) */}
            <div className="tw-col-span-8 tw-flex tw-flex-col tw-gap-8">
              
              {/* Basic Info Section */}
              <section className="tw-card tw-p-6">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-4 tw-text-brand-400">
                  <FileText size={18} />
                  <h3 className="tw-text-sm tw-font-bold tw-uppercase tw-tracking-widest">Basic Information</h3>
                </div>
                <div className="tw-space-y-6">
                  <div>
                    <label className="tw-text-[14px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block">Description</label>
                    <div className="tw-text-slate-300 tw-leading-relaxed tw-text-sm tw-bg-slate-800/20 tw-p-4 tw-rounded-lg">
                      {request.description}
                    </div>
                  </div>
                  {request.resolutionText && (
                    <div className="tw-animate-slide-up">
                      <label className="tw-text-[14px] tw-font-bold tw-text-emerald-500 tw-mb-2 tw-block">Resolution Notes</label>
                      <div className="tw-text-emerald-400/90 tw-bg-emerald-500/5 tw-border tw-border-emerald-500/10 tw-p-4 tw-rounded-lg tw-text-sm">
                        {request.resolutionText}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Attachments Section */}
              <section className="tw-card tw-p-6">
                <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                  <div className="tw-flex tw-items-center tw-gap-2 tw-text-brand-400">
                    <Paperclip size={18} />
                    <h3 className="tw-text-sm tw-font-bold tw-uppercase tw-tracking-widest">Attachments</h3>
                  </div>
                  <span className="tw-text-xs tw-text-slate-500">{request.attachments?.length || 0} Files</span>
                </div>
                <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                  {request.attachments?.map((file) => (
                    <div key={file.id} className="tw-flex tw-items-center tw-justify-between tw-bg-obsidian tw-border tw-border-slate-800 tw-p-3 tw-rounded-lg hover:tw-border-slate-600 tw-transition-all">
                      <div className="tw-flex tw-items-center tw-gap-3">
                        <div className="tw-bg-slate-800 tw-p-2 tw-rounded">
                          <File size={16} className="tw-text-brand-400" />
                        </div>
                        <div className="tw-flex tw-flex-col">
                          <span className="tw-text-xs tw-text-slate-200 tw-font-medium tw-truncate tw-max-w-[150px]">{file.fileName}</span>
                          <span className="tw-text-[10px] tw-text-slate-500">{(file.fileSize / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDownload(file.id, file.fileName)}
                        className="tw-p-2 hover:tw-bg-slate-800 tw-rounded-full tw-text-slate-400"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  ))}
                  {(!request.attachments || request.attachments.length === 0) && (
                    <div className="tw-col-span-2 tw-text-center tw-py-4 tw-text-slate-600 tw-text-sm">
                      No attachments found
                    </div>
                  )}
                </div>
              </section>

              {/* Comments Section */}
              <section className="tw-card tw-p-6">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-6 tw-text-brand-400">
                  <RotateCcw size={18} />
                  <h3 className="tw-text-sm tw-font-bold tw-uppercase tw-tracking-widest">댓글 목록</h3>
                </div>
                <div className="tw-space-y-4">
                  <div className="tw-relative group">
                    <textarea 
                      placeholder="Write operational notes or updates here..."
                      className="tw-input tw-w-full tw-min-h-[80px] tw-pr-12 tw-bg-obsidian-dark focus:tw-bg-obsidian"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button 
                      onClick={handleAddComment}
                      className="tw-absolute tw-right-3 tw-bottom-3 tw-bg-brand-600 tw-text-white tw-p-2 tw-rounded-lg hover:tw-bg-brand-700 tw-transition-all"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                  <div className="tw-space-y-4 tw-mt-6">
                    {comments.map((comment) => (
                      <div key={comment.id} className="tw-flex tw-gap-3">
                        <div className="tw-w-8 tw-h-8 tw-rounded-lg tw-bg-slate-800 tw-flex tw-items-center tw-justify-center tw-text-xs tw-font-bold tw-text-brand-400">
                          {comment.authorId.charAt(0).toUpperCase()}
                        </div>
                        <div className="tw-flex-1">
                          <div className="tw-flex tw-items-center tw-gap-2 tw-mb-1">
                            <span className="tw-text-xs tw-font-bold tw-text-slate-300">{comment.authorId}</span>
                            <span className="tw-text-[10px] tw-text-slate-500">{comment.createdAt?.replace('T', ' ')}</span>
                          </div>
                          <div className="tw-text-sm tw-text-slate-400 tw-bg-slate-800/10 tw-p-3 tw-rounded-lg tw-border tw-border-slate-800/30">
                            {comment.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Right: Sidebar (4 cols) */}
            <div className="tw-col-span-4 tw-flex tw-flex-col tw-gap-6">
              
              {/* Allocation & Ownership */}
              <section className="tw-card tw-p-5">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-6 tw-text-brand-400">
                  <User size={16} />
                  <h3 className="tw-text-xs tw-font-bold tw-uppercase tw-tracking-widest">Ownership</h3>
                </div>
                <div className="tw-space-y-5">
                  <div className="tw-flex tw-justify-between tw-items-center">
                    <span className="tw-text-[14px] tw-text-slate-500">Requester</span>
                    <span className="tw-text-sm tw-text-slate-200 tw-font-medium">{request.requesterId}</span>
                  </div>
                  <div className="tw-flex tw-justify-between tw-items-center">
                    <span className="tw-text-[14px] tw-text-slate-500">Assignee</span>
                    <div className="tw-flex tw-items-center tw-gap-2">
                       <div className="tw-w-6 tw-h-6 tw-rounded tw-bg-slate-800 tw-flex tw-items-center tw-justify-center tw-text-[10px]">
                        <Shield size={12} className="tw-text-brand-400" />
                       </div>
                       <span className="tw-text-sm tw-text-brand-400">{request.assigneeId || 'Needs Assignment'}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Assessment Section */}
              <section className="tw-card tw-p-5">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-6 tw-text-brand-400">
                  <Shield size={16} />
                  <h3 className="tw-text-xs tw-font-bold tw-uppercase tw-tracking-widest">Assessment</h3>
                </div>
                <div className="tw-space-y-6">
                  <div className="tw-flex tw-justify-between tw-items-center">
                    <span className="tw-text-[14px] tw-text-slate-500">Impact</span>
                    <Badge label={request.srImpactCode || 'MEDIUM'} type="priority" />
                  </div>
                  <div className="tw-flex tw-justify-between tw-items-center">
                    <span className="tw-text-[14px] tw-text-slate-500">Urgency</span>
                    <Badge label={request.srUrgencyCode || 'MEDIUM'} type="priority" />
                  </div>
                  <div className="tw-pt-4 tw-border-t tw-border-slate-800 tw-flex tw-justify-between tw-items-end">
                    <span className="tw-text-[14px] tw-text-slate-500">Calculated Priority</span>
                    <Badge label={request.priority || 'P3'} type="priority" className="tw-scale-110" />
                  </div>
                </div>
              </section>

              {/* SLA & Timeline */}
              <section className="tw-card tw-p-5 tw-bg-gradient-to-br tw-from-slate-800/20 tw-to-transparent">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-6 tw-text-brand-400">
                  <Clock size={16} />
                  <h3 className="tw-text-xs tw-font-bold tw-uppercase tw-tracking-widest">SLA Timeline</h3>
                </div>
                <div className="tw-space-y-4">
                  <div className="tw-bg-obsidian tw-p-3 tw-rounded-lg tw-border tw-border-slate-800">
                    <div className="tw-flex tw-justify-between tw-mb-2">
                      <span className="tw-text-[10px] tw-text-slate-500 tw-uppercase">Resolution Target</span>
                      <span className="tw-text-[10px] tw-text-emerald-500 tw-font-bold">ON TARGET</span>
                    </div>
                    <div className="tw-text-sm tw-text-slate-200">
                      {request.slaTargetAt?.replace('T', ' ').substring(0, 16)}
                    </div>
                  </div>
                  <div className="tw-bg-obsidian tw-p-3 tw-rounded-lg tw-border tw-border-slate-800">
                    <div className="tw-flex tw-justify-between tw-mb-2">
                      <span className="tw-text-[10px] tw-text-slate-500 tw-uppercase">Created At</span>
                    </div>
                    <div className="tw-text-sm tw-text-slate-400">
                       {request.createdAt?.replace('T', ' ').substring(0, 16)}
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="tw-p-4 tw-border-t tw-border-slate-800 tw-flex tw-items-center tw-justify-end tw-gap-3 tw-bg-slate-800/30">
          <button 
            onClick={onClose}
            className="tw-bg-slate-800 hover:tw-bg-slate-700 tw-text-slate-300 tw-px-6 tw-py-2 tw-rounded-lg tw-transition-all"
          >
            Cancel
          </button>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="tw-bg-brand-600 hover:tw-bg-brand-700 tw-text-white tw-px-6 tw-py-2 tw-rounded-lg tw-transition-all tw-flex tw-items-center tw-gap-2"
            >
              <Edit2 size={16} />
              Edit Request
            </button>
          ) : (
            <button 
              onClick={handleSave}
              className="tw-bg-emerald-600 hover:tw-bg-emerald-700 tw-text-white tw-px-6 tw-py-2 tw-rounded-lg tw-transition-all tw-flex tw-items-center tw-gap-2"
            >
              <Check size={16} />
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;
