import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/apiRequest';
import { apiCommonCode, type CommonCode } from '../../api/apiCommonCode';
import type { RequestItem } from '../../api/apiRequest';
import './Request.css';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

const RequestForm: React.FC<Props> = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState<Partial<RequestItem>>({
        title: '',
        description: '',
        srTypeCode: 'SERVICE_REQUEST',
        srCategoryCode: 'SOFTWARE',
        srImpactCode: 'LOW',
        srUrgencyCode: 'LOW',
        priority: 'P4',
        companyId: localStorage.getItem('companyId') || 'SYSTEM',
        requesterId: localStorage.getItem('userId') || 'admin',
        status: 'OPEN'
    });

    const [codes, setCodes] = useState<{ [key: string]: CommonCode[] }>({
        SR_TYPE: [],
        SR_CATEGORY: [],
        SR_IMPACT: [],
        SR_URGENCY: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadCodes();
    }, []);

    const loadCodes = async () => {
        try {
            const [types, categories, impacts, urgencies] = await Promise.all([
                apiCommonCode.getCodesByGroup('SR_TYPE'),
                apiCommonCode.getCodesByGroup('SR_CATEGORY'),
                apiCommonCode.getCodesByGroup('SR_IMPACT'),
                apiCommonCode.getCodesByGroup('SR_URGENCY')
            ]);
            setCodes({
                SR_TYPE: types.data,
                SR_CATEGORY: categories.data,
                SR_IMPACT: impacts.data,
                SR_URGENCY: urgencies.data
            });
        } catch (err) {
            console.error('Failed to load codes', err);
        }
    };

    const calculatePriority = (impact: string, urgency: string) => {
        if (impact === 'HIGH') {
            if (urgency === 'HIGH') return 'P1';
            if (urgency === 'MEDIUM') return 'P2';
            return 'P3';
        } else if (impact === 'MEDIUM') {
            if (urgency === 'HIGH') return 'P2';
            if (urgency === 'MEDIUM') return 'P3';
            return 'P4';
        } else {
            if (urgency === 'HIGH') return 'P3';
            return 'P4';
        }
    };

    useEffect(() => {
        const newPriority = calculatePriority(formData.srImpactCode || 'LOW', formData.srUrgencyCode || 'LOW');
        if (formData.priority !== newPriority) {
            setFormData(prev => ({ ...prev, priority: newPriority }));
        }
    }, [formData.srImpactCode, formData.srUrgencyCode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await apiRequest.createRequest(formData as RequestItem);
            onSuccess();
        } catch (err) {
            alert('요청 등록에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay animate-fade-in">
            <div className="modal-content glass-card animate-scale-in" style={{ width: '800px', padding: '0' }}>
                <header className="panel-header" style={{ padding: '24px 40px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ fontSize: '11px', color: 'var(--brand-primary)', fontWeight: 800, marginBottom: '4px', display: 'block' }}>NEW REQUEST</span>
                        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>신규 서비스 요청 등록</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            type="button"
                            className="btn-secondary" 
                            onClick={onClose}
                            style={{ minWidth: '120px', height: '44px', padding: '0 32px', borderRadius: '12px', fontSize: '14px', fontWeight: 700 }}
                        >
                            목록
                        </button>
                        <button 
                            type="button"
                            className="btn-primary" 
                            onClick={(e) => handleSubmit(e as any)}
                            disabled={isSubmitting}
                            style={{ minWidth: '120px', height: '44px', padding: '0 32px', borderRadius: '12px', fontSize: '14px', fontWeight: 700 }}
                        >
                            {isSubmitting ? '등록 중...' : '등록'}
                        </button>
                    </div>
                </header>

                <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
                    <div className="form-group" style={{ marginBottom: '32px' }}>
                        <label>요청 제목</label>
                        <input 
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            placeholder="요청 내용의 핵심 요약을 입력하세요."
                            required
                            style={{ width: '100%', padding: '12px 16px', fontSize: '16px' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                        <div className="form-group">
                            <label>요청 유형</label>
                            <select 
                                value={formData.srTypeCode}
                                onChange={e => setFormData({...formData, srTypeCode: e.target.value})}
                            >
                                {codes.SR_TYPE.map(c => (
                                    <option key={c.codeId} value={c.codeId}>{c.codeName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>서비스 카테고리</label>
                            <select 
                                value={formData.srCategoryCode}
                                onChange={e => setFormData({...formData, srCategoryCode: e.target.value})}
                            >
                                {codes.SR_CATEGORY.map(c => (
                                    <option key={c.codeId} value={c.codeId}>{c.codeName}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                        <div className="form-group">
                            <label>영향도 (Impact)</label>
                            <select 
                                value={formData.srImpactCode}
                                onChange={e => setFormData({...formData, srImpactCode: e.target.value})}
                            >
                                {codes.SR_IMPACT.map(c => (
                                    <option key={c.codeId} value={c.codeId}>{c.codeName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>긴급도 (Urgency)</label>
                            <select 
                                value={formData.srUrgencyCode}
                                onChange={e => setFormData({...formData, srUrgencyCode: e.target.value})}
                            >
                                {codes.SR_URGENCY.map(c => (
                                    <option key={c.codeId} value={c.codeId}>{c.codeName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>계산된 우선순위</label>
                            <div style={{ display: 'flex', alignItems: 'center', height: '48px' }}>
                                <span className={`priority-badge ${formData.priority?.toLowerCase()}`} style={{ fontSize: '14px', width: '100%', textAlign: 'center', padding: '10px' }}>
                                    {formData.priority}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>상세 내용</label>
                        <textarea 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="처리 전문가가 참고할 상세 내용을 입력하세요."
                            required
                            style={{ minHeight: '150px' }}
                        />
                    </div>
                </form>
            </div>

            <style>{`
                .form-group label { font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 8px; display: block; }
                .form-group select, .form-group input, .form-group textarea {
                    width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.05);
                    border: 1px solid var(--glass-border); border-radius: 8px; color: white;
                    font-size: 14px; transition: all 0.2s;
                }
                .form-group select:focus, .form-group input:focus, .form-group textarea:focus { border-color: hsl(var(--brand-primary)); background: rgba(255,255,255,0.08); outline: none; }
                
                .priority-badge { font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 4px; display: inline-block; }
                .priority-badge.p1, .priority-badge.high { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }
                .priority-badge.p2, .priority-badge.medium { background: rgba(245, 158, 11, 0.1); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.2); }
                .priority-badge.p3, .priority-badge.low { background: rgba(59, 130, 246, 0.1); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2); }
                .priority-badge.p4 { background: rgba(255, 255, 255, 0.05); color: #9ca3af; border: 1px solid rgba(255, 255, 255, 0.1); }
            `}</style>
        </div>
    );
};

export default RequestForm;
