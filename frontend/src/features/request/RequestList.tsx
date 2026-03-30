import { useState } from 'react';
import RequestForm from './RequestForm';
import RequestDetail from './RequestDetail';
import RequestFilterBar from './components/RequestFilterBar';
import RequestTable from './components/RequestTable';
import RequestPagination from './components/RequestPagination';
import { useRequestList } from './hooks/useRequestList';
import './Request.css';

const RequestList = () => {
    const {
        requests,
        loading,
        userMap,
        page,
        setPage,
        size,
        totalElements,
        sortBy,
        sortDir,
        handleSort,
        filters,
        setFilters,
        handleSearch,
        loadRequests
    } = useRequestList();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

    return (
        <div className="request-feature">
            <div className="panel-header">
                <div>
                    <h2>요청 목록</h2>
                    <p>지원 티켓 및 서비스 요청을 추적하고 관리합니다.</p>
                </div>
                <div className="flex-center gap-md">
                    <button onClick={handleSearch} className="btn-premium-secondary btn-md">조회</button>
                    <button onClick={() => setIsFormOpen(true)} className="btn-premium btn-lg">등록</button>
                </div>
            </div>

            <RequestFilterBar 
                filters={filters} 
                setFilters={setFilters} 
            />

            <RequestTable 
                requests={requests}
                loading={loading}
                userMap={userMap}
                sortBy={sortBy}
                sortDir={sortDir}
                handleSort={handleSort}
                onRowClick={setSelectedRequestId}
            />

            <RequestPagination 
                page={page}
                size={size}
                totalElements={totalElements}
                setPage={setPage}
            />

            {isFormOpen && (
                <RequestForm 
                    onClose={() => setIsFormOpen(false)} 
                    onSuccess={() => { setIsFormOpen(false); loadRequests(); }}
                />
            )}
            
            {selectedRequestId !== null && (
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
