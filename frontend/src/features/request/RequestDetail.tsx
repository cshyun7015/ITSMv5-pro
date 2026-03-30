import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRequestDetail } from './hooks/useRequestDetail';
import RequestStatusStepper from './components/RequestStatusStepper';
import RequestLogicHUD from './components/RequestLogicHUD';
import RequestCommentTimeline from './components/RequestCommentTimeline';
import RequestResolutionForm from './components/RequestResolutionForm';
import { calculatePriority } from './utils/requestUtils';
import type { RequestItem } from './api/apiRequest';
import './Request.css';

interface Props {
    requestId: number;
    onClose: () => void;
    onUpdated: () => void;
}

const RequestDetail: React.FC<Props> = ({ requestId, onClose, onUpdated }) => {
    const {
        request,
        comments,
        agents,
        userMap,
        codes,
        loading,
        isSaving,
        updateRequest,
        addComment
    } = useRequestDetail(requestId);

    const storedUser = localStorage.getItem('authUser');
    const authUser = storedUser ? JSON.parse(storedUser) : null;
    const userRole = authUser?.role || 'ROLE_USER';
    const isAdmin = userRole?.includes('ADMIN') || userRole?.includes('OPERATOR') || userRole?.includes('MANAGER');

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<RequestItem>>({});
    const [newComment, setNewComment] = useState('');
    const [isInternal, setIsInternal] = useState(false);

    const handleEditToggle = () => {
        if (!isEditing && request) {
            setEditData(request);
        }
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        const finalData = {
            ...editData,
            priority: calculatePriority(editData.srImpactCode, editData.srUrgencyCode)
        };

        if (isAdmin && (finalData.status === 'RESOLVED' || finalData.status === 'CLOSED')) {
            if (!finalData.srResolutionCode || !finalData.resolutionText) {
                alert('해결 시 해결 코드와 해결 내용을 입력해야 합니다.');
                return;
            }
        }

        const success = await updateRequest(finalData);
        if (success) {
            setIsEditing(false);
            onUpdated();
            onClose();
        } else {
            alert('요청 저장에 실패했습니다.');
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        const success = await addComment(newComment, isInternal);
        if (success) {
            setNewComment('');
        } else {
            alert('댓글 등록에 실패했습니다.');
        }
    };

    const isAttributeEditable = (segment: 'CORE' | 'CLASSIFICATION' | 'SLA' | 'OWNERSHIP' | 'RESOLUTION') => {
        if (!isEditing || !request) return false;
        const status = request.status;
        if (['CLOSED', 'CANCELLED'].includes(status)) return false;

        switch (segment) {
            case 'CORE': return ['OPEN', 'ASSIGNED'].includes(status);
            case 'CLASSIFICATION':
            case 'SLA': return ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(status);
            case 'OWNERSHIP': return ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED'].includes(status);
            case 'RESOLUTION': return ['IN_PROGRESS', 'RESOLVED'].includes(status);
            default: return false;
        }
    };

    const getEditableStyle = (segment: 'CORE' | 'CLASSIFICATION' | 'SLA' | 'OWNERSHIP' | 'RESOLUTION') => {
        if (!isEditing) return {};
        const editable = isAttributeEditable(segment);
        return editable ? {} : { opacity: 0.6, cursor: 'not-allowed' };
    };

    if (loading) return <div className="modal-overlay"><div className="loader">Loading...</div></div>;
    if (!request) return null;

    const currentImpact = isEditing ? editData.srImpactCode : request.srImpactCode;
    const currentUrgency = isEditing ? editData.srUrgencyCode : request.srUrgencyCode;
    const currentPriority = calculatePriority(currentImpact, currentUrgency);

    return (
        <div className="modal-overlay animate-fade-in" style={{ zIndex: 1000 }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="modal-content premium-card" 
                style={{ width: '900px', height: '94vh', display: 'flex', flexDirection: 'column', padding: '0', background: 'rgba(10, 10, 12, 0.95)', backdropFilter: 'blur(20px)' }}
            >
                <RequestStatusStepper status={isEditing ? editData.status || '' : request.status} />

                <header className="premium-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 60px' }}>
                    <div className="header-meta" style={{ flex: 1 }}>
                        <div className="id-strip"><span className="req-id-text">{request.reqNumber || `#${request.id}`}</span></div>
                        <h2 className="header-title" style={{ margin: 0 }}>{request.title}</h2>
                    </div>
                    <div className="header-actions">
                        <button className="btn-premium-secondary btn-header" onClick={onClose}>목록</button>
                        {isAdmin && !['CLOSED', 'CANCELLED'].includes(request.status) && (
                            <button 
                                className="btn-premium btn-header" 
                                onClick={isEditing ? handleSave : handleEditToggle}
                                disabled={isSaving}
                            >
                                {isSaving ? '저장...' : (isEditing ? '저장' : '수정')}
                            </button>
                        )}
                    </div>
                </header>

                <div className="premium-scroll-area" style={{ padding: '0 60px 100px' }}>
                    <div className="premium-card field-set" style={{ background: 'hsla(0, 0%, 100%, 0.02)', padding: '32px' }}>
                        <div className="content-grid-system">
                            <div className="form-group">
                                <label>영향도 (Impact)</label>
                                <select 
                                    disabled={!isAttributeEditable('SLA')} 
                                    value={currentImpact} 
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
                                    value={currentUrgency} 
                                    onChange={e => setEditData({...editData, srUrgencyCode: e.target.value})}
                                    style={getEditableStyle('SLA')}
                                >
                                    {codes.SR_URGENCY?.map(c => <option key={c.codeId} value={c.codeId}>{c.codeName}</option>)}
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
                                <label>현재 단계</label>
                                <select 
                                    disabled={!isEditing} 
                                    value={isEditing ? editData.status : request.status} 
                                    onChange={e => setEditData({...editData, status: e.target.value})}
                                >
                                    {codes.SR_STATUS?.map(s => <option key={s.codeId} value={s.codeId}>{s.codeName}</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '12px' }}>
                                <RequestLogicHUD priority={currentPriority} />
                            </div>
                        </div>
                    </div>

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

                    <RequestResolutionForm 
                        isAdmin={isAdmin}
                        status={isEditing ? editData.status || '' : request.status}
                        resolutionCode={isEditing ? editData.srResolutionCode || '' : request.srResolutionCode || ''}
                        resolutionText={isEditing ? editData.resolutionText || '' : request.resolutionText || ''}
                        setResolutionCode={(val: string) => setEditData({...editData, srResolutionCode: val})}
                        setResolutionText={(val: string) => setEditData({...editData, resolutionText: val})}
                        codes={codes}
                        isAttributeEditable={isAttributeEditable}
                        getEditableStyle={getEditableStyle}
                    />

                    <RequestCommentTimeline 
                        comments={comments}
                        userMap={userMap}
                        newComment={newComment}
                        setNewComment={setNewComment}
                        isInternal={isInternal}
                        setIsInternal={setIsInternal}
                        onAddComment={handleAddComment}
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default RequestDetail;
