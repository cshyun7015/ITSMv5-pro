import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiEvent from '../../api/apiEvent';
import type { EventItem } from '../../api/apiEvent';

interface Props {
    eventId: number;
    onClose: () => void;
    onUpdated: () => void;
    codes: any;
}

const EventDetail: React.FC<Props> = ({ eventId, onClose, onUpdated, codes }) => {
    const [eventData, setEventData] = useState<EventItem | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const storedUser = localStorage.getItem('authUser');
    const authUser = storedUser ? JSON.parse(storedUser) : null;
    const isMSP = authUser?.companyId === 'MSP' || authUser?.role?.includes('OPERATOR');

    useEffect(() => {
        loadDetail();
    }, [eventId]);

    const loadDetail = async () => {
        try {
            const res = await apiEvent.getEvent(eventId);
            setEventData(res.data);
        } catch (err) {
            console.error('Failed to load event detail', err);
        }
    };

    const handlePromote = async () => {
        if (!eventData) return;
        try {
            setIsSaving(true);
            await apiEvent.promoteToIncident(eventId);
            onUpdated();
            loadDetail();
            alert('인시던트로 승격되었습니다!');
        } catch (err: any) {
            alert('인시던트 승격 실패: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsSaving(false);
        }
    };

    if (!eventData) return (
        <div className="modal-overlay">
            <div className="premium-card">LOADING...</div>
        </div>
    );

    // 4 explicit steps: 신규 -> 인지됨 -> 장애 승격 -> 해결
    const flowStatesMapping = {
        'NEW': 0,
        'ACKNOWLEDGED': 1,
        'SUPPRESSED': 1,
        'PROMOTED': 2,
        'RESOLVED': 3
    };
    const flowStates = ['신규', '인지됨', '장애 승격', '해결'];
    const currentFlowIndex = flowStatesMapping[eventData.statusCode as keyof typeof flowStatesMapping] ?? 0;

    const getCodeName = (group: string, codeId: string) => {
        return codes[group]?.find((c: any) => c.codeId === codeId)?.codeName || codeId;
    };

    return (
        <div className="modal-overlay animate-fade-in" style={{ zIndex: 1000 }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="modal-content premium-card" 
                style={{ width: '800px', padding: '0', background: 'rgba(10, 10, 12, 0.95)', backdropFilter: 'blur(20px)' }}
            >
                
                {/* Visual Status Flow Stepper */}
                <div className="premium-stepper-container" style={{ padding: '32px 60px' }}>
                    <div className="stepper-track">
                        {flowStates.map((state, idx) => (
                            <React.Fragment key={state}>
                                <div className={`stepper-node ${idx <= currentFlowIndex ? 'active' : ''} ${idx === currentFlowIndex ? 'current' : ''}`}>
                                    <div className="node-circle">
                                        <span className="node-idx">{idx + 1}</span>
                                    </div>
                                    <span className="node-label">{state}</span>
                                </div>
                                {idx < flowStates.length - 1 && (
                                    <div className={`stepper-connector ${idx < currentFlowIndex ? 'active' : ''}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <header className="premium-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 60px' }}>
                    <div className="header-meta" style={{ flex: 1 }}>
                        <div className="id-strip">
                            <span className="req-id-text">{eventData.eventNumber}</span>
                        </div>
                        <h2 className="header-title" style={{ margin: 0 }}>
                            {eventData.relatedRequestId ? `[인시던트 연계] ` : ''} 
                            이벤트 수집: {eventData.node}
                        </h2>
                    </div>
                    
                    <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-secondary" onClick={onClose} style={{ width: '120px', padding: '12px 0' }}>닫기</button>
                        {isMSP && (eventData.statusCode === 'NEW' || eventData.statusCode === 'ACKNOWLEDGED') && (
                            <button 
                                className="auth-submit" 
                                onClick={handlePromote}
                                disabled={isSaving}
                                style={{ width: '150px', padding: '12px 0', background: 'linear-gradient(135deg, #ff4d4d, #990000)' }}
                            >
                                {isSaving ? '처리중...' : '장애(Incident)로 승격'}
                            </button>
                        )}
                    </div>
                </header>

                <div className="premium-scroll-area" style={{ padding: '0 60px 60px' }}>
                    <div className="premium-card field-set" style={{ background: 'hsla(0, 0%, 100%, 0.02)', padding: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                            <div className="form-group">
                                <label>발생처 (Source)</label>
                                <div style={{ padding: '12px', background: 'hsla(0,0,0,0.3)', borderRadius: '8px' }}>
                                    {getCodeName('EV_SOURCE', eventData.sourceCode)}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>심각도 (Severity)</label>
                                <div style={{ padding: '12px', background: 'hsla(0,0,0,0.3)', borderRadius: '8px' }}>
                                    {getCodeName('EV_SEVERITY', eventData.severityCode)}
                                </div>
                            </div>
                            <div className="form-group full">
                                <label>대상 노드 (Node)</label>
                                <div style={{ padding: '12px', background: 'hsla(0,0,0,0.3)', borderRadius: '8px' }}>
                                    {eventData.node}
                                </div>
                            </div>
                            <div className="form-group full">
                                <label>메시지 (Message)</label>
                                <div style={{ padding: '24px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', minHeight: '120px' }}>
                                    {eventData.message}
                                </div>
                            </div>
                        </div>
                    </div>

                    {eventData.relatedRequestId && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="premium-card field-set" 
                            style={{ border: '1px solid hsla(var(--brand-primary), 0.3)', background: 'hsla(var(--brand-primary), 0.02)', marginTop: '24px' }}
                        >
                            <div className="hud-label" style={{ position: 'static', marginBottom: '16px', color: 'hsl(var(--brand-primary))' }}>PROMOTED INCIDENT</div>
                            <div style={{ padding: '12px', fontSize: '18px', fontWeight: 'bold' }}>
                                연계된 장애 티켓: {eventData.relatedRequestId}
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default EventDetail;
