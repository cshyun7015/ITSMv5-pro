import React, { useState, useRef } from 'react';
import { X, Send, Paperclip, AlertCircle, File, Trash2, UploadCloud, Plus } from 'lucide-react';
import requestApi from './api/requestApi';
import { cn } from './components/Badge';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
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
             <h2 className="tw-text-xl tw-font-bold tw-text-white">Create New Service Request</h2>
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
                <label className="tw-text-[14px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block">Request Title</label>
                <input 
                  type="text"
                  placeholder="Summarize the issue or request..."
                  className="tw-input tw-w-full tw-text-lg"
                  value={formData.title}
                  onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="tw-text-[14px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block">Detailed Description</label>
                <textarea 
                  placeholder="Provide all necessary details for the support team..."
                  className="tw-input tw-w-full tw-min-h-[150px] tw-resize-none"
                  value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  required
                />
              </div>

              {/* Upload Zone */}
              <div>
                <label className="tw-text-[14px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block">Attachments (Max 10MB per file)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="tw-border-2 tw-border-dashed tw-border-slate-800 tw-rounded-xl tw-p-6 tw-flex tw-flex-col tw-items-center tw-justify-center tw-bg-obsidian-light hover:tw-border-brand-500 hover:tw-bg-brand-500/5 tw-cursor-pointer tw-transition-all Group"
                >
                  <UploadCloud size={32} className="tw-text-slate-500 group-hover:tw-text-brand-500 tw-mb-2" />
                  <p className="tw-text-sm tw-text-slate-400">Click or Drag & Drop to upload files</p>
                  <p className="tw-text-[10px] tw-text-slate-600 tw-mt-1">Supported formats: PDF, DOCX, PNG, JPG, ZIP</p>
                  <input 
                    type="file" 
                    multiple 
                    className="tw-hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>
                
                {/* File List */}
                {files.length > 0 && (
                  <div className="tw-mt-4 tw-space-y-2">
                    {files.map((file, idx) => (
                      <div key={idx} className="tw-flex tw-items-center tw-justify-between tw-bg-slate-800/20 tw-p-2 tw-px-3 tw-rounded-lg tw-border tw-border-slate-800/50">
                        <div className="tw-flex tw-items-center tw-gap-3">
                          <File size={14} className="tw-text-brand-400" />
                          <span className="tw-text-xs tw-text-slate-300 tw-truncate tw-max-w-[200px]">{file.name}</span>
                          <span className="tw-text-[10px] tw-text-slate-600">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="tw-p-1.5 tw-text-slate-500 hover:tw-text-red-500 tw-rounded-md hover:tw-bg-red-500/10 tw-transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Categorization (5 cols) */}
            <div className="tw-col-span-12 lg:tw-col-span-5 tw-bg-slate-800/20 tw-p-6 tw-rounded-xl tw-flex tw-flex-col tw-gap-6 tw-border tw-border-slate-800/50">
              <div>
                <label className="tw-text-[14px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block">Support Type</label>
                <select 
                  className="tw-input tw-w-full"
                  value={formData.srTypeCode}
                  onChange={e => setFormData(f => ({ ...f, srTypeCode: e.target.value }))}
                >
                  <option value="INCIDENT">Incident</option>
                  <option value="SERVICE_REQUEST">Service Request</option>
                  <option value="CHANGE">Change Request</option>
                </select>
              </div>
              <div>
                <label className="tw-text-[14px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block">Category</label>
                <select 
                  className="tw-input tw-w-full"
                  value={formData.srCategoryCode}
                  onChange={e => setFormData(f => ({ ...f, srCategoryCode: e.target.value }))}
                >
                  <option value="HARDWARE">Hardware</option>
                  <option value="SOFTWARE">Software / OS</option>
                  <option value="NETWORK">Network / Infrastructure</option>
                  <option value="ACCESS">Access / Permission</option>
                </select>
              </div>
              <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-pt-4 tw-border-t tw-border-slate-800">
                <div>
                  <label className="tw-text-[14px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block">Impact</label>
                  <select 
                    className="tw-input tw-w-full"
                    value={formData.srImpactCode}
                    onChange={e => setFormData(f => ({ ...f, srImpactCode: e.target.value }))}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="tw-text-[14px] tw-font-bold tw-text-slate-500 tw-mb-2 tw-block">Urgency</label>
                  <select 
                    className="tw-input tw-w-full"
                    value={formData.srUrgencyCode}
                    onChange={e => setFormData(f => ({ ...f, srUrgencyCode: e.target.value }))}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div className="tw-mt-auto tw-p-4 tw-bg-brand-500/5 tw-border tw-border-brand-500/10 tw-rounded-lg">
                <div className="tw-flex tw-items-center tw-gap-2 tw-text-brand-500 tw-mb-2">
                  <AlertCircle size={14} />
                  <span className="tw-text-[10px] tw-font-bold tw-uppercase tw-tracking-widest">SLA Reminder</span>
                </div>
                <p className="tw-text-xs tw-text-slate-400 tw-leading-relaxed">
                  Based on your selection, the default SLA will be set to **4 hours**. High priority cases are escalated automatically.
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
            Cancel
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
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestForm;
