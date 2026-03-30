import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RequestComment } from '../api/apiRequest';
import { formatDate, formatTime } from '../utils/requestUtils';

interface Props {
    comments: RequestComment[];
    userMap: {[key: string]: string};
    newComment: string;
    setNewComment: (val: string) => void;
    isInternal: boolean;
    setIsInternal: (val: boolean) => void;
    onAddComment: () => void;
}

const RequestCommentTimeline: React.FC<Props> = ({ 
    comments, 
    userMap, 
    newComment, 
    setNewComment, 
    isInternal, 
    setIsInternal, 
    onAddComment 
}) => {
    return (
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
                                        {formatDate(c.createdAt)} <br/>
                                        {formatTime(c.createdAt)}
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
                    <button className="btn-premium" onClick={onAddComment} style={{ width: '120px' }}>기록</button>
                </div>
            </div>
        </div>
    );
};

export default RequestCommentTimeline;
