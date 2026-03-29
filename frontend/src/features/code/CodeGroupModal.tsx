import React, { useState, useEffect } from 'react';
import { apiCommonCode } from '../../api/apiCommonCode';
import type { CodeGroup } from '../../api/apiCommonCode';

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
        <div className="modal-overlay animate-fade-in" style={{ zIndex: 2000 }}>
            <div className="modal-content glass-card animate-scale-in" style={{ width: '550px' }}>
                <header className="modal-header">
                    <div>
                        <span style={{ fontSize: '10px', color: 'var(--brand-primary)', fontWeight: 800 }}>CODE MANAGEMENT</span>
                        <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{initialData ? '코드 그룹 수정' : '신규 코드 그룹 등록'}</h2>
                    </div>
                    <button className="btn-close" onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', opacity: 0.5 }}>&times;</button>
                </header>
                
                <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
                    <div className="form-group">
                        <label>그룹 ID (Unique ID)</label>
                        <input 
                            type="text"
                            value={formData.groupId}
                            onChange={e => setFormData({...formData, groupId: e.target.value.toUpperCase()})}
                            disabled={!!initialData}
                            placeholder="예: REQUEST_STATUS"
                            required
                            style={{ fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>그룹명 (Display Name)</label>
                        <input 
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            placeholder="예: 요청 상태 코드"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>설명</label>
                        <textarea 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="해당 코드 그룹의 용도에 대해 설명력을 높여주세요."
                            style={{ height: '100px', resize: 'none' }}
                        />
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.1)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                        <input 
                            type="checkbox"
                            id="isSystem"
                            checked={formData.isSystem}
                            onChange={e => setFormData({...formData, isSystem: e.target.checked})}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <label htmlFor="isSystem" style={{ margin: 0, cursor: 'pointer', fontSize: '13px', color: 'white' }}>시스템 보호 그룹 (삭제 불가)</label>
                    </div>

                    <div className="modal-footer" style={{ marginTop: '32px', padding: '0' }}>
                        <button type="button" className="btn-secondary" onClick={onClose} style={{ minWidth: '120px', height: '44px', borderRadius: '12px', fontWeight: 700 }}>취소</button>
                        <button type="submit" className="btn-primary" disabled={isSaving} style={{ minWidth: '120px', height: '44px', borderRadius: '12px', fontWeight: 700 }}>
                            {isSaving ? '보내는 중...' : (initialData ? '수정 완료' : '등록 확인')}
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

export default CodeGroupModal;
