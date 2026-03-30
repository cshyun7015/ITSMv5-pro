import React from 'react';
import { formatDate } from '../utils/requestUtils';

interface FilterProps {
    filters: { title: string; requesterId: string; fromDate: string; toDate: string };
    setFilters: (filters: any) => void;
}

const RequestFilterBar: React.FC<FilterProps> = ({ filters, setFilters }) => {
    return (
        <div className="filter-grid premium-card" style={{ marginBottom: '24px' }}>
            <div className="form-group mb-0">
                <label>요청일자 (FROM ~ TO)</label>
                <div className="flex-center gap-xs">
                    <div className="custom-date-container">
                        <span className="display-value">{formatDate(filters.fromDate)}</span>
                        <input 
                            type="date" 
                            value={filters.fromDate}
                            onChange={e => setFilters({...filters, fromDate: e.target.value})}
                        />
                    </div>
                    <span className="text-muted">~</span>
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
            <div className="form-group mb-0">
                <label>제목</label>
                <input 
                    type="text" 
                    placeholder="제목 검색..." 
                    value={filters.title} 
                    onChange={e => setFilters({...filters, title: e.target.value})}
                    className="full-width"
                />
            </div>
            <div className="form-group mb-0">
                <label>요청자</label>
                <input 
                    type="text" 
                    placeholder="요청자 ID..." 
                    value={filters.requesterId} 
                    onChange={e => setFilters({...filters, requesterId: e.target.value})}
                    className="full-width"
                />
            </div>
        </div>
    );
};

export default RequestFilterBar;
