import { useState, useEffect } from 'react';
import { apiRequest, type RequestItem } from './api/apiRequest';
import apiUser from '../../api/apiUser';
import RequestForm from './RequestForm';
import RequestDetail from './RequestDetail';
import { formatDate } from './utils/requestUtils';
import './Request.css';

const RequestSkeleton = () => (
    <>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <tr key={i} className="table-row" style={{ pointerEvents: 'none' }}>
                <td><div className="skeleton" style={{ height: '20px', width: '80%' }}></div></td>
                <td><div className="skeleton" style={{ height: '20px', width: '90%' }}></div></td>
                <td><div className="skeleton" style={{ height: '20px', width: '100px' }}></div></td>
                <td><div className="skeleton" style={{ height: '24px', width: '60px', borderRadius: '12px' }}></div></td>
                <td><div className="skeleton" style={{ height: '24px', width: '80px', borderRadius: '12px' }}></div></td>
            </tr>
        ))}
    </>
);

const RequestList = () => {
    const [requests, setRequests] = useState<RequestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
    const [userMap, setUserMap] = useState<{[key: string]: string}>({});

    // Pagination & Sort
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    // Filters
    const [filters, setFilters] = useState({
        title: '',
        requesterId: '',
        fromDate: (function() {
            const d = new Date();
            d.setMonth(d.getMonth() - 1);
            return d.toISOString().split('T')[0];
        })(),
        toDate: new Date().toISOString().split('T')[0]
    });

    const loadRequests = async () => {
        try {
            setLoading(true);
            const res = await apiRequest.getRequests({
                title: filters.title || undefined,
                requesterId: filters.requesterId || undefined,
                fromDate: filters.fromDate || undefined,
                toDate: filters.toDate || undefined,
                page,
                size,
                sort: `${sortBy},${sortDir}`
            });
            setRequests(res.data.content);
            setTotalElements(res.data.totalElements);
        } catch (err) {
            console.error('Failed to load requests', err);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const res = await apiUser.list({ size: 2000 });
            const map: {[key: string]: string} = {};
            res.content.forEach((u: any) => { map[u.userId] = u.name; });
            setUserMap(map);
        } catch (err) {
            console.error('Failed to load users for mapping', err);
        }
    };

    useEffect(() => {
        loadRequests();
        loadUsers();
    }, [page, sortBy, sortDir]);

    const handleSearch = () => {
        setPage(0);
        loadRequests();
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDir('asc');
        }
        setPage(0);
    };

    return (
        <div className="request-feature">
            <div className="panel-header">
                <div>
                    <h2>요청 목록</h2>
                    <p>지원 티켓 및 서비스 요청을 추적하고 관리합니다.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleSearch} className="btn-premium-secondary" style={{ padding: '0 24px' }}>조회</button>
                    <button onClick={() => setIsFormOpen(true)} className="btn-premium" style={{ padding: '0 32px' }}>등록</button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar premium-card" style={{ display: 'flex', gap: '20px', padding: '24px', marginBottom: '24px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>요청일자 (FROM ~ TO)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="custom-date-container">
                            <span className="display-value">{formatDate(filters.fromDate)}</span>
                            <input 
                                type="date" 
                                value={filters.fromDate}
                                onChange={e => setFilters({...filters, fromDate: e.target.value})}
                            />
                        </div>
                        <span style={{ color: 'var(--text-muted)' }}>~</span>
                        <div className="custom-date-container">
                            <span className="display-value">{formatDate(filters.toDate)}</span>
                            <input 
                                type="date" 
                                value={filters.toDate}
                                onChange={e => setFilters({...filters, toDate: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0, width: '220px' }}>
                    <label>제목</label>
                    <input 
                        type="text" 
                        placeholder="제목 검색..." 
                        value={filters.title} 
                        onChange={e => setFilters({...filters, title: e.target.value})}
                    />
                </div>
                <div className="form-group" style={{ marginBottom: 0, width: '180px' }}>
                    <label>요청자</label>
                    <input 
                        type="text" 
                        placeholder="요청자 ID..." 
                        value={filters.requesterId} 
                        onChange={e => setFilters({...filters, requesterId: e.target.value})}
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer', width: '150px' }}>
                                요청일자 {sortBy === 'createdAt' && (sortDir === 'asc' ? '▴' : '▾')}
                            </th>
                            <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                                제목 {sortBy === 'title' && (sortDir === 'asc' ? '▴' : '▾')}
                            </th>
                            <th onClick={() => handleSort('requesterId')} style={{ cursor: 'pointer', width: '150px' }}>
                                요청자 {sortBy === 'requesterId' && (sortDir === 'asc' ? '▴' : '▾')}
                            </th>
                            <th onClick={() => handleSort('priority')} style={{ cursor: 'pointer', width: '130px' }}>
                                우선순위 {sortBy === 'priority' && (sortDir === 'asc' ? '▴' : '▾')}
                            </th>
                            <th onClick={() => handleSort('status')} style={{ cursor: 'pointer', width: '160px' }}>
                                상태 {sortBy === 'status' && (sortDir === 'asc' ? '▴' : '▾')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <RequestSkeleton />
                        ) : requests.length > 0 ? requests.map(req => (
                            <tr 
                                key={req.id} 
                                className="table-row"
                                onClick={() => setSelectedRequestId(req.id || null)}
                            >
                                <td style={{ color: 'var(--text-muted)' }}>{formatDate(req.createdAt)}</td>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{req.title}</div>
                                </td>
                                <td>{userMap[req.requesterId] || req.requesterId}</td>
                                <td>
                                    <div className={`priority-marker priority-${req.priority?.toLowerCase()}`}>
                                        <span className="priority-dot"></span>
                                        {req.priority}
                                    </div>
                                </td>
                                <td>
                                    <div className={`status-indicator status-${req.status?.toLowerCase()?.replace('_', '-')}`}>
                                        <span>{req.status}</span>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>조건에 맞는 요청이 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="table-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>전체 {totalElements} 건</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                        disabled={page === 0} 
                        onClick={(e) => { e.stopPropagation(); setPage(p => p - 1); }}
                        className="btn-premium-secondary"
                        style={{ padding: '0', minWidth: '40px', height: '36px' }}
                    >
                        ◀
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: 800, margin: '0 12px' }}>{page + 1}</span>
                    <button 
                        disabled={(page + 1) * size >= totalElements} 
                        onClick={(e) => { e.stopPropagation(); setPage(p => p + 1); }}
                        className="btn-premium-secondary"
                        style={{ padding: '0', minWidth: '40px', height: '36px' }}
                    >
                        ▶
                    </button>
                </div>
            </div>

            {isFormOpen && (
                <RequestForm 
                    onClose={() => setIsFormOpen(false)} 
                    onSuccess={() => { setIsFormOpen(false); loadRequests(); }}
                />
            )}
            {selectedRequestId && (
                <RequestDetail 
                    requestId={selectedRequestId} 
                    onClose={() => setSelectedRequestId(null)} 
                    onUpdated={loadRequests}
                />
            )}
        </div>
    );
};

export default RequestList;
