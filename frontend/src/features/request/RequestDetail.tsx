import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/apiRequest';
import apiUser, { type UserDTO } from '../../api/apiUser';
import type { RequestItem, RequestComment } from '../../api/apiRequest';
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
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<RequestItem>>({});
    const [newComment, setNewComment] = useState('');
    const [isInternal, setIsInternal] = useState(false);

    useEffect(() => {
        loadDetail();
    }, [requestId]);

    const loadDetail = async () => {
        try {
            const [reqRes, comRes, agentRes] = await Promise.all([
                apiRequest.getRequest(requestId),
                apiRequest.getComments(requestId),
                apiUser.list('MSP') // Fetch agents from MSP company
            ]);
            
            setRequest(reqRes.data);
            setEditData(reqRes.data);
            setComments(comRes.data);
            
            // Filter agents: ROLE_ADMIN or ROLE_OPERATOR
            // agentRes is the array of UserDTO
            const filteredAgents = agentRes.filter((u: any) => 
                u.role === 'ROLE_ADMIN' || u.role === 'ROLE_OPERATOR'
            );
            setAgents(filteredAgents);
        } catch (err) {
            console.error('Failed to load request detail', err);
        }
    };

    const handleSave = async () => {
        if (!request) return;
        try {
            await apiRequest.updateRequest(requestId, editData as RequestItem);
            setIsEditing(false);
            onUpdated();
            loadDetail();
        } catch (err) {
            alert('Failed to save changes');
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!request) return;
        try {
            await apiRequest.updateRequest(requestId, { ...request, status: newStatus });
            onUpdated();
            loadDetail();
        } catch (err) {
            alert('Failed to update status');
        }
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

    const statusOptions = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    return (
        <div className="request-detail-fixed">
            <div className="request-detail-content glass-card shadow-2xl">
                <header className="panel-header">
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className="code-id-cell">{request.reqNumber}</span>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={editData.title} 
                                    onChange={e => setEditData({...editData, title: e.target.value})}
                                    style={{ background: 'rgba(255,255,255,0.05)', fontSize: '20px', fontWeight: 'bold', border: '1px solid var(--brand-primary)', flex: 1 }}
                                />
                            ) : (
                                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{request.title}</span>
                            )}
                        </div>
                        <p className="panel-subtitle">Requester: {request.requesterId} | Created: {new Date(request.createdAt!).toLocaleString()}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        {isEditing ? (
                            <>
                                <button onClick={handleSave} className="btn-primary" style={{ padding: '8px 20px' }}>SAVE</button>
                                <button onClick={() => setIsEditing(false)} className="btn-ghost">CANCEL</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setIsEditing(true)} className="btn-ghost">EDIT</button>
                                <button 
                                    onClick={async () => {
                                        if (window.confirm('Are you sure you want to delete this request?')) {
                                            try {
                                                await apiRequest.deleteRequest(requestId);
                                                onUpdated();
                                                onClose();
                                            } catch (err) {
                                                alert('Failed to delete request');
                                            }
                                        }
                                    }}
                                    className="btn-ghost"
                                    style={{ color: '#ff4d4d', borderColor: 'rgba(255, 77, 77, 0.3)' }}
                                >
                                    DELETE
                                </button>
                            </>
                        )}
                        <button onClick={onClose} className="btn-ghost" style={{ fontSize: '20px' }}>&times;</button>
                    </div>
                </header>

                <div className="detail-main">
                    {/* Left: Info */}
                    <div className="detail-info">
                        <div className="form-group" style={{ marginBottom: '32px' }}>
                            <label>Status Control</label>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                {statusOptions.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => handleStatusChange(s)}
                                        className={`btn-ghost ${request.status === s ? 'active' : ''}`}
                                        style={{ 
                                            padding: '12px',
                                            background: request.status === s ? 'hsla(184, 100%, 50%, 0.1)' : 'transparent',
                                            borderColor: request.status === s ? 'hsla(184, 100%, 50%, 0.3)' : 'var(--glass-border)',
                                            color: request.status === s ? 'hsl(var(--brand-primary))' : 'var(--text-secondary)'
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Priority</label>
                            {isEditing ? (
                                <select 
                                    value={editData.priority} 
                                    onChange={e => setEditData({...editData, priority: e.target.value})}
                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white', width: '100%' }}
                                >
                                    {priorityOptions.map(p => <option key={p} value={p} style={{ background: '#121214' }}>{p}</option>)}
                                </select>
                            ) : (
                                <div className="code-name-cell">{request.priority}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Assigned To (Select Member)</label>
                            {isEditing ? (
                                <select
                                    value={editData.assigneeId || ''} 
                                    onChange={e => setEditData({...editData, assigneeId: e.target.value})}
                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white', width: '100%' }}
                                >
                                    <option value="" style={{ background: '#121214' }}>-- Unassigned --</option>
                                    {agents.map(a => (
                                        <option key={a.userId} value={a.userId} style={{ background: '#121214' }}>
                                            {a.name} ({a.userId})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="code-name-cell">
                                    {agents.find(a => a.userId === request.assigneeId)?.name || request.assigneeId || 'Unassigned'}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            {isEditing ? (
                                <textarea 
                                    value={editData.description} 
                                    onChange={e => setEditData({...editData, description: e.target.value})}
                                    style={{ minHeight: '150px' }}
                                />
                            ) : (
                                <div style={{ 
                                    background: 'rgba(255,255,255,0.05)', 
                                    padding: '12px', 
                                    borderRadius: '8px', 
                                    border: '1px solid var(--glass-border)',
                                    fontSize: '13px',
                                    color: 'var(--text-primary)',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {request.description}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Timeline */}
                    <div className="detail-timeline">
                        <div className="comments-list">
                            {comments.length > 0 ? comments.map(c => (
                                <div key={c.id} style={{ display: 'flex', flexDirection: 'column', alignItems: c.isInternal ? 'flex-end' : 'flex-start' }}>
                                    <div className={`comment-bubble ${c.isInternal ? 'internal' : 'external'}`}>
                                        <div className="comment-header">
                                            {c.isInternal ? 'Internal Note' : 'Communication'}
                                        </div>
                                        <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>{c.content}</div>
                                        <div className="comment-meta">
                                            <span>{c.authorId}</span>
                                            <span>{new Date(c.createdAt!).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '14px' }}>
                                    No communication history yet.
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleAddComment} className="comment-form">
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: isInternal ? '#ffaa00' : 'var(--text-secondary)' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={isInternal} 
                                        onChange={e => setIsInternal(e.target.checked)}
                                        style={{ width: '16px', height: '16px' }}
                                    />
                                    INTERNAL WORKNOTE
                                </label>
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <textarea
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    placeholder="Add a comment or worknote..."
                                    style={{ flex: 1, minHeight: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}
                                />
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{ height: 'fit-content', marginTop: 'auto' }}
                                >
                                    POST
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestDetail;
