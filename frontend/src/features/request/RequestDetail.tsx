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
    
    useEffect(() => {
        loadDetail();
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, [requestId]);

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
            const [reqRes, comRes] = await Promise.all([
                apiRequest.getRequest(requestId),
                apiRequest.getComments(requestId)
            ]);
            setRequest(reqRes.data);
            setEditData(reqRes.data);
            setComments(comRes.data);

            // Fetch SR_STATUS with await for better error logging
            try {
                const statusRes = await apiCommonCode.getCodesByGroup('SR_STATUS');
                setCodes(prev => ({ ...prev, SR_STATUS: statusRes.data }));
                console.log('SR_STATUS group codes loaded. Length:', statusRes.data.length);
            } catch (err) {
                console.error('SR_STATUS fetch failed:', err);
            }

            // Fetch other codes and agents individually
            const fetchCode = (group: string) => {
                apiCommonCode.getCodesByGroup(group)
                    .then(res => setCodes(prev => ({ ...prev, [group]: res.data })))
                    .catch(err => console.error(`Failed to load ${group}`, err));
            };
            fetchCode('SR_TYPE');
            fetchCode('SR_CATEGORY');
            fetchCode('SR_IMPACT');
            fetchCode('SR_URGENCY');
            fetchCode('SR_RESOLUTION');

            apiUser.list('MSP').then(agentRes => {
                const filteredAgents = agentRes.filter((u: any) => 
                    u.role === 'ROLE_ADMIN' || u.role === 'ROLE_OPERATOR'
                );
                setAgents(filteredAgents);
            }).catch(err => console.error('Failed to load agents', err));

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
                authorId: 'AGENT01', 
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
                <header className="panel-header" style={{ padding: '24px 32px', borderBottom: '1px solid var(--glass-border)' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span className="code-id-cell" style={{ fontSize: '14px', background: 'rgba(0, 255, 200, 0.1)', padding: '4px 12px', borderRadius: '4px' }}>{request.reqNumber}</span>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={editData.title} 
                                    onChange={e => setEditData({...editData, title: e.target.value})}
                                    style={{ 
                                        background: 'rgba(255,255,255,0.1)', 
                                        fontSize: '24px', 
                                        fontWeight: 'bold', 
                                        border: '1px solid var(--brand-primary)', 
                                        flex: 1,
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '8px'
                                    }}
                                />
                            ) : (
                                <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{request.title}</span>
                            )}
                        </div>
                        <p className="panel-subtitle" style={{ marginTop: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span>요청자: {request.requesterId} | 생성일시: {new Date(request.createdAt!).toLocaleString()}</span>
                            {(() => {
                                const sla = getSLARemaining(request.slaTargetAt);
                                return sla && (
                                    <div className={`sla-badge ${sla.colorClass}`} style={{ marginLeft: '16px', background: 'rgba(255,255,255,0.05)' }}>
                                        <div className="sla-dot animate-pulse"></div>
                                        <span style={{ fontWeight: 'bold' }}>SLA 남은 시간: {sla.text}</span>
                                    </div>
                                );
                            })()}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {isEditing ? (
                            <>
                                <button onClick={handleSave} className="btn-primary" style={{ padding: '10px 24px', borderRadius: '8px' }}>저장</button>
                                <button onClick={() => setIsEditing(false)} className="btn-ghost" style={{ padding: '10px 24px', borderRadius: '8px' }}>취소</button>
                            </>
                        ) : (
                            isAdmin && (
                                <>
                                    <button onClick={() => setIsEditing(true)} className="btn-ghost" data-testid="edit-button">수정</button>
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
                                        style={{ color: '#ff4d4d', borderColor: 'rgba(255, 77, 77, 0.3)' }}
                                    >
                                        삭제
                                    </button>
                                </>
                            )
                        )}
                        <button onClick={onClose} className="btn-ghost" style={{ padding: '10px 24px', borderRadius: '8px' }}>목록</button>
                    </div>
                </header>

                <div className="detail-main" style={{ flexDirection: 'column', height: 'auto', overflowY: 'auto', padding: '32px' }}>
                    {/* Top: Workflow & Classification Section (Full Width Grid) */}
                    <div className="glass-card" style={{ padding: '24px', marginBottom: '32px', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
                            {/* Status Section */}
                            <div style={{ gridColumn: 'span 4', marginBottom: '16px' }}>
                                <label className="input-label" style={{ marginBottom: '16px' }}>상태 처리</label>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {codes.SR_STATUS?.map((s: CommonCode) => (
                                        <button
                                            key={s.codeId}
                                            data-testid={`status-button-${s.codeId}`}
                                            onClick={() => handleStatusChange(s.codeId)}
                                            className={`btn-ghost ${editData.status === s.codeId ? 'active' : ''}`}
                                            style={{ 
                                                padding: '8px 20px',
                                                background: (isEditing ? editData.status : request.status) === s.codeId ? 'hsla(184, 100%, 50%, 0.1)' : 'transparent',
                                                borderColor: (isEditing ? editData.status : request.status) === s.codeId ? 'hsla(184, 100%, 50%, 0.3)' : 'var(--glass-border)',
                                                color: (isEditing ? editData.status : request.status) === s.codeId ? 'hsl(var(--brand-primary))' : 'var(--text-secondary)',
                                                fontSize: '13px'
                                            }}
                                            disabled={!isAdmin && !isEditing}
                                        >
                                            {s.codeName}
                                        </button>
                                    ))}
                                </div>
                            </div>

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

                            {/* Priority Info Row */}
                            <div style={{ gridColumn: 'span 4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px 20px', borderRadius: '8px' }}>
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    산합 공식: <code style={{ color: 'var(--brand-primary)' }}>영향도({isEditing ? editData.srImpactCode : request.srImpactCode}) + 긴급도({isEditing ? editData.srUrgencyCode : request.srUrgencyCode})</code>
                                </span>
                                <span className={`priority-badge priority-${(isEditing ? editData.priority : request.priority)?.toLowerCase()}`} style={{ fontSize: '14px', padding: '6px 16px' }}>
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
                        
                        <div className="comments-list" style={{ marginBottom: '32px', padding: '16px', background: 'rgba(0,0,0,0.1)', borderRadius: '16px', minHeight: '200px' }}>
                            {comments.length > 0 ? comments.map(c => (
                                <div key={c.id} style={{ display: 'flex', flexDirection: 'column', alignItems: c.isInternal ? 'flex-end' : 'flex-start' }}>
                                    <div className={`comment-bubble ${c.isInternal ? 'internal' : 'external'}`} style={{ maxWidth: '80%' }}>
                                        <div className="comment-header">
                                            {c.isInternal ? 'Internal Note' : 'General Communication'}
                                        </div>
                                        <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>{c.content}</div>
                                        <div className="comment-meta">
                                            <span>{c.authorId}</span>
                                            <span>{new Date(c.createdAt!).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                    등록된 히스토리가 없습니다.
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleAddComment} className="comment-form glass-card" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <textarea
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    placeholder="Add a comment or worknote..."
                                    style={{ flex: 1, minHeight: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px' }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'flex-end' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: isInternal ? '#ffaa00' : 'var(--text-secondary)', fontSize: '12px' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={isInternal} 
                                            onChange={e => setIsInternal(e.target.checked)}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        INTERNAL WORKNOTE
                                    </label>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        style={{ padding: '12px 32px' }}
                                    >
                                        POST
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
