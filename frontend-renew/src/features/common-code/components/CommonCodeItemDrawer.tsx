import React, { useEffect, useState } from 'react';
import { CommonCode } from '../types/CommonCodeTypes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CommonCode>) => void;
  groupId: string;
  initialData?: CommonCode | null;
  isSubmitting?: boolean;
}

/**
 * 코드 아이템 등록/수정 전용 Drawer (Slide-over)
 * - [표준화] base.css의 .drawer-* 클래스 체계를 100% 준수
 * - [한글화] 모든 라벨 및 버튼 한국어 전환
 */
const CommonCodeItemDrawer: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  groupId,
  initialData,
  isSubmitting 
}) => {
  const [formData, setFormData] = useState<Partial<CommonCode>>({
    codeId: '',
    codeName: '',
    sortOrder: 10,
    isActive: true,
    description: '',
    groupId: groupId,
  });

  useEffect(() => {
    if (initialData && initialData.id) {
      setFormData(initialData);
    } else {
      setFormData({
        codeId: '',
        codeName: '',
        sortOrder: 10,
        isActive: true,
        description: '',
        groupId: groupId,
      });
    }
  }, [initialData, isOpen, groupId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, groupId });
  };

  const isEdit = !!initialData?.id;

  return (
    <div className={`fixed inset-0 z-[100] transition-all duration-300 ${isOpen ? 'visible' : 'invisible'}`}>
      <div 
        className={`drawer-overlay ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <aside className={`drawer-content transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* 표준 Header */}
        <div className="drawer-header">
          <div>
            <h2 className="text-xl font-black text-text-primary tracking-tight italic">
              {isEdit ? '코드 정보 수정' : '새 코드 아이템 추가'}
            </h2>
            <p className="text-[10px] text-brand-primary font-mono mt-1 font-bold uppercase tracking-widest leading-none">
              ITEM_DETAIL_OF: {groupId}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-text-muted transition-colors"
          >
            <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 표준 Body */}
        <div className="drawer-body">
          <form className="space-y-6">
            <div className="form-group">
              <label className="label-base label-required">코드 ID</label>
              <input 
                type="text"
                required
                disabled={isEdit}
                className="input-base font-mono uppercase focus:border-brand-primary/50 disabled:opacity-40 disabled:cursor-not-allowed"
                placeholder="예: ROLE_OPER"
                value={formData.codeId}
                onChange={(e) => setFormData({ ...formData, codeId: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="form-group">
              <label className="label-base label-required">코드 명칭</label>
              <input 
                type="text"
                required
                className="input-base"
                placeholder="예: 운영 관리자"
                value={formData.codeName}
                onChange={(e) => setFormData({ ...formData, codeName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="form-group">
                <label className="label-base">정렬 순서</label>
                <input 
                  type="number"
                  required
                  className="input-base h-10"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="label-base">활성 상태</label>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`btn-base h-10 w-full border font-bold text-xs ${formData.isActive ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' : 'bg-white/5 border-white/10 text-text-muted'}`}
                >
                  {formData.isActive ? '활성 (Active)' : '비활성 (Disabled)'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="label-base">설명</label>
              <textarea 
                rows={4}
                className="input-base h-auto py-3 resize-none"
                placeholder="코드 항목에 대한 상세 내용을 입력하세요..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </form>
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
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-md btn-primary grow-[2] font-black shadow-xl shadow-brand-primary/20"
          >
            {isSubmitting ? '처리 중...' : (isEdit ? '코드 정보 변경' : '아이템 등록')}
          </button>
        </div>
      </aside>
    </div>
  );
};

export default CommonCodeItemDrawer;
