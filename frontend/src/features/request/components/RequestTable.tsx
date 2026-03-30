import React from 'react';
import { formatDate } from '../utils/requestUtils';
import type { RequestItem } from '../api/apiRequest';

const RequestSkeleton = () => (
    <>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <tr key={i} className="table-row pointer-events-none">
                <td><div className="skeleton h-20 w-80"></div></td>
                <td><div className="skeleton h-20 w-90"></div></td>
                <td><div className="skeleton h-20 w-100"></div></td>
                <td><div className="skeleton h-24 w-60 rounded-12"></div></td>
                <td><div className="skeleton h-24 w-80 rounded-12"></div></td>
            </tr>
        ))}
    </>
);

interface TableProps {
    requests: RequestItem[];
    loading: boolean;
    userMap: { [key: string]: string };
    sortBy: string;
    sortDir: 'asc' | 'desc';
    handleSort: (field: string) => void;
    onRowClick: (id: number) => void;
}

const RequestTable: React.FC<TableProps> = ({ 
    requests, 
    loading, 
    userMap, 
    sortBy, 
    sortDir, 
    handleSort,
    onRowClick
}) => {
    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th onClick={() => handleSort('createdAt')} className="cursor-pointer w-150">
                            요청일자 {sortBy === 'createdAt' && (sortDir === 'asc' ? '▴' : '▾')}
                        </th>
                        <th onClick={() => handleSort('title')} className="cursor-pointer">
                            제목 {sortBy === 'title' && (sortDir === 'asc' ? '▴' : '▾')}
                        </th>
                        <th onClick={() => handleSort('requesterId')} className="cursor-pointer w-150">
                            요청자 {sortBy === 'requesterId' && (sortDir === 'asc' ? '▴' : '▾')}
                        </th>
                        <th onClick={() => handleSort('priority')} className="cursor-pointer w-130">
                            우선순위 {sortBy === 'priority' && (sortDir === 'asc' ? '▴' : '▾')}
                        </th>
                        <th onClick={() => handleSort('status')} className="cursor-pointer w-160">
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
                            onClick={() => req.id !== undefined && onRowClick(req.id)}
                        >
                            <td className="text-muted">{formatDate(req.createdAt)}</td>
                            <td>
                                <div className="fw-600">{req.title}</div>
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
                        <tr><td colSpan={5} className="text-center p-100 text-muted">조건에 맞는 요청이 없습니다.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default RequestTable;
