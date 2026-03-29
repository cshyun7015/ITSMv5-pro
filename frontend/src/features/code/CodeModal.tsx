import React, { useState, useEffect } from 'react';
import { apiCommonCode } from '../../api/apiCommonCode';
import type { CommonCode } from '../../api/apiCommonCode';

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
        <div className="modal-overlay animate-fade-in" style={{ zIndex: 2000 }}>
            <div className="modal-content glass-card animate-scale-in" style={{ width: '600px' }}>
                <header className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div>
                            <span style={{ fontSize: '10px', color: 'var(--brand-primary)', fontWeight: 800 }}>MEMBER OF {groupId}</span>
                            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{initialData ? '코드 상세 수정' : '신규 코드 항목 등록'}</h2>
                        </div>
                    </div>
                    <button className="btn-close" onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', opacity: 0.5 }}>&times;</button>
                </header>
                
                <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '24px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>코드 ID (Unique Code)</label>
                            <input 
                                type="text"
                                value={formData.codeId}
                                onChange={e => setFormData({...formData, codeId: e.target.value.toUpperCase().replace(/\s/g, '_')})}
                                disabled={!!initialData}
                                placeholder="예: ROLE_GUEST"
                                required
                                style={{ fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>표시 순서 (Sort)</label>
                            <input 
                                type="number"
                                value={formData.sortOrder}
                                onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>코드명 (Display Name)</label>
                        <input 
                            type="text"
                            value={formData.codeName}
                            onChange={e => setFormData({...formData, codeName: e.target.value})}
                            placeholder="예: 게스트 사용자"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>설명</label>
                        <textarea 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="해당 코드에 대한 구체적인 용도나 의미를 기술해 주세요."
                            style={{ height: '80px', resize: 'none' }}
                        />
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                        <input 
                            type="checkbox"
                            id="isActiveCode"
                            checked={formData.isActive}
                            onChange={e => setFormData({...formData, isActive: e.target.checked})}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <label htmlFor="isActiveCode" style={{ margin: 0, cursor: 'pointer', fontSize: '13px', color: 'white' }}>현재 활성화 상태 (시스템 노출 여부)</label>
                    </div>

                    <div className="modal-footer" style={{ marginTop: '32px', padding: '0' }}>
                        <button type="button" className="btn-secondary" onClick={onClose} style={{ minWidth: '120px', height: '44px', borderRadius: '12px', fontWeight: 700 }}>취소</button>
                        <button type="submit" className="btn-primary" disabled={isSaving} style={{ minWidth: '120px', height: '44px', borderRadius: '12px', fontWeight: 700 }}>
                            {isSaving ? '저장 중...' : (initialData ? '수정 완료' : '등록 확인')}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                .btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: white; cursor: pointer; transition: all 0.2s; }
                .btn-secondary:hover { background: rgba(255,255,255,0.1); }
                .btn-primary { background: linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-secondary))); border: none; color: white; cursor: pointer; transition: all 0.2s; }
                .btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
                .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default CodeModal;
