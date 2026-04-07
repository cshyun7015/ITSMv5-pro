import React from 'react';
import { createPortal } from 'react-dom';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'info' | 'warning';
}

/**
 * 프로젝트 표준 확인 다이얼로그 (Confirm Dialog)
 * - [표준화] base.css의 .modal-* 클래스 체계를 준수
 * - [한글화] 기본 라벨 한국어 설정
 * - [Portal] DOM 최상단 렌더링으로 레이어 간섭 방지
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="modal-header">
          <h3 className="text-sm font-black text-text-primary tracking-tight italic uppercase">
            {title}
          </h3>
          <button 
            onClick={onCancel}
            className="text-text-muted hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4 ${
            variant === 'danger' ? 'bg-status-critical/10 text-status-critical' : 
            variant === 'warning' ? 'bg-status-high/10 text-status-high' : 
            'bg-brand-primary/10 text-brand-primary'
          }`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed font-medium">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button 
            onClick={onCancel}
            className="btn-md btn-secondary flex-1 font-bold"
          >
            {cancelLabel}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`btn-md flex-[2] font-black ${
              variant === 'danger' ? 'bg-status-critical text-white hover:brightness-110 shadow-lg shadow-status-critical/20' : 
              variant === 'warning' ? 'bg-status-high text-black hover:brightness-110 shadow-lg shadow-status-high/20' : 
              'btn-primary'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDialog;
