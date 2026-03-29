import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest, type RequestItem, type RequestComment } from '../../api/apiRequest';
import apiUser, { type UserDTO } from '../../api/apiUser';
import { apiCommonCode, type CommonCode } from '../../api/apiCommonCode';
import './Request.css';

interface Props {
    requestId: number;
    onClose: () => void;
    onUpdated: () => void;
}

const RequestDetail: React.FC<Props> = ({ requestId, onClose, onUpdated }) => {
    const [request, setRequest] = useState<RequestItem | null>(null);
    const [comments, setComments] = useState<RequestComment[]>([]);
    const [agents, setAgents] = useState<UserDTO[]>([]);
    const storedUser = localStorage.getItem('authUser');
    
    let authUser = null;
    try {
        authUser = storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
        console.error('Failed to parse authUser', e);
    }

    const userRole = authUser?.role || 'ROLE_USER';
    
    const isAdmin = userRole?.includes('ADMIN') || userRole?.includes('OPERATOR') || userRole?.includes('MANAGER');

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<RequestItem>>({});
    const [newComment, setNewComment] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [codes, setCodes] = useState<{ [key: string]: CommonCode[] }>({});
    const [userMap, setUserMap] = useState<{[key: string]: string}>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    
    useEffect(() => {
        loadDetail();
    }, [requestId]);

    const calculatePriority = (impact?: string, urgency?: string) => {
        if (!impact || !urgency) return 'P4';
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
        if (isEditing) {
            const newPriority = calculatePriority(editData.srImpactCode, editData.srUrgencyCode);
            if (editData.priority !== newPriority) {
                setEditData(prev => ({ ...prev, priority: newPriority }));
            }
        }
    }, [editData.srImpactCode, editData.srUrgencyCode, isEditing]);


    const loadDetail = async () => {
        try {
            setIsInitialLoading(true);
            const [reqRes, comRes, userRes] = await Promise.all([
                apiRequest.getRequest(requestId),
                apiRequest.getComments(requestId),
                apiUser.list({ size: 1000 })
            ]);
            setRequest(reqRes.data);
            setEditData(reqRes.data);
            setComments(comRes.data);

            const map: {[key: string]: string} = {};
            userRes.content.forEach((u: UserDTO) => { map[u.userId] = u.name; });
            setUserMap(map);

            const statusRes = await apiCommonCode.getCodesByGroup('SR_STATUS');
            setCodes(prev => ({ ...prev, SR_STATUS: statusRes.data }));

            const codesToFetch = ['SR_TYPE', 'SR_CATEGORY', 'SR_IMPACT', 'SR_URGENCY', 'SR_RESOLUTION'];
            const codeResponses = await Promise.all(
                codesToFetch.map(group => apiCommonCode.getCodesByGroup(group))
            );
            
            setCodes(prev => {
                const newCodes = { ...prev };
                codesToFetch.forEach((group, idx) => {
                    newCodes[group] = codeResponses[idx].data;
                });
                return newCodes;
            });

            const filteredAgents = userRes.content.filter((u: UserDTO) => 
                u.companyId === 'MSP' && (u.role === 'ROLE_ADMIN' || u.role === 'ROLE_OPERATOR' || u.role === 'ROLE_MANAGER')
            );
            setAgents(filteredAgents);

            if (isAdmin) {
                // Keep editing mode if admin, but ensure we have valid codes
            }

        } catch (err) {
            console.error('Failed to load request detail', err);
        } finally {
            setIsInitialLoading(false);
        }
    };

    const handleSave = async () => {
        if (!request) return;
        if (isAdmin && (editData.status === 'RESOLVED' || editData.status === 'CLOSED')) {
            if (!editData.srResolutionCode || !editData.resolutionText) {
                alert('해결 시 해결 코드와 해결 내용을 입력해야 합니다.');
                return;
            }
        }
        try {
            setIsSaving(true);
            await apiRequest.updateRequest(requestId, editData as RequestItem);
            setIsEditing(false);
            onUpdated();
            // User requested to close the modal and return to list after save
            onClose(); 
        } catch (err) {
            alert('요청 저장에 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await apiRequest.addComment(requestId, {
                requestId: requestId,
                authorId: authUser?.userId || 'system',
                content: newComment,
                isInternal: isInternal
            } as RequestComment);
            setNewComment('');
            const comRes = await apiRequest.getComments(requestId);
            setComments(comRes.data);
        } catch (err) {
            alert('댓글 등록에 실패했습니다.');
        }
    };

    const isAttributeEditable = (segment: 'CORE' | 'CLASSIFICATION' | 'SLA' | 'OWNERSHIP' | 'RESOLUTION') => {
        if (!isEditing || !request) return false;
        const status = request.status;
        if (['CLOSED', 'CANCELLED'].includes(status)) return false;

        switch (segment) {
            case 'CORE':
                return ['OPEN', 'ASSIGNED'].includes(status);
            case 'CLASSIFICATION':
                return ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(status);
            case 'SLA':
                return ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(status);
            case 'OWNERSHIP':
                return ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED'].includes(status);
            case 'RESOLUTION':
                return ['IN_PROGRESS', 'RESOLVED'].includes(status);
            default:
                return false;
        }
    };

    const getEditableStyle = (segment: 'CORE' | 'CLASSIFICATION' | 'SLA' | 'OWNERSHIP' | 'RESOLUTION') => {
        if (!isEditing) return {};
        const editable = isAttributeEditable(segment);
        return editable ? {} : { opacity: 0.6, cursor: 'not-allowed' };
    };

    const DetailSkeleton = () => (
        <div className="modal-overlay">
            <motion.div className="modal-content premium-card" style={{ width: '900px', height: '94vh', padding: '60px', background: 'rgba(10, 10, 12, 0.95)' }}>
                <div className="skeleton" style={{ height: '40px', width: '300px', marginBottom: '40px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: '60px' }} />)}
                </div>
                <div className="skeleton" style={{ height: '200px', width: '100%', marginBottom: '40px' }} />
                <div className="skeleton" style={{ height: '150px', width: '100%' }} />
            </motion.div>
        </div>
    );

    if (isInitialLoading) return <DetailSkeleton />;
    if (!request) return null;

    const flowStatesMapping = {
        'OPEN': 0,
        'ASSIGNED': 1,
        'IN_PROGRESS': 1,
        'ON_HOLD': 1,
        'RESOLVED': 2,
        'CLOSED': 3,
        'CANCELLED': 3
    };
    const flowStates = ['접수됨', '처리중', '해결됨', '완료됨'];
    const currentStatus = isEditing ? editData.status || '' : request.status;
    const currentFlowIndex = flowStatesMapping[currentStatus as keyof typeof flowStatesMapping] ?? 0;

    return (
        <div className="modal-overlay animate-fade-in" style={{ zIndex: 1000 }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="modal-content premium-card" 
                style={{ width: '900px', height: '94vh', display: 'flex', flexDirection: 'column', padding: '0', background: 'rgba(10, 10, 12, 0.95)', backdropFilter: 'blur(20px)' }}
            >
                
                {/* Visual Status Flow Stepper */}
                <div className="premium-stepper-container" style={{ padding: '32px 60px' }}>
                    <div className="stepper-track">
                        {flowStates.map((state, idx) => (
                            <React.Fragment key={state}>
                                <div className={`stepper-node ${idx <= currentFlowIndex ? 'active' : ''} ${idx === currentFlowIndex ? 'current' : ''}`}>
                                    <div className="node-circle">
                                        {idx === currentFlowIndex && (
                                            <motion.div 
                                                layoutId="active-glow"
                                                className="node-inner"
                                                initial={false}
                                                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
                                                transition={{ repeat: Infinity, duration: 2 }}
                                                style={{ background: 'radial-gradient(circle, hsl(var(--brand-primary)), transparent)' }}
                                            />
                                        )}
                                        <span className="node-idx">{idx + 1}</span>
                                    </div>
                                    <span className="node-label">
                                        {state}
                                    </span>
                                </div>
                                {idx < flowStates.length - 1 && (
                                    <div className={`stepper-connector ${idx < currentFlowIndex ? 'active' : ''}`}>
                                        {idx < currentFlowIndex && <div className="connector-glow" />}
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <header className="premium-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 60px' }}>
                    <div className="header-meta" style={{ flex: 1 }}>
                        <div className="id-strip">
                            <span className="req-id-text">{request.reqNumber || `#${request.id}`}</span>
                        </div>
                        <h2 className="header-title" style={{ margin: 0 }}>{request.title}</h2>
                    </div>
                    
                    <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-premium-secondary" onClick={onClose} style={{ width: '120px' }}>목록</button>
                        {isAdmin && !['CLOSED', 'CANCELLED'].includes(request.status) && (
                            <button 
                                className="btn-premium" 
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                disabled={isSaving}
                                style={{ width: '120px' }}
                            >
                                {isSaving ? '저장...' : (isEditing ? '저장' : '수정')}
                            </button>
                        )}
                    </div>
                </header>

                <div className="premium-scroll-area" style={{ padding: '0 60px 100px' }}>
                    
                            <div className="premium-card field-set" style={{ background: 'hsla(0, 0%, 100%, 0.02)', padding: '32px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                                    <div className="form-group">
                                        <label>영향도 (Impact)</label>
                                        <select 
                                            disabled={!isAttributeEditable('SLA')} 
                                            value={isEditing ? editData.srImpactCode : request.srImpactCode} 
                                            onChange={e => setEditData({...editData, srImpactCode: e.target.value})}
                                            style={getEditableStyle('SLA')}
                                        >
                                            {codes.SR_IMPACT?.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>긴급도 (Urgency)</label>
                                        <select 
                                            disabled={!isAttributeEditable('SLA')} 
                                            value={isEditing ? editData.srUrgencyCode : request.srUrgencyCode} 
                                            onChange={e => setEditData({...editData, srUrgencyCode: e.target.value})}
                                            style={getEditableStyle('SLA')}
                                        >
                                            {codes.SR_URGENCY?.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>서비스 카테고리</label>
                                        <select 
                                            disabled={!isAttributeEditable('CLASSIFICATION')} 
                                            value={isEditing ? editData.srCategoryCode : request.srCategoryCode} 
                                            onChange={e => setEditData({...editData, srCategoryCode: e.target.value})}
                                            style={getEditableStyle('CLASSIFICATION')}
                                        >
                                            {codes.SR_CATEGORY?.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>전문가 배정</label>
                                        <select 
                                            disabled={!isAttributeEditable('OWNERSHIP')} 
                                            value={(isEditing ? editData.assigneeId : request.assigneeId) || ''} 
                                            onChange={e => setEditData({...editData, assigneeId: e.target.value})}
                                            style={getEditableStyle('OWNERSHIP')}
                                        >
                                            <option value="">-- 미배정 --</option>
                                            {agents.map(a => <option key={a.userId} value={a.userId}>{a.name} ({a.userId})</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>현재 단계</label>
                                        <select 
                                            disabled={!isEditing} 
                                            value={isEditing ? editData.status : request.status} 
                                            onChange={e => setEditData({...editData, status: e.target.value})}
                                        >
                                            {codes.SR_STATUS?.map(s => <option key={s.codeId} value={s.codeId}>{s.codeName}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                    {/* Logic HUD moved to the middle as requested */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="logic-hud-panel"
                        style={{ margin: '24px 0 48px' }}
                    >
                        {/* Removed redundant ITIL title as per request */}
                        <div className="hud-content">
                            <div className="hud-item">
                                <label>IMPACT</label>
                                <div className="hud-value">{codes.SR_IMPACT?.find(c => c.codeId === (isEditing ? editData.srImpactCode : request.srImpactCode))?.codeName || '-'}</div>
                            </div>
                            <div className="hud-operator">×</div>
                            <div className="hud-item">
                                <label>URGENCY</label>
                                <div className="hud-value">{codes.SR_URGENCY?.find(c => c.codeId === (isEditing ? editData.srUrgencyCode : request.srUrgencyCode))?.codeName || '-'}</div>
                            </div>
                            <div className="hud-operator">=</div>
                            <div className="hud-item">
                                <label>PRIORITY</label>
                                <motion.div 
                                    key={isEditing ? editData.priority : request.priority}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={`hud-priority-badge ${(isEditing ? editData.priority : request.priority)?.toLowerCase()}`}
                                >
                                    {isEditing ? editData.priority : request.priority}
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                            <div className="premium-card field-set" style={{ background: 'hsla(0, 0%, 100%, 0.02)', marginTop: '24px', padding: '32px' }}>
                                <div className="form-group full">
                                    <label>요청 상세 내역</label>
                                    {isEditing && isAttributeEditable('CORE') ? (
                                        <textarea 
                                            value={editData.description} 
                                            onChange={e => setEditData({...editData, description: e.target.value})} 
                                            style={{ minHeight: '180px', ...getEditableStyle('CORE') }} 
                                        />
                                    ) : (
                                        <div className="premium-card" style={{ padding: '24px', minHeight: '180px', background: 'rgba(0,0,0,0.2)', fontSize: '15px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                                            {request.description}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Improved visibility logic: Show resolution details from IN_PROGRESS or when RESOLVED/CLOSED */}
                            {isAdmin && (['IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(isEditing ? editData.status || '' : request.status)) && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="premium-card field-set" 
                                    style={{ border: '1px solid hsla(var(--status-resolved), 0.2)', background: 'hsla(var(--status-resolved), 0.02)', marginTop: '24px', padding: '32px' }}
                                >
                                    <div className="hud-label" style={{ position: 'static', marginBottom: '16px', color: 'hsl(var(--status-resolved))' }}>RESOLUTION DETAILS</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                                        <div className="form-group">
                                            <label>해결 코드</label>
                                            <select 
                                                disabled={!isAttributeEditable('RESOLUTION')} 
                                                value={isEditing ? editData.srResolutionCode : request.srResolutionCode} 
                                                onChange={e => setEditData({...editData, srResolutionCode: e.target.value})}
                                                style={getEditableStyle('RESOLUTION')}
                                            >
                                                <option value="">-- 해결 코드 선택 --</option>
                                                {codes.SR_RESOLUTION?.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>처리 내용</label>
                                            <textarea 
                                                disabled={!isAttributeEditable('RESOLUTION')} 
                                                value={isEditing ? editData.resolutionText : request.resolutionText} 
                                                onChange={e => setEditData({...editData, resolutionText: e.target.value})} 
                                                style={{ minHeight: '100px', ...getEditableStyle('RESOLUTION') }} 
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                    <div className="premium-card" style={{ padding: '40px', marginTop: '60px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '1px' }}>HISTORY & INVESTIGATION</h3>
                            <span className="text-muted" style={{ fontSize: '12px', fontWeight: 800 }}>{comments.length} ACTIVITIES</span>
                        </div>
                        
                        <div className="timeline-table-premium">
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: '150px' }}>발생 일시</th>
                                        <th style={{ width: '150px' }}>작성자</th>
                                        <th>설명 및 코멘트</th>
                                        <th style={{ width: '100px' }}>분류</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence mode="popLayout">
                                        {comments.map((c) => (
                                            <motion.tr 
                                                key={c.id} 
                                                layout
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={c.isInternal ? 'is-internal' : ''}
                                            >
                                                <td style={{ fontSize: '12px', opacity: 0.6, fontFamily: 'JetBrains Mono' }}>
                                                    {new Date(c.createdAt!).toLocaleDateString()} <br/>
                                                    {new Date(c.createdAt!).toLocaleTimeString()}
                                                </td>
                                                <td>
                                                    <div className="glass" style={{ padding: '6px 16px', fontSize: '13px', fontWeight: 700, width: 'fit-content' }}>
                                                        {userMap[c.authorId] || c.authorId}
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: '14px', lineHeight: '1.6' }}>{c.content}</td>
                                                <td>
                                                    <span style={{ fontSize: '10px', fontWeight: 900, color: c.isInternal ? 'hsl(var(--status-high))' : 'var(--text-muted)' }}>
                                                        {c.isInternal ? 'INTERNAL' : 'GENERAL'}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                    {comments.length === 0 && (
                                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: '60px', opacity: 0.4 }}>기록된 이력이 없습니다.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ marginTop: '48px', borderTop: '1px solid hsla(0, 0%, 100%, 0.05)', paddingTop: '48px' }}>
                            <textarea 
                                value={newComment} 
                                onChange={e => setNewComment(e.target.value)} 
                                placeholder="분석 결과 또는 대응 메시지를 입력하세요..." 
                                style={{ width: '100%', minHeight: '120px', marginBottom: '20px' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} />
                                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'hsl(var(--status-high))' }}>내부 전용 노트로 기록</span>
                                </label>
                                <button className="btn-premium" onClick={handleAddComment} style={{ width: '120px' }}>기록</button>
                            </div>
                        </div>
                    </div>

                </div>
            </motion.div>
        </div>
    );
};

export default RequestDetail;
