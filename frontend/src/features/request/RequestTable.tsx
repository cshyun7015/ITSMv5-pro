import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Badge from './components/Badge';
import type { RequestDTO } from './api/requestApi';

interface RequestTableProps {
  requests: RequestDTO[];
  loading: boolean;
  onRowClick: (id: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

const RequestTable: React.FC<RequestTableProps> = ({ 
  requests, loading, onRowClick, 
  currentPage, totalPages, onPageChange,
  sortField, sortOrder, onSort
}) => {
  
  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <div className="tw-w-4 tw-h-4" />;
    return sortOrder === 'asc' ? <ChevronUp size={14} className="tw-text-brand-500" /> : <ChevronDown size={14} className="tw-text-brand-500" />;
  };

  const headers = [
    { label: '요청일자', field: 'createdAt' },
    { label: '요청제목', field: 'title' },
    { label: '상태', field: 'status' },
    { label: '요청자', field: 'requesterId' },
    { label: '담당자', field: 'assigneeId' },
  ];

  return (
    <div className="tw-card tw-flex-1 tw-relative tw-min-h-[500px] tw-flex tw-flex-col">
      {loading && (
        <div className="tw-absolute tw-inset-0 tw-bg-obsidian/50 tw-backdrop-blur-sm tw-z-10 tw-flex tw-items-center tw-justify-center">
          <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2 tw-border-brand-500"></div>
        </div>
      )}
      
      <div className="tw-overflow-x-auto tw-flex-1">
        <table className="tw-w-full tw-text-left">
          <thead>
            <tr className="tw-bg-slate-800/50 tw-border-b tw-border-slate-800">
              {headers.map((h) => (
                <th 
                  key={h.field}
                  onClick={() => onSort(h.field)}
                  className="tw-p-4 tw-text-xs tw-font-bold tw-text-slate-400 tw-uppercase tw-cursor-pointer hover:tw-text-brand-400 tw-transition-colors"
                  data-testid={`req-table-header-${h.field}`}
                >
                  <div className="tw-flex tw-items-center tw-gap-1">
                    {h.label}
                    <SortIcon field={h.field} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr 
                key={req.id} 
                onClick={() => onRowClick(req.id!)}
                className="tw-border-b tw-border-slate-800/50 hover:tw-bg-slate-800/20 tw-cursor-pointer tw-transition-colors"
                data-testid={`req-table-row-${req.id}`}
              >
                <td className="tw-p-4 tw-text-sm tw-text-slate-400">
                  {req.createdAt?.split('T')[0]}
                </td>
                <td className="tw-p-4 tw-text-sm tw-text-white tw-max-w-md tw-truncate">
                    {req.title}
                </td>
                <td className="tw-p-4">
                  <Badge label={req.status || 'OPEN'} type="status" />
                </td>
                <td className="tw-p-4 tw-text-sm tw-text-slate-400">{req.requesterId}</td>
                <td className="tw-p-4 tw-text-sm tw-text-slate-500">
                  {req.assigneeId || 'Unassigned'}
                </td>
              </tr>
            ))}
            {!loading && requests.length === 0 && (
              <tr>
                <td colSpan={5} className="tw-p-12 tw-text-center tw-text-slate-500 tw-text-sm">
                  검색 조건에 맞는 요청 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="tw-p-4 tw-border-t tw-border-slate-800 tw-flex tw-items-center tw-justify-between tw-bg-slate-800/20">
        <div className="tw-text-xs tw-text-slate-500">
          Showing <span className="tw-text-slate-300">{requests.length}</span> results
        </div>
        
        <div className="tw-flex tw-items-center tw-gap-2">
          <button 
            disabled={currentPage === 0}
            onClick={() => onPageChange(currentPage - 1)}
            className="tw-p-1.5 tw-rounded-lg tw-border tw-border-slate-800 hover:tw-bg-slate-800 disabled:tw-opacity-30 disabled:tw-cursor-not-allowed tw-transition-all"
            data-testid="req-table-page-prev"
          >
            <ChevronLeft size={16} className="tw-text-white" />
          </button>
          
          <div className="tw-flex tw-items-center tw-gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i}
                onClick={() => onPageChange(i)}
                className={`tw-w-8 tw-h-8 tw-rounded-lg tw-text-xs tw-font-bold tw-transition-all ${
                  currentPage === i 
                    ? 'tw-bg-brand-600 tw-text-white' 
                    : 'tw-text-slate-500 hover:tw-text-slate-200 hover:tw-bg-slate-800'
                }`}
                data-testid={`req-table-page-${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button 
            disabled={currentPage >= totalPages - 1}
            onClick={() => onPageChange(currentPage + 1)}
            className="tw-p-1.5 tw-rounded-lg tw-border tw-border-slate-800 hover:tw-bg-slate-800 disabled:tw-opacity-30 disabled:tw-cursor-not-allowed tw-transition-all"
            data-testid="req-table-page-next"
          >
            <ChevronRight size={16} className="tw-text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestTable;
