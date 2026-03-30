import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiRequest } from './api/apiRequest';
import { apiCommonCode, type CommonCode } from '../../api/apiCommonCode';
import type { RequestItem } from './api/apiRequest';
import { calculatePriority } from './utils/requestUtils';
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

    useEffect(() => {
        const newPriority = calculatePriority(formData.srImpactCode, formData.srUrgencyCode);
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
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="modal-content premium-card" 
                style={{ width: '900px', padding: '0', background: 'rgba(10, 10, 12, 0.98)', backdropFilter: 'blur(30px)' }}
            >
                <header className="premium-header" style={{ padding: '32px 48px', borderBottom: '1px solid hsla(0,0%,100%,0.05)' }}>
                    <div>
                        <h2 style={{ fontSize: '28px', fontWeight: 950, letterSpacing: '-1px' }}>신규 요청 매니페스트 작성</h2>
                    </div>
                    <div className="header-actions">
                        <button type="button" className="btn-premium-secondary btn-md" onClick={onClose}>목록</button>
                        <button 
                            type="submit" 
                            form="request-manifest-form"
                            className="btn-premium btn-header" 
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'ENGINEERING...' : '등록'}
                        </button>
                    </div>
                </header>

                <div className="premium-scroll-area" style={{ padding: '48px', maxHeight: '70vh', overflowY: 'auto' }}>
                    <form id="request-manifest-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                        
                        {/* Section 1: Core Identifiers */}
                        <section>
                            <div className="set-header">IDENTIFICATION</div>
                            <div className="form-group full">
                                <label>요청 제목 (MANIFEST TITLE)</label>
                                <input 
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    placeholder="핵심 요약을 입력하세요."
                                    required
                                    className="premium-input-large"
                                    style={{ width: '100%', fontSize: '18px', padding: '16px 24px' }}
                                />
                            </div>
                            <div className="content-grid-system" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '24px', gap: '24px' }}>
                                <div className="form-group">
                                    <label>요청 유형</label>
                                    <select value={formData.srTypeCode} onChange={e => setFormData({...formData, srTypeCode: e.target.value})}>
                                        {codes.SR_TYPE.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>서비스 카테고리</label>
                                    <select value={formData.srCategoryCode} onChange={e => setFormData({...formData, srCategoryCode: e.target.value})}>
                                        {codes.SR_CATEGORY.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Impact Analysis HUD */}
                        <section className="logic-hud-panel" style={{ margin: '0', padding: '40px' }}>
                            <div className="hud-content">
                                <div className="hud-item editable">
                                    <label>IMPACT</label>
                                    <select 
                                        value={formData.srImpactCode} 
                                        onChange={e => setFormData({...formData, srImpactCode: e.target.value})}
                                        style={{ background: 'transparent', border: 'none', textAlign: 'center', fontSize: '16px', fontWeight: 800, color: 'hsl(var(--brand-primary))' }}
                                    >
                                        {codes.SR_IMPACT.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                                    </select>
                                </div>
                                <div className="hud-operator">×</div>
                                <div className="hud-item editable">
                                    <label>URGENCY</label>
                                    <select 
                                        value={formData.srUrgencyCode} 
                                        onChange={e => setFormData({...formData, srUrgencyCode: e.target.value})}
                                        style={{ background: 'transparent', border: 'none', textAlign: 'center', fontSize: '16px', fontWeight: 800, color: 'hsl(var(--brand-primary))' }}
                                    >
                                        {codes.SR_URGENCY.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                                    </select>
                                </div>
                                <div className="hud-operator">=</div>
                                <div className="hud-item">
                                    <label>PRIORITY</label>
                                    <motion.div 
                                        key={formData.priority}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1.2, opacity: 1 }}
                                        className={`hud-priority-badge ${formData.priority?.toLowerCase()}`}
                                        style={{ fontSize: '18px' }}
                                    >
                                        {formData.priority}
                                    </motion.div>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Technical Details */}
                        <section>
                            <div className="set-header">TECHNICAL DETAILS</div>
                            <div className="form-group full">
                                <label>상세 분석 요구사항 (SPECIFICATIONS)</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    placeholder="전문가가 인지해야 할 상세 내용을 입력하세요."
                                    required
                                    style={{ minHeight: '180px', width: '100%' }}
                                />
                            </div>
                        </section>
                    </form>
                </div>
                
                <footer style={{ padding: '24px 48px', borderTop: '1px solid hsla(0,0%,100%,0.05)', textAlign: 'right', opacity: 0.5, fontSize: '10px', fontWeight: 800, letterSpacing: '1px' }}>
                    ITIL v5 COMPLIANT REQUEST MANAGEMENT ENGINE
                </footer>
            </motion.div>
        </div>
    );
};

export default RequestForm;
