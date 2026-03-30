import React from 'react';

interface PaginationProps {
    page: number;
    size: number;
    totalElements: number;
    setPage: (page: number | ((p: number) => number)) => void;
}

const RequestPagination: React.FC<PaginationProps> = ({ page, size, totalElements, setPage }) => {
    return (
        <div className="table-footer flex-between align-center mt-24">
            <div className="text-13 text-muted">전체 {totalElements} 건</div>
            <div className="flex-center gap-sm">
                <button 
                    disabled={page === 0} 
                    onClick={(e) => { e.stopPropagation(); setPage(p => p - 1); }}
                    className="btn-premium-secondary btn-icon"
                >
                    ◀
                </button>
                <span className="pagination-current">{page + 1}</span>
                <button 
                    disabled={(page + 1) * size >= totalElements} 
                    onClick={(e) => { e.stopPropagation(); setPage(p => p + 1); }}
                    className="btn-premium-secondary btn-icon"
                >
                    ▶
                </button>
            </div>
        </div>
    );
};

export default RequestPagination;
