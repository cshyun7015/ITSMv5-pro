import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, Save, AlertTriangle } from 'lucide-react';
import { apiCommonCode } from './api/apiCommonCode';
import type { CodeGroup } from './api/apiCommonCode';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    initialData?: CodeGroup;
}

const CodeGroupModal: React.FC<Props> = ({ isOpen, onClose, onSaved, initialData }) => {
    const [formData, setFormData] = useState<CodeGroup>({
        groupId: '',
        name: '',
        description: '',
        isSystem: false
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                groupId: '',
                name: '',
                description: '',
                isSystem: false
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            if (initialData) {
                await apiCommonCode.updateGroup(initialData.groupId, formData);
            } else {
                await apiCommonCode.createGroup(formData);
            }
            onSaved();
            onClose();
        } catch (err) {
            alert('코드 그룹 저장에 실패했습니다. 이미 존재하는 ID일 수 있습니다.');
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
                className="tw-relative tw-bg-[#0f172a] tw-border tw-border-white/10 tw-w-full tw-max-w-xl tw-rounded-[40px] tw-shadow-2xl tw-overflow-hidden"
                initial={{ scale: 0.95, opacity: 0, y: 0 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
                <div className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-1.5 tw-bg-slate-500" />
                
                <header className="tw-p-8 tw-border-b tw-border-white/5 tw-flex tw-justify-between tw-items-center tw-bg-white/[0.02]">
                    <div className="tw-flex tw-items-center tw-gap-4">
                        <div className="tw-p-3 tw-bg-slate-800 tw-rounded-2xl tw-text-slate-400">
                            <Shield size={24} />
                        </div>
                        <div>
                            <span className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest">마스터 메타데이터</span>
                            <h2 className="tw-text-xl tw-font-bold tw-text-white">{initialData ? '코드 그룹 정보 수정' : '신규 그룹 마스터 등록'}</h2>
                        </div>
                    </div>
                    <button className="tw-p-3 hover:tw-bg-white/5 tw-rounded-2xl tw-text-slate-500 hover:tw-text-white tw-transition-all" onClick={onClose}>
                        <X size={24} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="tw-p-10 tw-grid tw-gap-8">
                    <div className="tw-grid tw-gap-2">
                        <label className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-px-1">그룹 식별 ID</label>
                        <input 
                            type="text"
                            value={formData.groupId}
                            onChange={e => setFormData({...formData, groupId: e.target.value.toUpperCase()})}
                            disabled={!!initialData}
                            placeholder="고유 마스터 ID (예: ERR_LEVEL)"
                            className="tw-w-full tw-bg-white/[0.03] tw-border tw-border-white/5 tw-px-4 tw-py-3 tw-rounded-xl tw-text-slate-100 tw-font-mono tw-text-sm tw-placeholder-slate-700 focus:tw-bg-white/[0.05] focus:tw-border-slate-500 tw-transition-all outline-none"
                            required
                        />
                    </div>

                    <div className="tw-grid tw-gap-2">
                        <label className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-px-1">화면 표시 이름</label>
                        <input 
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            placeholder="운영자에게 표시될 이름"
                            className="tw-w-full tw-bg-white/[0.03] tw-border tw-border-white/5 tw-px-4 tw-py-3 tw-rounded-xl tw-text-slate-100 tw-text-sm tw-placeholder-slate-700 focus:tw-bg-white/[0.05] focus:tw-border-slate-500 tw-transition-all outline-none"
                            required
                        />
                    </div>

                    <div className="tw-grid tw-gap-2">
                        <label className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-px-1">상세 설명</label>
                        <textarea 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="코드 그룹에 대한 상세 설명을 입력하세요."
                            className="tw-w-full tw-bg-white/[0.03] tw-border tw-border-white/10 tw-px-4 tw-py-3 tw-rounded-xl tw-text-slate-300 tw-text-sm tw-h-32 tw-resize-none tw-placeholder-slate-700 focus:tw-bg-white/[0.05] focus:tw-border-slate-500 tw-transition-all outline-none"
                        />
                    </div>

                    <div className="tw-p-6 tw-bg-slate-800/50 tw-border tw-border-white/5 tw-rounded-3xl tw-flex tw-items-center tw-gap-4">
                        <input 
                            type="checkbox"
                            id="isSystem"
                            checked={formData.isSystem}
                            onChange={e => setFormData({...formData, isSystem: e.target.checked})}
                            className="tw-w-6 tw-h-6 tw-rounded-lg tw-bg-slate-900 tw-border tw-border-white/10 tw-accent-slate-500 tw-cursor-pointer"
                        />
                        <div className="tw-flex tw-items-center tw-gap-3">
                            <AlertTriangle size={18} className="tw-text-amber-500/50" />
                            <label htmlFor="isSystem" className="tw-text-xs tw-font-semibold tw-text-slate-400 tw-cursor-pointer">
                                시스템 보호 모드 활성화 (삭제 제한)
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
                        >
                            <Save size={16} /> {isSaving ? '처리 중...' : (initialData ? '정보 업데이트' : '신규 등록 확인')}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default CodeGroupModal;
