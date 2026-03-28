import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/apiRequest';
import type { RequestItem } from '../../api/apiRequest';
import RequestDetail from './RequestDetail.tsx';
import RequestForm from './RequestForm.tsx';
import './Request.css';

const RequestList: React.FC = () => {
    const [requests, setRequests] = useState<RequestItem[]>([]);
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        loadRequests();
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const loadRequests = async () => {
        try {
            const res = await apiRequest.getRequests();
            setRequests(res.data);
        } catch (err) {
            console.error('Failed to load requests', err);
        }
    };

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

    const getStatusClass = (status: string) => {
        switch (status.toUpperCase()) {
            case 'OPEN': return 'status-open';
            case 'IN_PROGRESS': return 'status-progress';
            case 'RESOLVED': return 'status-resolved';
            case 'CLOSED': return 'status-closed';
            default: return '';
        }
    };

    const getPriorityClass = (priority: string) => {
        switch (priority.toUpperCase()) {
            case 'HIGH':
            case 'CRITICAL': return 'priority-high';
            case 'MEDIUM': return 'priority-medium';
            case 'LOW': return 'priority-low';
            default: return '';
        }
    };

    return (
        <div className="request-container">
            <div className="request-list-panel glass-card">
                <header className="panel-header">
                    <div>
                        <h2>Service Requests</h2>
                        <p>Track and manage support tickets and service requests.</p>
                    </div>
                    <button 
                        onClick={() => setIsFormOpen(true)}
                        className="btn-primary"
                    >
                        + New Request
                    </button>
                </header>

                <div className="panel-body">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Number</th>
                                <th>Title</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>SLA Target</th>
                                <th style={{ textAlign: 'right' }}>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => {
                                const sla = getSLARemaining(req.slaTargetAt);
                                return (
                                    <tr 
                                        key={req.id} 
                                        onClick={() => setSelectedRequestId(req.id || null)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td className="code-id-cell">{req.reqNumber}</td>
                                        <td>
                                            <div className="code-name-cell">{req.title}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{req.description}</div>
                                        </td>
                                        <td>
                                            <span className={`priority-badge ${getPriorityClass(req.priority)}`}>
                                                {req.priority}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td>
                                            {sla && (
                                                <div className={`sla-badge ${sla.colorClass}`}>
                                                    <div className="sla-dot animate-pulse"></div>
                                                    <span>{sla.text}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-secondary)' }}>
                                            {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                        No service requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedRequestId && (
                <RequestDetail 
                    requestId={selectedRequestId} 
                    onClose={() => setSelectedRequestId(null)}
                    onUpdated={loadRequests}
                />
            )}

            {isFormOpen && (
                <RequestForm 
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onCreated={loadRequests}
                />
            )}
        </div>
    );
};

export default RequestList;
