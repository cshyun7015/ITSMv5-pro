import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/apiRequest';
import apiUser from '../../api/apiUser';
import type { RequestItem } from '../../api/apiRequest';
import RequestDetail from './RequestDetail.tsx';
import RequestForm from './RequestForm.tsx';
import './Request.css';

const RequestList: React.FC = () => {
    const [requests, setRequests] = useState<RequestItem[]>([]);
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [userMap, setUserMap] = useState<{[key: string]: string}>({});
    
    // Pagination & Sorting States
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: '',
        title: '',
        requesterId: ''
    });

    useEffect(() => {
        loadRequests();
        loadUsers();
    }, [page, sortBy, sortDir]); // Reload on page or sort change

    const loadUsers = async () => {
        try {
            const users = await apiUser.list('all');
            const map: {[key: string]: string} = {};
            users.forEach((u: any) => { map[u.userId] = u.name; });
            setUserMap(map);
        } catch (err) {
            console.error('Failed to load users for mapping', err);
        }
    };

    const loadRequests = async () => {
        try {
            const res = await apiRequest.getRequests({
                fromDate: filters.fromDate || undefined,
                toDate: filters.toDate || undefined,
                title: filters.title || undefined,
                requesterId: filters.requesterId || undefined,
                page,
                size,
                sort: `${sortBy},${sortDir}`
            });
            setRequests(res.data.content);
            setTotalElements(res.data.totalElements);
        } catch (err) {
            console.error('Failed to load requests', err);
        }
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDir('asc');
        }
        setPage(0); // Reset to first page on sort
    };

    const handleSearch = () => {
        setPage(0);
        loadRequests();
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        const y = d.getFullYear();
        const m = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${y}.${m}.${day}`;
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
            <div className="request-list-panel glass-card" style={{ paddingBottom: '32px' }}>
                <header className="panel-header" style={{ borderBottom: 'none' }}>
                    <div>
                        <h2 style={{ fontSize: '22px', fontWeight: 800 }}>요청 목록</h2>
                        <p>지원 티켓 및 서비스 요청을 추적하고 관리합니다.</p>
                    </div>
                    <button 
                        onClick={() => setIsFormOpen(true)}
                        className="btn-primary"
                        style={{ padding: '12px 32px', borderRadius: '12px', fontSize: '14px', fontWeight: 700 }}
                    >
                        등록
                    </button>
                </header>

                {/* New Search Filter Bar */}
                <div className="filter-bar" style={{ 
                    display: 'flex', 
                    gap: '20px', 
                    padding: '0 32px 32px', 
                    borderBottom: '1px solid var(--glass-border)',
                    alignItems: 'flex-end',
                    flexWrap: 'wrap'
                }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>요청일자 (FROM ~ TO)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="custom-date-container" onClick={(e) => {
                                const input = e.currentTarget.querySelector('input');
                                if (input && 'showPicker' in input) (input as any).showPicker();
                            }} style={{ width: '150px' }}>
                                <div className="display-value">{filters.fromDate ? filters.fromDate.replace(/-/g, '.') : '연도. 월. 일.'}</div>
                                <input 
                                    type="date" 
                                    value={filters.fromDate}
                                    onChange={e => setFilters({...filters, fromDate: e.target.value})}
                                />
                            </div>
                            <span style={{ color: 'var(--text-secondary)' }}>~</span>
                            <div className="custom-date-container" onClick={(e) => {
                                const input = e.currentTarget.querySelector('input');
                                if (input && 'showPicker' in input) (input as any).showPicker();
                            }} style={{ width: '150px' }}>
                                <div className="display-value">{filters.toDate ? filters.toDate.replace(/-/g, '.') : '연도. 월. 일.'}</div>
                                <input 
                                    type="date" 
                                    value={filters.toDate}
                                    onChange={e => setFilters({...filters, toDate: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '150px' }}>
                        <label style={{ fontSize: '11px' }}>제목</label>
                        <input type="text" placeholder="제목 검색..." value={filters.title} onChange={e => setFilters({...filters, title: e.target.value})} style={{ padding: '6px' }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '11px' }}>요청자</label>
                        <input type="text" placeholder="요청자..." value={filters.requesterId} onChange={e => setFilters({...filters, requesterId: e.target.value})} style={{ width: '120px', padding: '6px' }} />
                    </div>
                    <button onClick={handleSearch} className="btn-secondary" style={{ height: '35px', padding: '0 24px', fontSize: '13px', borderRadius: '8px' }}>조회</button>
                </div>

                <div className="panel-body" style={{ padding: '0 16px' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer', width: '150px' }}>
                                    요청일자 {sortBy === 'createdAt' && (sortDir === 'asc' ? '▴' : '▾')}
                                </th>
                                <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                                    제목 {sortBy === 'title' && (sortDir === 'asc' ? '▴' : '▾')}
                                </th>
                                <th onClick={() => handleSort('requesterId')} style={{ cursor: 'pointer', width: '120px' }}>
                                    요청자 {sortBy === 'requesterId' && (sortDir === 'asc' ? '▴' : '▾')}
                                </th>
                                <th onClick={() => handleSort('priority')} style={{ cursor: 'pointer', width: '100px' }}>
                                    우선순위 {sortBy === 'priority' && (sortDir === 'asc' ? '▴' : '▾')}
                                </th>
                                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer', width: '120px' }}>
                                    상태 {sortBy === 'status' && (sortDir === 'asc' ? '▴' : '▾')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr 
                                    key={req.id} 
                                    onClick={() => setSelectedRequestId(req.id || null)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        {formatDate(req.createdAt)}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: 'white' }}>{req.title}</div>
                                    </td>
                                    <td style={{ fontSize: '13px' }}>{userMap[req.requesterId] || req.requesterId}</td>
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
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ padding: '80px', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                        조건에 맞는 요청이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Footer */}
                    <div className="pagination-footer" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '20px 16px',
                        marginTop: '16px',
                        borderTop: '1px solid var(--glass-border)',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '0 0 12px 12px'
                    }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            전체 <span style={{ color: 'white', fontWeight: 600 }}>{totalElements}</span> 건
                        </div>
                        <div className="pagination-controls" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button 
                                className="btn-icon" 
                                disabled={page === 0} 
                                onClick={() => setPage(page - 1)}
                                style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'white' }}
                            >
                                ◀
                            </button>
                            <div style={{ fontSize: '13px', padding: '0 12px' }}>
                                페이지 <strong>{page + 1}</strong>
                            </div>
                            <button 
                                className="btn-icon" 
                                disabled={(page + 1) * size >= totalElements} 
                                onClick={() => setPage(page + 1)}
                                style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'white' }}
                            >
                                ▶
                            </button>
                        </div>
                    </div>
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
