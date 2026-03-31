import React, { useRef } from 'react';
import { Paperclip, UploadCloud, File, Trash2, Download } from 'lucide-react';
import type { AttachmentDTO } from '../api/requestApi';

interface RequestAttachmentsProps {
  attachments?: AttachmentDTO[];
  pendingFiles?: File[];
  onUpload?: (file: File) => void;
  onDelete?: (id: number) => void;
  onRemovePending?: (idx: number) => void;
  onDownload?: (id: number, fileName: string) => void;
  canEdit?: boolean;
}

const RequestAttachments: React.FC<RequestAttachmentsProps> = ({
  attachments = [],
  pendingFiles = [],
  onUpload,
  onDelete,
  onRemovePending,
  onDownload,
  canEdit = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onUpload) {
      Array.from(e.target.files).forEach(file => onUpload(file));
      // Reset input so same file can be uploaded again if removed
      e.target.value = '';
    }
  };

  return (
    <section className="tw-card tw-p-6">
      <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
        <div className="tw-flex tw-items-center tw-gap-2 tw-text-brand-400">
          <Paperclip size={18} />
          <h3 className="tw-text-sm tw-font-bold tw-uppercase tw-tracking-widest">첨부 파일</h3>
        </div>
        <span className="tw-text-xs tw-text-slate-500">
          {attachments.length + pendingFiles.length}개의 파일
        </span>
      </div>

      {canEdit && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="tw-mb-4 tw-border-2 tw-border-dashed tw-border-slate-800 tw-rounded-xl tw-p-4 tw-flex tw-flex-col tw-items-center tw-justify-center tw-bg-obsidian-light hover:tw-border-brand-500 hover:tw-bg-brand-500/5 tw-cursor-pointer tw-transition-all group"
        >
          <UploadCloud size={24} className="tw-text-slate-500 group-hover:tw-text-brand-500 tw-mb-1" />
          <p className="tw-text-xs tw-text-slate-400">클릭하여 파일 업로드 (최대 10MB)</p>
          <input 
            type="file" 
            multiple 
            className="tw-hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
      )}

      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-3">
        {/* Existing Attachments */}
        {attachments.map((file) => (
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
            <div className="tw-flex tw-gap-1">
              {onDownload && (
                <button 
                  onClick={() => onDownload(file.id, file.fileName)}
                  className="tw-p-2 hover:tw-bg-slate-800 tw-rounded-full tw-text-slate-400"
                >
                  <Download size={14} />
                </button>
              )}
              {canEdit && onDelete && (
                <button 
                  onClick={() => onDelete(file.id)}
                  className="tw-p-2 hover:tw-bg-red-500/10 tw-rounded-full tw-text-slate-500 hover:tw-text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Pending Files */}
        {pendingFiles.map((file, idx) => (
          <div key={`pending-${idx}`} className="tw-flex tw-items-center tw-justify-between tw-bg-slate-800/20 tw-border tw-border-brand-500/30 tw-p-3 tw-rounded-lg">
            <div className="tw-flex tw-items-center tw-gap-3">
              <div className="tw-bg-brand-500/10 tw-p-2 tw-rounded">
                <UploadCloud size={16} className="tw-text-brand-500" />
              </div>
              <div className="tw-flex tw-flex-col">
                <span className="tw-text-xs tw-text-brand-400 tw-font-medium tw-truncate tw-max-w-[150px]">{file.name}</span>
                <span className="tw-text-[10px] tw-text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
            </div>
            {onRemovePending && (
              <button 
                onClick={() => onRemovePending(idx)}
                className="tw-p-2 hover:tw-bg-red-500/10 tw-rounded-full tw-text-slate-500 hover:tw-text-red-500"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}

        {attachments.length === 0 && pendingFiles.length === 0 && (
          <div className="tw-col-span-full tw-text-center tw-py-8 tw-text-slate-600 tw-text-sm">
            첨부된 파일이 없습니다.
          </div>
        )}
      </div>
    </section>
  );
};

export default RequestAttachments;
