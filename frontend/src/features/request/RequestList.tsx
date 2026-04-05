import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import requestApi from './api/requestApi';
import type { RequestDTO } from './api/requestApi';
import RequestDetail from './RequestDetail';
import RequestForm from './RequestForm';
import RequestSearch from './RequestSearch';
import RequestTable from './RequestTable';
import './styles/request-tailwind.css';

const RequestList: React.FC = () => {
  const [requests, setRequests] = useState<RequestDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState({ field: 'createdAt', order: 'desc' as 'asc' | 'desc' });

  // Initialize with last 30 days
  const [filters, setFilters] = useState(() => {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(today.getDate() - 30);
    
    return {
      fromDate: oneMonthAgo.toISOString().split('T')[0],
      toDate: today.toISOString().split('T')[0],
      title: '',
      requesterId: '',
      companyId: '',
      mspId: ''
    };
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: currentPage,
        size: 10,
        sort: `${sortConfig.field},${sortConfig.order}`
      };
      const res = await requestApi.getRequests(params);
      setRequests(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filters.fromDate, filters.toDate, filters.requesterId, filters.companyId, filters.mspId, currentPage, sortConfig]);

  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
    }));
    setCurrentPage(0); // Reset to first page on sort
  };

  return (
    <div className="tw-body-base tw-min-h-screen tw-p-6 tw-flex tw-flex-col tw-gap-6">
      {/* Header */}
      <div className="tw-flex tw-items-center tw-justify-between">
        <div className="tw-flex tw-items-center tw-gap-3">
          <div className="tw-bg-brand-600 tw-p-2 tw-rounded-lg">
            <svg className="tw-w-6 tw-h-6 tw-text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="tw-text-2xl tw-font-bold tw-text-white">요청 목록<span className="tw-text-slate-500 tw-font-normal tw-text-lg"></span></h1>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="tw-btn-primary"
          data-testid="req-list-new-btn"
        >
          <Plus size={18} />
          신규 요청
        </button>
      </div>

      {/* Filter Bar Component */}
      <RequestSearch 
        filters={filters} 
        onFilterChange={(newFilters) => {
           setFilters(newFilters);
           setCurrentPage(0);
        }} 
        onSearch={fetchRequests} 
      />

      {/* Table Section Component */}
      <RequestTable 
        requests={requests} 
        loading={loading} 
        onRowClick={setSelectedRequestId}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        sortField={sortConfig.field}
        sortOrder={sortConfig.order}
        onSort={handleSort}
      />

      {/* Detail Modal */}
      {selectedRequestId && (
        <RequestDetail 
          requestId={selectedRequestId} 
          onClose={() => {
            setSelectedRequestId(null);
            fetchRequests();
          }} 
        />
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <RequestForm 
          onClose={() => {
            setIsCreateModalOpen(false);
            fetchRequests();
          }} 
        />
      )}
    </div>
  );
};

export default RequestList;
