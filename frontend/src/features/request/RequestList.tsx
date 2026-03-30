import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar } from 'lucide-react';
import requestApi from './api/requestApi';
import type { RequestDTO } from './api/requestApi';
import Badge from './components/Badge';
import RequestDetail from './RequestDetail';
import RequestForm from './RequestForm';
import './styles/request-tailwind.css';

const RequestList: React.FC = () => {
  const [requests, setRequests] = useState<RequestDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    title: '',
    requesterId: ''
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await requestApi.getRequests(filters);
      setRequests(res.data.content || []);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const handleRowClick = (id: number) => {
    setSelectedRequestId(id);
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
          <h1 className="tw-text-2xl tw-font-bold tw-text-white">ServiceDesk Pro <span className="tw-text-slate-500 tw-font-normal tw-text-lg">Request Management</span></h1>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="tw-btn-primary"
        >
          <Plus size={18} />
          New Request
        </button>
      </div>

      {/* Filter Bar */}
      <div className="tw-card tw-p-4 tw-flex tw-flex-wrap tw-items-end tw-gap-4">
        <div className="tw-flex-1 tw-min-w-[200px]">
          <label className="tw-label">Requested Date (From)</label>
          <div className="tw-relative">
            <input 
              type="date"
              className="tw-input tw-w-full tw-pl-10"
              value={filters.fromDate}
              onChange={(e) => setFilters(f => ({ ...f, fromDate: e.target.value }))}
            />
            <Calendar className="tw-absolute tw-left-3 tw-top-2.5 tw-text-slate-500" size={16} />
          </div>
        </div>
        <div className="tw-flex-1 tw-min-w-[200px]">
          <label className="tw-label">Requested Date (To)</label>
          <div className="tw-relative">
            <input 
              type="date"
              className="tw-input tw-w-full tw-pl-10"
              value={filters.toDate}
              onChange={(e) => setFilters(f => ({ ...f, toDate: e.target.value }))}
            />
            <Calendar className="tw-absolute tw-left-3 tw-top-2.5 tw-text-slate-500" size={16} />
          </div>
        </div>
        <div className="tw-flex-[2] tw-min-w-[300px]">
          <label className="tw-label">Search Title / Description</label>
          <div className="tw-relative">
            <input 
              type="text"
              placeholder="Case-insensitive keyword search..."
              className="tw-input tw-w-full tw-pl-10"
              value={filters.title}
              onChange={(e) => setFilters(f => ({ ...f, title: e.target.value }))}
            />
            <Search className="tw-absolute tw-left-3 tw-top-2.5 tw-text-slate-500" size={16} />
          </div>
        </div>
        <button 
          onClick={() => fetchRequests()}
          className="tw-bg-slate-800 hover:tw-bg-slate-700 tw-text-white tw-px-6 tw-py-2 tw-rounded-lg tw-font-medium tw-transition-all"
        >
          Search
        </button>
      </div>

      {/* Table Section */}
      <div className="tw-card tw-flex-1 tw-relative tw-min-h-[500px]">
        {loading && (
          <div className="tw-absolute tw-inset-0 tw-bg-obsidian/50 tw-backdrop-blur-sm tw-z-10 tw-flex tw-items-center tw-justify-center">
            <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2 tw-border-brand-500"></div>
          </div>
        )}
        <div className="tw-overflow-x-auto">
          <table className="tw-w-full tw-text-left">
            <thead>
              <tr className="tw-bg-slate-800/50 tw-border-b tw-border-slate-800">
                <th className="tw-p-4 tw-text-xs tw-font-bold tw-text-slate-400 tw-uppercase">NO</th>
                <th className="tw-p-4 tw-text-xs tw-font-bold tw-text-slate-400 tw-uppercase">Service Request No</th>
                <th className="tw-p-4 tw-text-xs tw-font-bold tw-text-slate-400 tw-uppercase">Company</th>
                <th className="tw-p-4 tw-text-xs tw-font-bold tw-text-slate-400 tw-uppercase">Title</th>
                <th className="tw-p-4 tw-text-xs tw-font-bold tw-text-slate-400 tw-uppercase">Status</th>
                <th className="tw-p-4 tw-text-xs tw-font-bold tw-text-slate-400 tw-uppercase">Priority</th>
                <th className="tw-p-4 tw-text-xs tw-font-bold tw-text-slate-400 tw-uppercase">Req Date</th>
                <th className="tw-p-4 tw-text-xs tw-font-bold tw-text-slate-400 tw-uppercase">Requester</th>
                <th className="tw-p-4 tw-text-xs tw-font-bold tw-text-slate-400 tw-uppercase">Assignee</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, idx) => (
                <tr 
                  key={req.id} 
                  onClick={() => handleRowClick(req.id!)}
                  className="tw-border-b tw-border-slate-800/50 hover:tw-bg-slate-800/20 tw-cursor-pointer tw-transition-colors"
                >
                  <td className="tw-p-4 tw-text-sm tw-text-slate-500">{idx + 1}</td>
                  <td className="tw-p-4">
                    <span className="tw-text-brand-400 tw-font-mono tw-text-sm hover:tw-underline">{req.reqNumber}</span>
                  </td>
                  <td className="tw-p-4 tw-text-sm tw-text-slate-400">{req.companyId}</td>
                  <td className="tw-p-4 tw-text-sm tw-text-white tw-max-w-xs tw-truncate">{req.title}</td>
                  <td className="tw-p-4">
                    <Badge label={req.status || 'OPEN'} type="status" />
                  </td>
                  <td className="tw-p-4">
                    <Badge label={req.priority || 'P3'} type="priority" />
                  </td>
                  <td className="tw-p-4 tw-text-sm tw-text-slate-400">
                    {req.createdAt?.split('T')[0]}
                  </td>
                  <td className="tw-p-4 tw-text-sm tw-text-slate-400">{req.requesterId}</td>
                  <td className="tw-p-4 tw-text-sm tw-text-slate-500">
                    {req.assigneeId || 'Unassigned'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
