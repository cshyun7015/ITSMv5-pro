import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/apiRequest';
import { apiCommonCode, type CommonCode } from '../../api/apiCommonCode';
import type { RequestItem } from '../../api/apiRequest';
import './Request.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

const RequestForm: React.FC<Props> = ({ isOpen, onClose, onCreated }) => {
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

    useEffect(() => {
        if (isOpen) {
            loadCodes();
        }
    }, [isOpen]);

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
            await apiRequest.createRequest(formData as RequestItem);
            onCreated();
            onClose();
        } catch (err) {
            alert('요청 등록에 실패했습니다.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay animate-fade-in">
            <div className="modal-content glass-card shadow-2xl animate-scale-in" style={{ width: '700px' }}>
                <header className="panel-header">
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>신규 서비스 요청 등록</h2>
                    <button onClick={onClose} className="btn-ghost" style={{ fontSize: '20px' }}>&times;</button>
                </header>

                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label>요청 제목</label>
                        <input 
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            placeholder="요청 내용의 핵심 요약을 입력하세요."
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
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
                    </div>

                    {/* Priority Display with Formula */}
                    <div className="priority-calculator glass-card" style={{ padding: '15px', marginBottom: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                산정 공식: 영향도({formData.srImpactCode}) + 긴급도({formData.srUrgencyCode})
                            </span>
                            <span className={`priority-badge priority-${formData.priority?.toLowerCase()}`} style={{ fontSize: '14px', padding: '6px 16px' }}>
                                우선순위: {formData.priority}
                            </span>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '32px' }}>
                        <label>상세 내용</label>
                        <textarea 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="처리 및 분석을 위한 상세 내용을 입력해 주세요."
                            style={{ minHeight: '100px' }}
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-ghost">취소</button>
                        <button type="submit" className="btn-primary">요청 등록</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestForm;
