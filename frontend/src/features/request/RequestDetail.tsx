import React, { useState, useEffect } from 'react';
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
    const authUser = storedUser ? JSON.parse(storedUser) : null;
    const userRole = authUser?.role || 'ROLE_USER';
    const isAdmin = userRole?.includes('ADMIN') || userRole?.includes('OPERATOR');

    const [isEditing, setIsEditing] = useState(isAdmin);
    const [editData, setEditData] = useState<Partial<RequestItem>>({});
    const [newComment, setNewComment] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [codes, setCodes] = useState<{ [key: string]: CommonCode[] }>({});
    const [now, setNow] = useState(new Date());
    const [userMap, setUserMap] = useState<{[key: string]: string}>({});
    
    useEffect(() => {
        loadDetail();
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, [requestId]);

    // Priority Calculation Logic (Sync with Backend)
    const calculatePriority = (impact?: string, urgency?: string) => {
        if (!impact || !urgency) return 'P3';
        if (impact === 'HIGH') {
            if (urgency === 'HIGH') return 'P1';
            if (urgency === 'MEDIUM') return 'P2';
            return 'P3';
        } else if (impact === 'MEDIUM') {
            if (urgency === 'HIGH') return 'P2';
            if (urgency === 'MEDIUM') return 'P3';
            return 'P4';
        } else { // LOW Impact
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

    const getSLARemaining = (targetAt?: string) => {
        if (!targetAt) return null;
        const target = new Date(targetAt);
        const diff = target.getTime() - now.getTime();
        
        if (diff <= 0) return { text: 'EXPIRED', colorClass: 'sla-red' };
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        let colorClass = 'sla-emerald';
        if (hours < 1) colorClass = 'sla-orange';
        if (hours < 0.5) colorClass = 'sla-red';

        return { 
            text: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
            colorClass 
        };
    };

    const loadDetail = async () => {
        try {
            const [reqRes, comRes, userRes] = await Promise.all([
                apiRequest.getRequest(requestId),
                apiRequest.getComments(requestId),
                apiUser.list('all')
            ]);
            setRequest(reqRes.data);
            setEditData(reqRes.data);
            setComments(comRes.data);

            const map: {[key: string]: string} = {};
            userRes.forEach((u: any) => { map[u.userId] = u.name; });
            setUserMap(map);

            // Fetch SR_STATUS with await for better error logging
            try {
                const statusRes = await apiCommonCode.getCodesByGroup('SR_STATUS');
                setCodes(prev => ({ ...prev, SR_STATUS: statusRes.data }));
            } catch (err) {
                console.error('SR_STATUS fetch failed:', err);
            }

            // Fetch other codes
            const codesToFetch = ['SR_TYPE', 'SR_CATEGORY', 'SR_IMPACT', 'SR_URGENCY', 'SR_RESOLUTION'];
            codesToFetch.forEach(group => {
                apiCommonCode.getCodesByGroup(group)
                    .then(res => setCodes(prev => ({ ...prev, [group]: res.data })))
                    .catch(err => console.error(`Failed to load ${group}`, err));
            });

            const filteredAgents = userRes.filter((u: any) => 
                u.companyId === 'MSP' && (u.role === 'ROLE_ADMIN' || u.role === 'ROLE_OPERATOR')
            );
            setAgents(filteredAgents);

        } catch (err) {
            console.error('Critical failure loading request detail', err);
        }
    };

    const handleSave = async () => {
        if (!request) return;
        
        // Validation for resolver fields if status is RESOLVED or CLOSED
        if (isAdmin && (editData.status === 'RESOLVED' || editData.status === 'CLOSED')) {
            if (!editData.srResolutionCode || !editData.resolutionText) {
                alert('해결 시 해결 코드와 해결 내용을 입력해야 합니다.');
                return;
            }
        }

        try {
            await apiRequest.updateRequest(requestId, editData as RequestItem);
            setIsEditing(false);
            onUpdated();
            loadDetail();
        } catch (err) {
            alert('저장에 실패했습니다.');
        }
    };

    const handleStatusChange = (newStatus: string) => {
        if (!request) return;
        setIsEditing(true);
        setEditData(prev => ({ ...prev, status: newStatus }));
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await apiRequest.addComment(requestId, {
                requestId,
                authorId: authUser?.userId || 'UNKNOWN', 
                content: newComment,
                isInternal
            });
            setNewComment('');
            loadDetail();
        } catch (err) {
            alert('Failed to add comment');
        }
    };

    if (!request) return null;

    return (
        <div className="request-detail-fixed">
            <div className="request-detail-content glass-card shadow-2xl">
                <header className="panel-header" style={{ padding: '24px 32px', borderBottom: '1px solid var(--glass-border)', display: 'block' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {/* Request Number - Compact 16px */}
                        <span style={{ 
                            fontSize: '16px', 
                            color: 'var(--brand-primary)', 
                            fontWeight: 700,
                            letterSpacing: '0.5px'
                        }}>
                            {request.reqNumber}
                        </span>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
                            {/* Title - Compact 22px */}
                            <div style={{ flex: 1 }}>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        value={editData.title} 
                                        onChange={e => setEditData({...editData, title: e.target.value})}
                                        style={{ 
                                            background: 'rgba(255,255,255,0.1)', 
                                            fontSize: '22px', 
                                            fontWeight: 700, 
                                            border: '1px solid var(--brand-primary)', 
                                            width: '100%',
                                            color: 'white',
                                            padding: '6px 12px',
                                            borderRadius: '8px'
                                        }}
                                    />
                                ) : (
                                    <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'white', margin: 0, lineHeight: 1.2 }}>
                                        {request.title}
                                    </h1>
                                )}
                            </div>

                            {/* Actions - Now Aligned with Title */}
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                {isEditing ? (
                                    <button onClick={handleSave} className="btn-primary" style={{ minWidth: '120px', height: '44px', padding: '0 32px', borderRadius: '12px', fontSize: '14px', fontWeight: 700 }}>저장</button>
                                ) : (
                                    isAdmin && (
                                        <>
                                            <button onClick={() => setIsEditing(true)} className="btn-ghost" style={{ padding: '8px 20px', borderRadius: '8px' }} data-testid="edit-button">수정</button>
                                            <button 
                                                onClick={async () => {
                                                    if (window.confirm('이 요청을 정말 삭제하시겠습니까?')) {
                                                        try {
                                                            await apiRequest.deleteRequest(requestId);
                                                            onUpdated();
                                                            onClose();
                                                        } catch (err) {
                                                            alert('삭제에 실패했습니다.');
                                                        }
                                                    }
                                                }}
                                                className="btn-ghost"
                                                style={{ padding: '8px 20px', borderRadius: '8px', color: '#ff4d4d', borderColor: 'rgba(255, 77, 77, 0.3)' }}
                                            >
                                                삭제
                                            </button>
                                        </>
                                    )
                                )}
                                <button onClick={onClose} className="btn-ghost" style={{ minWidth: '120px', height: '44px', padding: '0 32px', borderRadius: '12px', fontSize: '14px', fontWeight: 700 }}>목록</button>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Row */}
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>요청자: <strong>{userMap[request.requesterId] || request.requesterId}</strong></span>
                            <span style={{ width: '1px', height: '10px', background: 'rgba(255,255,255,0.1)' }} />
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>생성일시: {new Date(request.createdAt!).toLocaleString()}</span>
                         </div>

                        {(() => {
                            const sla = getSLARemaining(request.slaTargetAt);
                            return sla && (
                                <div className={`sla-badge ${sla.colorClass}`} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '3px 10px' }}>
                                    <div className="sla-dot animate-pulse"></div>
                                    <span style={{ fontWeight: 600, fontSize: '11px' }}>SLA 남은 시간: {sla.text}</span>
                                </div>
                            );
                        })()}
                    </div>
                </header>

                <div className="detail-main" style={{ flexDirection: 'column', height: 'auto', overflowY: 'auto', padding: '32px' }}>
                    {/* Top: Workflow Step Section */}
                    <div className="workflow-section" style={{ marginBottom: '40px', padding: '0 20px' }}>
                        <label className="input-label" style={{ marginBottom: '24px', fontSize: '14px', textAlign: 'center', display: 'block', color: 'var(--brand-primary)' }}>요청 처리 프로세스 (Status Flow)</label>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                            {/* Background Line */}
                            <div style={{ position: 'absolute', top: '50%', left: '50px', right: '50px', height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }} />
                            
                            {codes.SR_STATUS?.map((s: CommonCode, idx: number) => {
                                const currentStatus = isEditing ? editData.status : request.status;
                                const isActive = currentStatus === s.codeId;
                                // Simple logic: if index <= current status index? 
                                // Actually better to just highlight active and passed.
                                const statusList = codes.SR_STATUS || [];
                                const currentIndex = statusList.findIndex(x => x.codeId === currentStatus);
                                const isPassed = idx < currentIndex;

                                return (
                                    <div 
                                        key={s.codeId} 
                                        style={{ 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center', 
                                            gap: '12px', 
                                            zIndex: 1, 
                                            cursor: isAdmin ? 'pointer' : 'default',
                                            flex: 1
                                        }}
                                        onClick={() => isAdmin && handleStatusChange(s.codeId)}
                                    >
                                        <div style={{ 
                                            width: '32px', 
                                            height: '32px', 
                                            borderRadius: '50%', 
                                            background: isActive ? 'hsl(var(--brand-primary))' : isPassed ? '#00ff88' : 'rgba(255,255,255,0.1)',
                                            border: '4px solid #1a1a1c',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease',
                                            boxShadow: isActive ? '0 0 15px hsl(var(--brand-primary))' : 'none'
                                        }}>
                                            {isPassed ? '✓' : idx + 1}
                                        </div>
                                        <span style={{ 
                                            fontSize: '11px', 
                                            fontWeight: (isActive || isPassed) ? 700 : 400,
                                            color: isActive ? 'white' : isPassed ? '#00ff88' : 'var(--text-secondary)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {s.codeName}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '24px', marginBottom: '32px', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
                            {/* Classification Grid */}
                            <div className="form-group">
                                <label>요청 유형</label>
                                {isEditing ? (
                                    <select value={editData.srTypeCode || ''} onChange={e => setEditData({...editData, srTypeCode: e.target.value})}>
                                        <option value="">-- 선택 --</option>
                                        {codes.SR_TYPE?.map((c: CommonCode) => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                                    </select>
                                ) : (
                                    <div className="code-name-cell">{codes.SR_TYPE?.find((c: CommonCode) => c.codeId === request.srTypeCode)?.codeName || request.srTypeCode || '-'}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>서비스 카테고리</label>
                                {isEditing ? (
                                    <select value={editData.srCategoryCode || ''} onChange={e => setEditData({...editData, srCategoryCode: e.target.value})}>
                                        <option value="">-- 선택 --</option>
                                        {codes.SR_CATEGORY?.map((c: CommonCode) => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                                    </select>
                                ) : (
                                    <div className="code-name-cell">{codes.SR_CATEGORY?.find((c: CommonCode) => c.codeId === request.srCategoryCode)?.codeName || request.srCategoryCode || '-'}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>영향도</label>
                                {isEditing ? (
                                    <select value={editData.srImpactCode || 'LOW'} onChange={e => setEditData({...editData, srImpactCode: e.target.value})}>
                                        {codes.SR_IMPACT?.map((c: CommonCode) => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                                    </select>
                                ) : (
                                    <div className="code-name-cell">{codes.SR_IMPACT?.find((c: CommonCode) => c.codeId === request.srImpactCode)?.codeName || '-'}</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>긴급도</label>
                                {isEditing ? (
                                    <select value={editData.srUrgencyCode || 'LOW'} onChange={e => setEditData({...editData, srUrgencyCode: e.target.value})}>
                                        {codes.SR_URGENCY?.map((c: CommonCode) => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                                    </select>
                                ) : (
                                    <div className="code-name-cell">{codes.SR_URGENCY?.find((c: CommonCode) => c.codeId === request.srUrgencyCode)?.codeName || '-'}</div>
                                )}
                            </div>

                            {/* Priority Info Row - Removed box line/bg */}
                            <div style={{ gridColumn: 'span 4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    산합 공식: <code style={{ color: 'var(--brand-primary)' }}>영향도({isEditing ? editData.srImpactCode : request.srImpactCode}) + 긴급도({isEditing ? editData.srUrgencyCode : request.srUrgencyCode})</code>
                                </span>
                                <span className={`priority-badge priority-${(isEditing ? editData.priority : request.priority)?.toLowerCase()}`} style={{ fontSize: '14px', padding: '6px 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                                    최종 우선순위: {isEditing ? editData.priority : request.priority}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Middle: Management Section (2 Columns) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', marginBottom: '32px' }}>
                        <div className="form-group">
                            <label>담당 전문가 배정</label>
                            {isEditing ? (
                                <select
                                    value={editData.assigneeId || ''} 
                                    onChange={e => setEditData({...editData, assigneeId: e.target.value})}
                                    style={{ width: '100%' }}
                                >
                                    <option value="">-- 미배정 --</option>
                                    {agents.map((a: UserDTO) => (
                                        <option key={a.userId} value={a.userId}>{a.name} ({a.userId})</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="code-name-cell">{agents.find((a: UserDTO) => a.userId === request.assigneeId)?.name || request.assigneeId || '미배정'}</div>
                            )}
                        </div>

                        {/* Description Section */}
                        <div className="form-group">
                            <label>요청 상세 내용</label>
                            {isEditing ? (
                                <textarea 
                                    value={editData.description} 
                                    onChange={e => setEditData({...editData, description: e.target.value})}
                                    style={{ minHeight: '120px' }}
                                />
                            ) : (
                                <div style={{ 
                                    background: 'rgba(255,255,255,0.05)', 
                                    padding: '16px', 
                                    borderRadius: '12px', 
                                    border: '1px solid var(--glass-border)',
                                    fontSize: '14px',
                                    whiteSpace: 'pre-wrap',
                                    minHeight: '120px'
                                }}>
                                    {request.description}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Conditional Resolution Section (Full Width) */}
                    {(isEditing ? (editData.status === 'RESOLVED' || editData.status === 'CLOSED') : (request.status === 'RESOLVED' || request.status === 'CLOSED')) && (
                        <div className="resolution-section glass-card" style={{ padding: '24px', marginBottom: '32px', background: 'rgba(0, 255, 100, 0.05)', border: '1px solid rgba(0, 255, 100, 0.2)' }}>
                            <h3 style={{ fontSize: '15px', color: '#00ff64', marginBottom: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff64' }} />
                                해결 정보 (ITIL Mandatory)
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
                                <div className="form-group">
                                    <label>해결 코드</label>
                                    {isEditing ? (
                                        <select value={editData.srResolutionCode || ''} onChange={e => setEditData({...editData, srResolutionCode: e.target.value})}>
                                            <option value="">-- 해결 구분 선택 --</option>
                                            {codes.SR_RESOLUTION?.map((c: CommonCode) => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                                        </select>
                                    ) : (
                                        <div className="code-name-cell" style={{ color: '#00ff64' }}>{codes.SR_RESOLUTION?.find((c: CommonCode) => c.codeId === request.srResolutionCode)?.codeName || request.srResolutionCode || '-'}</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>해결 조치 상세</label>
                                    {isEditing ? (
                                        <textarea 
                                            value={editData.resolutionText || ''} 
                                            onChange={e => setEditData({...editData, resolutionText: e.target.value})}
                                            placeholder="해결한 구체적인 방법이나 조치 내용을 입력하세요."
                                            style={{ minHeight: '100px', border: '1px solid rgba(0, 255, 100, 0.2)' }}
                                        />
                                    ) : (
                                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>{request.resolutionText || '조치 내용 없음'}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bottom: Timeline & Comment Section */}
                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '32px' }}>
                        <h3 className="section-title" style={{ marginBottom: '24px', fontSize: '16px' }}>커뮤니케이션 히스토리</h3>
                        
                        <div className="comments-list" style={{ marginBottom: '32px', padding: '16px', background: 'rgba(0,0,0,0.1)', borderRadius: '16px', minHeight: '100px' }}>
                            {comments.length > 0 ? comments.map(c => (
                                <div key={c.id} style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '16px', 
                                    padding: '2px 16px', 
                                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                                    background: c.isInternal ? 'rgba(255, 170, 0, 0.05)' : 'transparent',
                                    minHeight: '28px'
                                }}>
                                    <span style={{ width: '150px', fontSize: '11px', color: 'var(--text-secondary)', flexShrink: 0, opacity: 0.7 }}>
                                        {new Date(c.createdAt!).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span style={{ width: '110px', fontSize: '12px', color: '#00ffc8', fontWeight: 600, flexShrink: 0 }}>
                                        {userMap[c.authorId] || c.authorId}
                                    </span>
                                    <span style={{ flex: 1, fontSize: '13px', color: 'rgba(255,255,255,0.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {c.content}
                                    </span>
                                    <span style={{ 
                                        width: '70px', 
                                        fontSize: '9px', 
                                        fontWeight: 800, 
                                        textAlign: 'right',
                                        color: c.isInternal ? '#ffaa00' : 'var(--brand-primary)',
                                        flexShrink: 0,
                                        letterSpacing: '0.5px'
                                    }}>
                                        {c.isInternal ? 'INTERNAL' : 'GENERAL'}
                                    </span>
                                </div>
                            )) : (
                                <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '12px' }}>
                                    등록된 히스토리가 없습니다.
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleAddComment} className="comment-form glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <textarea
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    placeholder="Add a comment or worknote..."
                                    style={{ 
                                        flex: 1, 
                                        minHeight: '80px', 
                                        background: 'rgba(255,255,255,0.05)', 
                                        borderRadius: '12px', 
                                        padding: '12px 16px',
                                        color: 'white',
                                        fontSize: '13px',
                                        border: '1px solid var(--glass-border)',
                                        resize: 'none'
                                    }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', minWidth: '150px' }}>
                                    <label style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px', 
                                        cursor: 'pointer', 
                                        color: isInternal ? '#ffaa00' : 'var(--text-secondary)', 
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        userSelect: 'none'
                                    }}>
                                        <input 
                                            type="checkbox" 
                                            checked={isInternal} 
                                            onChange={e => setIsInternal(e.target.checked)}
                                            style={{ width: '16px', height: '16px' }}
                                        />
                                        INTERNAL WORKNOTE
                                    </label>
                                    <button
                                        type="submit"
                                        className="btn-secondary"
                                        style={{ minWidth: '120px', height: '44px', padding: '0 32px', borderRadius: '12px', fontSize: '14px', fontWeight: 700 }}
                                    >
                                        등록
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestDetail;
