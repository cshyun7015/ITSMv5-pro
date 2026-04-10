import React, { useEffect, useState } from 'react';
import { CodeGroup } from '../types/CommonCodeTypes';
import { ShieldCheck, Edit3 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CodeGroup>) => void;
  initialData?: CodeGroup | null;
  isSubmitting?: boolean;
}

/**
 * 코드 그룹 등록/수정 전용 Drawer (Slide-over)
 * - [표준화] base.css의 .drawer-* 클래스 체계를 100% 준수
 * - [한글화] 모든 라벨 및 버튼 한국어 전환
 * - [가학성] invisible 제어 로직 추가로 비활성 시 잔상 원천 차단
 */
const CommonCodeGroupDrawer: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  isSubmitting 
}) => {
  const [formData, setFormData] = useState<Partial<CodeGroup>>({
    groupId: '',
    name: '',
    description: '',
    isSystem: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        groupId: '',
        name: '',
        description: '',
        isSystem: false,
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEdit = !!initialData?.groupId;

  return (
    <div className={`fixed inset-0 z-[100] transition-all duration-300 ${isOpen ? 'visible' : 'invisible'}`}>
      {/* 표준 Overlay */}
      <div 
        className={`drawer-overlay ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* 표준 Drawer 컨텐츠 영역 */}
      <aside className={`drawer-content transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* 표준 Header */}
        <div className="drawer-header">
          <div>
            <h2 className="text-xl font-black text-text-primary tracking-tight italic">
              {isEdit ? '코드 그룹 수정' : '새 코드 그룹 등록'}
            </h2>
            <p className="text-[10px] text-brand-primary font-mono mt-1 font-bold uppercase tracking-widest">
              Standard Code Master Definition
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-text-muted transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 표준 Body */}
        <div className="drawer-body">
          <form className="space-y-6">
            {/* Group ID */}
            <div className="form-group">
              <label className="label-base label-required">그룹 ID (코드)</label>
              <input 
                type="text"
                required
                disabled={isEdit}
                className="input-base font-mono uppercase focus:border-brand-primary/50 disabled:opacity-40 disabled:cursor-not-allowed"
                placeholder="예: REQUEST_STATUS"
                value={formData.groupId}
                onChange={(e) => setFormData({ ...formData, groupId: e.target.value.toUpperCase() })}
              />
              {!isEdit && <p className="text-[10px] text-text-muted italic px-1 mt-1">* 영문 대문자, 언더바(_) 조합 권장</p>}
            </div>

            {/* Group Name */}
            <div className="form-group">
              <label className="label-base label-required">그룹 명칭</label>
              <input 
                type="text"
                required
                className="input-base"
                placeholder="예: 요청 처리 상태"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="label-base">설명</label>
              <textarea 
                rows={4}
                className="input-base h-auto py-3 resize-none"
                placeholder="코드 그룹에 대한 상세 용도를 입력하세요..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* isSystem toggle */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 mt-4">
              <div>
                <h4 className="text-sm font-bold text-text-primary">시스템 필수 코드</h4>
                <p className="text-[10px] text-text-muted">사용자 삭제 및 수정을 제한하는 읽기 전용 여부</p>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, isSystem: !formData.isSystem })}
                className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${formData.isSystem ? 'bg-brand-primary shadow-lg shadow-brand-primary/20' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${formData.isSystem ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </form>

          {/* Metadata Cards (Edit 모드에서만 노출) */}
          {isEdit && initialData && (
            <div className="grid grid-cols-2 gap-4 mt-10 pt-10 border-t border-white/5 animate-slide-up">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck size={14} className="text-brand-primary" />
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-white/40">System Metadata</h4>
                </div>
                <div className="space-y-2.5">
                  <MetaItem label="Group Key" value={initialData.groupId} isMono />
                  <MetaItem label="System Code" value={initialData.isSystem ? 'YES' : 'NO'} isStatus />
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Edit3 size={14} className="text-amber-400" />
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-white/40">Audit Information</h4>
                </div>
                <div className="space-y-2.5">
                  <MetaItem label="Created At" value={initialData.createdAt} isDate />
                  <MetaItem label="Created By" value={initialData.createdBy} />
                  <MetaItem label="Updated At" value={initialData.updatedAt} isDate />
                  <MetaItem label="Updated By" value={initialData.updatedBy} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 표준 Footer */}
        <div className="drawer-footer">
          <button 
            type="button"
            onClick={onClose}
            className="btn-md btn-secondary flex-1 font-black"
          >
            취소
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-md btn-primary grow-[2] font-black shadow-xl shadow-brand-primary/20"
          >
            {isSubmitting ? '저장 중...' : (isEdit ? '변경사항 저장' : '그룹 등록')}
          </button>
        </div>
      </aside>
    </div>
  );
};

const MetaItem: React.FC<{ label: string; value: any; isMono?: boolean; isDate?: boolean; isStatus?: boolean }> = ({ 
  label, value, isMono, isDate, isStatus 
}) => (
  <div className="flex items-center justify-between text-[9px]">
    <span className="text-text-muted font-bold uppercase tracking-tighter">{label}</span>
    <span className={`
      ${isMono ? 'font-mono text-cyan-400' : 'text-text-secondary'}
      ${isStatus ? 'px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary rounded-full font-black' : ''}
    `}>
      {isDate ? (value ? new Date(value).toLocaleString() : 'N/A') : (value?.toString() || 'N/A')}
    </span>
  </div>
);

export default CommonCodeGroupDrawer;
