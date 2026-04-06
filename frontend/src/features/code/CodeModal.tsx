import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Database, Settings } from 'lucide-react';
import { apiCommonCode } from './api/apiCommonCode';
import type { CommonCode } from './api/apiCommonCode';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    groupId: string;
    initialData?: CommonCode;
}

const CodeModal: React.FC<Props> = ({ isOpen, onClose, onSaved, groupId, initialData }) => {
    const [formData, setFormData] = useState<CommonCode>({
        groupId: groupId,
        codeId: '',
        codeName: '',
        description: '',
        sortOrder: 0,
        isActive: true
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                groupId: groupId,
                codeId: '',
                codeName: '',
                description: '',
                sortOrder: 0,
                isActive: true
            });
        }
    }, [initialData, groupId, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            if (initialData?.id) {
                await apiCommonCode.updateCode(initialData.id, formData);
            } else {
                await apiCommonCode.createCode(formData);
            }
            onSaved();
            onClose();
        } catch (err) {
            alert('코드 항목 저장에 실패했습니다. ID 중복 여부를 확인해 주세요.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="tw-fixed tw-inset-0 tw-z-[3000] tw-flex tw-items-start tw-justify-center tw-p-6 tw-pt-32">
            <motion.div 
                className="tw-absolute tw-inset-0 tw-bg-black/90 tw-backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />
            <motion.div 
                className="tw-relative tw-bg-[#0f172a] tw-border tw-border-white/10 tw-w-full tw-max-w-2xl tw-rounded-[40px] tw-shadow-2xl tw-overflow-hidden"
                initial={{ scale: 0.95, opacity: 0, y: 0 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
                <div className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-1.5 tw-bg-slate-500" />
                
                <header className="tw-p-8 tw-border-b tw-border-white/5 tw-flex tw-justify-between tw-items-center tw-bg-white/[0.02]">
                    <div className="tw-flex tw-items-center tw-gap-4">
                        <div className="tw-p-3 tw-bg-slate-800 tw-rounded-2xl tw-text-slate-400">
                            <Database size={24} />
                        </div>
                        <div>
                            <span className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest">{groupId} 그룹의 하위 코드</span>
                            <h2 className="tw-text-xl tw-font-bold tw-text-white">{initialData ? '코드 상세 정보 수정' : '신규 코드 항목 등록'}</h2>
                        </div>
                    </div>
                    <button className="tw-p-3 hover:tw-bg-white/5 tw-rounded-2xl tw-text-slate-500 hover:tw-text-white tw-transition-all" onClick={onClose}>
                        <X size={24} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="tw-p-10 tw-grid tw-gap-8">
                    <div className="tw-grid tw-grid-cols-2 tw-gap-6">
                        <div className="tw-grid tw-gap-2">
                            <label className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-px-1">코드 식별자</label>
                            <input 
                                type="text"
                                value={formData.codeId}
                                onChange={e => setFormData({...formData, codeId: e.target.value.toUpperCase().replace(/\s/g, '_')})}
                                disabled={!!initialData}
                                placeholder="고유 하위 ID"
                                className="tw-w-full tw-bg-white/[0.03] tw-border tw-border-white/5 tw-px-4 tw-py-3 tw-rounded-xl tw-text-slate-100 tw-font-mono tw-text-sm focus:tw-bg-white/[0.05] focus:tw-border-slate-500 tw-transition-all outline-none"
                                required
                                data-testid="code-id-input"
                            />
                        </div>
                        <div className="tw-grid tw-gap-2">
                            <label className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-px-1">정렬 순서</label>
                            <input 
                                type="number"
                                value={formData.sortOrder}
                                onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                                className="tw-w-full tw-bg-white/[0.03] tw-border tw-border-white/5 tw-px-4 tw-py-3 tw-rounded-xl tw-text-slate-100 tw-text-sm focus:tw-bg-white/[0.05] focus:tw-border-slate-500 tw-transition-all outline-none"
                                required
                                data-testid="code-sort-input"
                            />
                        </div>
                    </div>

                    <div className="tw-grid tw-gap-2">
                        <label className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-px-1">표시 이름</label>
                        <input 
                            type="text"
                            value={formData.codeName}
                            onChange={e => setFormData({...formData, codeName: e.target.value})}
                            placeholder="화면 표시 이름"
                            className="tw-w-full tw-bg-white/[0.03] tw-border tw-border-white/5 tw-px-4 tw-py-3 tw-rounded-xl tw-text-slate-100 tw-text-sm focus:tw-bg-white/[0.05] focus:tw-border-slate-500 tw-transition-all outline-none"
                            required
                            data-testid="code-name-input"
                        />
                    </div>

                    <div className="tw-grid tw-gap-2">
                        <label className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-px-1">상세 설명</label>
                        <textarea 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="코드 항목의 용도와 의미를 입력하세요."
                            className="tw-w-full tw-bg-white/[0.03] tw-border tw-border-white/10 tw-px-4 tw-py-3 tw-rounded-xl tw-text-slate-300 tw-text-sm tw-h-24 tw-resize-none focus:tw-bg-white/[0.05] focus:tw-border-slate-500 tw-transition-all outline-none"
                            data-testid="code-desc-input"
                        />
                    </div>

                    <div className="tw-p-6 tw-bg-slate-800/50 tw-border tw-border-white/5 tw-rounded-3xl tw-flex tw-items-center tw-gap-4">
                        <input 
                            type="checkbox"
                            id="isActiveCode"
                            checked={formData.isActive}
                            onChange={e => setFormData({...formData, isActive: e.target.checked})}
                            className="tw-w-6 tw-h-6 tw-rounded-lg tw-bg-slate-900 tw-border tw-border-white/10 tw-accent-slate-500 tw-cursor-pointer"
                            data-testid="code-active-checkbox"
                        />
                        <div className="tw-flex tw-items-center tw-gap-3">
                            <Settings size={18} className="tw-text-slate-500" />
                            <label htmlFor="isActiveCode" className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-cursor-pointer">
                                시스템 활성화 상태 (Active / Inactive)
                            </label>
                        </div>
                    </div>

                    <div className="tw-pt-6 tw-flex tw-gap-4">
                        <button 
                            type="button" 
                            className="tw-flex-1 tw-py-4 tw-bg-white/5 hover:tw-bg-white/10 tw-text-slate-300 hover:tw-text-white tw-rounded-2xl tw-text-sm tw-font-bold tw-transition-all"
                            onClick={onClose}
                        >
                            취소
                        </button>
                        <button 
                            type="submit" 
                            className="tw-flex-1 tw-py-4 tw-bg-slate-100 hover:tw-bg-white tw-text-slate-900 tw-rounded-2xl tw-text-sm tw-font-bold tw-transition-all tw-flex tw-items-center tw-justify-center tw-gap-2"
                            disabled={isSaving}
                            data-testid="code-submit-btn"
                        >
                            <Save size={16} /> {isSaving ? '동기화 중...' : (initialData ? '변경 사항 저장' : '신규 등록')}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default CodeModal;
