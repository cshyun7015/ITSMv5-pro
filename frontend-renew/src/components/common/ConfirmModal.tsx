import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import { useAuthStore } from '../../core/auth/useAuthStore';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (hardDelete: boolean) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isDangerous?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = '확인',
  isDangerous = false,
}) => {
  const { tenantId } = useAuthStore();
  const [hardDelete, setHardDelete] = useState(false);
  const isMsp = tenantId === 'MSP' || tenantId === 'SYSTEM';

  const handleConfirm = () => {
    onConfirm(hardDelete);
    setHardDelete(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl ${isDangerous ? 'bg-red-400/10 text-red-400' : 'bg-amber-400/10 text-amber-400'}`}>
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
              {message}
            </p>
          </div>
        </div>

        {isMsp && isDangerous && (
          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={hardDelete}
                onChange={(e) => setHardDelete(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-cyan-500/50 transition-all cursor-pointer"
              />
              <span className="text-xs font-bold text-text-muted group-hover:text-white transition-colors">
                데이터베이스에서 물리적으로 즉시 삭제 (복구 불가)
              </span>
            </label>
            {hardDelete && (
              <p className="text-[10px] text-red-400 font-medium animate-pulse">
                ※ 주의: 이 옵션을 선택하면 논리 삭제(is_deleted)를 우회하여 데이터가 영구 제거됩니다.
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-text-muted hover:text-white hover:bg-white/5 transition-all"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg ${
              isDangerous 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20 text-white' 
                : 'bg-brand-primary text-white shadow-brand-primary/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
