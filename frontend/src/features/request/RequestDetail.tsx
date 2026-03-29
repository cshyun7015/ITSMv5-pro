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
    
    const isAdmin = userRole?.includes('ADMIN') || userRole?.includes('OPERATOR') || userRole?.includes('MANAGER');

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<RequestItem>>({});
    const [newComment, setNewComment] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [codes, setCodes] = useState<{ [key: string]: CommonCode[] }>({});
    const [now, setNow] = useState(new Date());
    const [userMap, setUserMap] = useState<{[key: string]: string}>({});
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        loadDetail();
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
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
        return { text: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`, colorClass };
    };

    const loadDetail = async () => {
        try {
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
            await Promise.all(codesToFetch.map(async (group) => {
                const res = await apiCommonCode.getCodesByGroup(group);
                setCodes(prev => ({ ...prev, [group]: res.data }));
            }));

            const filteredAgents = userRes.content.filter((u: UserDTO) => 
                u.companyId === 'MSP' && (u.role === 'ROLE_ADMIN' || u.role === 'ROLE_OPERATOR' || u.role === 'ROLE_MANAGER')
            );
            setAgents(filteredAgents);

            if (isAdmin) {
                setIsEditing(true);
            }

        } catch (err) {
            console.error('Failed to load request detail', err);
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
            loadDetail();
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

    if (!request) return (
        <div className="modal-overlay">
            <div className="glass-card loading-container" style={{ padding: '40px', textAlign: 'center' }}>
                <span className="animate-pulse" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--brand-primary)' }}>AUTHENTICATING DATA...</span>
            </div>
        </div>
    );

    const sla = getSLARemaining(request.slaTargetAt);
    const flowStates = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    const currentFlowIndex = flowStates.indexOf(isEditing ? editData.status || '' : request.status);

    return (
        <div className="modal-overlay animate-fade-in" style={{ zIndex: 1000 }}>
            <div className="modal-content glass-card premium-modal animate-scale-in" style={{ width: '1300px', height: '94vh', display: 'flex', flexDirection: 'column', padding: '0', background: 'rgba(10, 10, 12, 0.95)', backdropFilter: 'blur(20px)' }}>
                
                {/* Visual Status Flow Stepper - High End */}
                <div className="premium-stepper-container">
                    <div className="stepper-track">
                        {flowStates.map((state, idx) => (
                            <React.Fragment key={state}>
                                <div className={`stepper-node ${idx <= currentFlowIndex ? 'active' : ''} ${idx === currentFlowIndex ? 'current' : ''}`}>
                                    <div className="node-circle">
                                        <div className="node-inner" />
                                        <span className="node-idx">{idx + 1}</span>
                                    </div>
                                    <span className="node-label">{codes.SR_STATUS?.find(s => s.codeId === state)?.codeName || state}</span>
                                </div>
                                {idx < flowStates.length - 1 && (
                                    <div className={`stepper-connector ${idx < currentFlowIndex ? 'active' : ''}`}>
                                        <div className="connector-glow" />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <header className="premium-header">
                    <div className="header-meta">
                        <div className="id-strip">
                            <span className="req-id-text">{request.reqNumber || `#${request.id}`}</span>
                            <div className="divider-v" />
                            {sla && (
                                <div className={`sla-indicator ${sla.colorClass}`}>
                                    <span className="sla-time">{sla.text}</span>
                                    <span className="sla-label">TIME REMAINING</span>
                                </div>
                            )}
                        </div>
                        <h2 className="header-title">{request.title}</h2>
                    </div>
                    
                    <div className="header-actions">
                        <button className="btn-glass" onClick={onClose}>창 닫기</button>
                        {isAdmin && (
                            <button 
                                className="btn-glow-primary" 
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                disabled={isSaving}
                            >
                                {isSaving ? '보내는 중...' : (isEditing ? '변경사항 저장' : '수정 모드')}
                            </button>
                        )}
                    </div>
                </header>

                <div className="premium-scroll-area">
                    
                    {/* HUD: Logic Visualizer */}
                    <div className="logic-hud-panel glass-card">
                        <div className="hud-label">ITIL v5 PRIORITY CALCULATION ENGINE</div>
                        <div className="hud-content">
                            <div className="hud-item editable">
                                <label>IMPACT</label>
                                <div className="hud-value">{codes.SR_IMPACT?.find(c => c.codeId === (isEditing ? editData.srImpactCode : request.srImpactCode))?.codeName || '-'}</div>
                            </div>
                            <div className="hud-operator">×</div>
                            <div className="hud-item editable">
                                <label>URGENCY</label>
                                <div className="hud-value">{codes.SR_URGENCY?.find(c => c.codeId === (isEditing ? editData.srUrgencyCode : request.srUrgencyCode))?.codeName || '-'}</div>
                            </div>
                            <div className="hud-operator">=</div>
                            <div className="hud-item result-node">
                                <label>PRIORITY</label>
                                <div className={`hud-priority-badge ${(isEditing ? editData.priority : request.priority)?.toLowerCase()}`}>
                                    {isEditing ? editData.priority : request.priority}
                                </div>
                            </div>
                        </div>
                        <div className="hud-footer">AUTO-CALCULATION ACTIVE</div>
                    </div>

                    <div className="content-grid-system">
                        <div className="main-form">
                            <div className="glass-card field-set">
                                <div className="field-row">
                                    <div className="field-group">
                                        <label>영향도 (Impact)</label>
                                        <select disabled={!isEditing} value={isEditing ? editData.srImpactCode : request.srImpactCode} onChange={e => setEditData({...editData, srImpactCode: e.target.value})}>
                                            {codes.SR_IMPACT?.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                                        </select>
                                    </div>
                                    <div className="field-group">
                                        <label>긴급도 (Urgency)</label>
                                        <select disabled={!isEditing} value={isEditing ? editData.srUrgencyCode : request.srUrgencyCode} onChange={e => setEditData({...editData, srUrgencyCode: e.target.value})}>
                                            {codes.SR_URGENCY?.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="field-group full">
                                    <label>서비스 카테고리</label>
                                    <select disabled={!isEditing} value={isEditing ? editData.srCategoryCode : request.srCategoryCode} onChange={e => setEditData({...editData, srCategoryCode: e.target.value})}>
                                        {codes.SR_CATEGORY?.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                                    </select>
                                </div>
                                <div className="field-group full">
                                    <label>전문가 배정</label>
                                    <select disabled={!isEditing} value={(isEditing ? editData.assigneeId : request.assigneeId) || ''} onChange={e => setEditData({...editData, assigneeId: e.target.value})}>
                                        <option value="">-- 미배정 --</option>
                                        {agents.map(a => <option key={a.userId} value={a.userId}>{a.name} ({a.userId})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="glass-card field-set">
                                <div className="field-group full">
                                    <label>요청 상세 내역</label>
                                    {isEditing ? (
                                        <textarea value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} style={{ minHeight: '180px' }} />
                                    ) : (
                                        <div className="rich-display-box" style={{ minHeight: '180px' }}>{request.description}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="side-form">
                            <div className="glass-card field-set highlighted">
                                <div className="set-header">STATUS CONTROL</div>
                                <div className="field-group full">
                                    <label>현재 단계</label>
                                    <select disabled={!isEditing} value={isEditing ? editData.status : request.status} onChange={e => setEditData({...editData, status: e.target.value})} className="status-select">
                                        {codes.SR_STATUS?.map(s => <option key={s.codeId} value={s.codeId}>{s.codeName}</option>)}
                                    </select>
                                </div>
                                <div className="metadata-list">
                                    <div className="meta-item">
                                        <span className="m-label">작성자</span>
                                        <span className="m-val">{userMap[request.requesterId] || request.requesterId}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="m-label">유형</span>
                                        <span className="m-val">{codes.SR_TYPE?.find(c => c.codeId === request.srTypeCode)?.codeName || request.srTypeCode}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="m-label">최종 수정</span>
                                        <span className="m-val">{new Date(request.updatedAt || request.createdAt!).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {(isEditing ? (['RESOLVED', 'CLOSED'].includes(editData.status || '')) : (['RESOLVED', 'CLOSED'].includes(request.status))) && (
                                <div className="glass-card field-set resolution-glow">
                                    <div className="set-header green">RESOLUTION DETAILS</div>
                                    <div className="field-group full">
                                        <label>해결 코드</label>
                                        <select disabled={!isEditing} value={isEditing ? editData.srResolutionCode : request.srResolutionCode} onChange={e => setEditData({...editData, srResolutionCode: e.target.value})}>
                                            <option value="">-- 해결 코드 선택 --</option>
                                            {codes.SR_RESOLUTION?.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
                                        </select>
                                    </div>
                                    <div className="field-group full">
                                        <label>처리 내용</label>
                                        <textarea disabled={!isEditing} value={isEditing ? editData.resolutionText : request.resolutionText} onChange={e => setEditData({...editData, resolutionText: e.target.value})} style={{ minHeight: '120px' }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="timeline-panel glass-card">
                        <div className="panel-header-sub">
                            <h3>HISTORY & INVESTIGATION</h3>
                            <span className="count-badge">{comments.length} ACTIVITIES</span>
                        </div>
                        
                        <div className="timeline-table-premium">
                            <table>
                                <thead>
                                    <tr>
                                        <th className="t-time">발생 일시</th>
                                        <th className="t-user">작성자</th>
                                        <th className="t-content">설명 및 코멘트</th>
                                        <th className="t-type">분류</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comments.map(c => (
                                        <tr key={c.id} className={c.isInternal ? 'is-internal' : ''}>
                                            <td className="t-time">{new Date(c.createdAt!).toLocaleDateString()} <br/><small>{new Date(c.createdAt!).toLocaleTimeString()}</small></td>
                                            <td className="t-user">
                                                <div className="user-pill">{userMap[c.authorId] || c.authorId}</div>
                                            </td>
                                            <td className="t-content">{c.content}</td>
                                            <td className="t-type">
                                                <span className={`tag-${c.isInternal ? 'internal' : 'public'}`}>
                                                    {c.isInternal ? 'INTERNAL' : 'GENERAL'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {comments.length === 0 && (
                                        <tr><td colSpan={4} className="empty-row">기록된 이력이 없습니다.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="composer-premium">
                            <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="분석 결과 또는 대응 메시지를 입력하세요..." />
                            <div className="composer-footer">
                                <label className="internal-toggle">
                                    <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} />
                                    <span className="toggle-label">내부 전용 노트로 기록</span>
                                </label>
                                <button className="btn-send" onClick={handleAddComment}>기록 전송</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .premium-stepper-container { background: rgba(0,0,0,0.5); padding: 32px 60px; border-bottom: 2px solid rgba(255,255,255,0.03); }
                .stepper-track { display: flex; align-items: center; justify-content: space-between; max-width: 900px; margin: 0 auto; position: relative; }
                .stepper-node { display: flex; flex-direction: column; align-items: center; gap: 12px; z-index: 2; position: relative; opacity: 0.3; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
                .stepper-node.active { opacity: 1; }
                .node-circle { width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; background: #0a0a0c; position: relative; }
                .node-inner { width: 100%; height: 100%; border-radius: 50%; opacity: 0; transition: all 0.4s; position: absolute; }
                .stepper-node.active .node-circle { border-color: hsl(var(--brand-primary)); }
                .stepper-node.current .node-inner { background: radial-gradient(circle, hsl(var(--brand-primary)), transparent); opacity: 0.3; transform: scale(3); }
                .stepper-node.current .node-circle { background: hsl(var(--brand-primary)); }
                .stepper-node.current .node-idx { color: #000; font-weight: 900; }
                .node-idx { font-size: 11px; font-weight: 700; color: #fff; }
                .node-label { font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px; }
                .stepper-node.current .node-label { color: hsl(var(--brand-primary)); }
                .stepper-connector { flex: 1; height: 2px; background: rgba(255,255,255,0.05); margin: 0 10px; position: relative; overflow: hidden; }
                .stepper-connector.active { background: rgba(255,255,255,0.1); }
                .connector-glow { position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, hsl(var(--brand-primary)), transparent); opacity: 0.5; animation: flow-glow 3s infinite; }
                @keyframes flow-glow { 0% { left: -100%; } 100% { left: 100%; } }

                .premium-header { padding: 40px 60px; display: flex; justify-content: space-between; align-items: flex-end; }
                .id-strip { display: flex; align-items: center; gap: 20px; margin-bottom: 12px; }
                .req-id-text { font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 900; color: hsl(var(--brand-primary)); letter-spacing: 1px; }
                .divider-v { width: 1px; height: 12px; background: rgba(255,255,255,0.2); }
                .sla-indicator { display: flex; flex-direction: column; }
                .sla-time { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 800; line-height: 1; }
                .sla-label { font-size: 8px; font-weight: 700; opacity: 0.5; margin-top: 2px; }
                .header-title { font-size: 32px; font-weight: 900; letter-spacing: -1px; }
                .btn-glass { border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: #fff; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.3s; }
                .btn-glass:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.3); }
                .btn-glow-primary { background: hsl(var(--brand-primary)); color: #000; border: none; padding: 12px 32px; border-radius: 12px; font-weight: 800; cursor: pointer; box-shadow: 0 0 20px hsla(var(--brand-primary), 0.3); transition: all 0.3s; }
                .btn-glow-primary:hover { transform: translateY(-2px); box-shadow: 0 0 30px hsla(var(--brand-primary), 0.5); }

                .premium-scroll-area { flex: 1; overflow-y: auto; padding: 0 60px 60px; }
                .logic-hud-panel { background: linear-gradient(135deg, rgba(20,20,25,0.8), rgba(10,10,12,0.9)); border: 1px solid rgba(255,255,255,0.05); padding: 32px; margin-bottom: 48px; border-radius: 24px; position: relative; }
                .hud-label { position: absolute; top: 12px; left: 24px; font-size: 9px; font-weight: 900; color: rgba(255,255,255,0.3); letter-spacing: 2px; }
                .hud-content { display: flex; align-items: center; justify-content: center; gap: 40px; }
                .hud-item { display: flex; flex-direction: column; align-items: center; gap: 8px; }
                .hud-item label { font-size: 10px; font-weight: 800; opacity: 0.4; }
                .hud-value { font-size: 20px; font-weight: 900; }
                .hud-operator { font-size: 24px; font-weight: 200; opacity: 0.2; }
                .hud-priority-badge { font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 950; padding: 8px 32px; border-radius: 8px; box-shadow: 0 10px 20px rgba(0,0,0,0.5); }
                .hud-priority-badge.p1 { background: linear-gradient(135deg, #ff4d4d, #990000); color: #fff; text-shadow: 0 0 10px #ff0000; }
                .hud-priority-badge.p2 { background: linear-gradient(135deg, #ffaa00, #cc7a00); color: #000; }
                .hud-priority-badge.p3 { background: linear-gradient(135deg, #0088ff, #004488); color: #fff; }
                .hud-priority-badge.p4 { background: linear-gradient(135deg, #555, #222); color: #ccc; }
                .hud-footer { position: absolute; bottom: 12px; right: 24px; font-size: 8px; font-weight: 800; color: hsl(var(--brand-primary)); opacity: 0.6; }

                .content-grid-system { display: grid; grid-template-columns: 2fr 1fr; gap: 40px; margin-bottom: 48px; }
                .field-set { padding: 32px; display: flex; flex-direction: column; gap: 32px; margin-bottom: 24px; }
                .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
                .field-group label { font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.4); margin-bottom: 12px; display: block; text-transform: uppercase; }
                .field-group select, .field-group textarea { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; color: #fff; padding: 14px 20px; font-size: 14px; transition: all 0.3s; }
                .field-group select:focus, .field-group textarea:focus { border-color: hsl(var(--brand-primary)); background: rgba(255,255,255,0.06); outline: none; }
                .rich-display-box { padding: 20px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; font-size: 15px; line-height: 1.7; color: rgba(255,255,255,0.8); white-space: pre-wrap; }

                .highlighted { background: linear-gradient(135deg, rgba(80, 80, 100, 0.05), transparent); border: 1px solid hsla(var(--brand-primary), 0.1); }
                .set-header { font-size: 10px; font-weight: 900; color: hsl(var(--brand-primary)); letter-spacing: 2px; margin-bottom: 16px; border-left: 3px solid hsl(var(--brand-primary)); padding-left: 12px; }
                .set-header.green { color: #00ff88; border-color: #00ff88; }
                .resolution-glow { box-shadow: 0 0 30px rgba(0, 255, 136, 0.05); border-color: rgba(0, 255, 136, 0.2); }
                .metadata-list { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.05); paddingTop: 24px; }
                .meta-item { display: flex; justify-content: space-between; align-items: center; }
                .m-label { font-size: 11px; font-weight: 700; opacity: 0.4; }
                .m-val { font-size: 13px; font-weight: 800; }

                .timeline-panel { padding: 40px; }
                .panel-header-sub { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
                .panel-header-sub h3 { font-size: 18px; font-weight: 900; letter-spacing: 1px; }
                .count-badge { padding: 4px 12px; background: rgba(255,255,255,0.05); border-radius: 20px; font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.5); }
                .timeline-table-premium table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
                .timeline-table-premium th { padding: 12px 24px; font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.3); text-transform: uppercase; text-align: left; }
                .timeline-table-premium td { padding: 20px 24px; background: rgba(255,255,255,0.02); vertical-align: middle; transition: all 0.2s; }
                .timeline-table-premium tr:hover td { background: rgba(255,255,255,0.04); }
                .timeline-table-premium tr td:first-child { border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
                .timeline-table-premium tr td:last-child { border-top-right-radius: 12px; border-bottom-right-radius: 12px; }
                .t-time { font-family: 'JetBrains Mono', monospace; line-height: 1.4; color: rgba(255,255,255,0.4); }
                .user-pill { padding: 6px 16px; background: rgba(255,255,255,0.05); border-radius: 30px; font-size: 13px; font-weight: 700; width: fit-content; }
                .t-content { font-size: 14px; opacity: 0.9; line-height: 1.5; }
                .is-internal td { border: 1px solid rgba(255, 170, 0, 0.1); border-left: none; border-right: none; }
                .is-internal td:first-child { border-left: 2px solid #ffaa00; }
                .tag-internal { color: #ffaa00; font-size: 10px; font-weight: 900; }
                .tag-public { color: rgba(255,255,255,0.2); font-size: 10px; font-weight: 900; }

                .composer-premium { margin-top: 48px; display: flex; flex-direction: column; gap: 20px; }
                .composer-premium textarea { width: 100%; background: rgba(255,255,255,0.03); border: 2px solid rgba(255,255,255,0.05); border-radius: 16px; color: #fff; padding: 24px; font-size: 15px; min-height: 120px; transition: all 0.3s; }
                .composer-premium textarea:focus { border-color: hsl(var(--brand-primary)); background: rgba(255,255,255,0.06); outline: none; }
                .composer-footer { display: flex; justify-content: space-between; align-items: center; }
                .internal-toggle { display: flex; align-items: center; gap: 12px; cursor: pointer; }
                .toggle-label { font-size: 13px; font-weight: 800; color: #ffaa00; }
                .btn-send { background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 14px 40px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: all 0.3s; }
                .btn-send:hover { background: #fff; color: #000; }
            `}</style>
        </div>
    );
};

export default RequestDetail;
