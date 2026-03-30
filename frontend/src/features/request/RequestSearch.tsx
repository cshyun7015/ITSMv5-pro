import React from 'react';
import { Search, Calendar } from 'lucide-react';

interface RequestSearchProps {
  filters: {
    fromDate: string;
    toDate: string;
    title: string;
  };
  onFilterChange: (filters: any) => void;
  onSearch: () => void;
}

const RequestSearch: React.FC<RequestSearchProps> = ({ filters, onFilterChange, onSearch }) => {
  return (
    <div className="tw-card tw-p-4 tw-flex tw-flex-wrap tw-items-end tw-gap-4">
      <div className="tw-flex-1 tw-min-w-[200px]">
        <label className="tw-label">요청 일자 (From)</label>
        <div className="tw-relative">
          <input 
            type="date"
            className="tw-input tw-w-full tw-pl-10"
            value={filters.fromDate}
            onChange={(e) => onFilterChange({ ...filters, fromDate: e.target.value })}
          />
          <Calendar className="tw-absolute tw-left-3 tw-top-2.5 tw-text-slate-500" size={16} />
        </div>
      </div>
      <div className="tw-flex-1 tw-min-w-[200px]">
        <label className="tw-label">요청 일자 (To)</label>
        <div className="tw-relative">
          <input 
            type="date"
            className="tw-input tw-w-full tw-pl-10"
            value={filters.toDate}
            onChange={(e) => onFilterChange({ ...filters, toDate: e.target.value })}
          />
          <Calendar className="tw-absolute tw-left-3 tw-top-2.5 tw-text-slate-500" size={16} />
        </div>
      </div>
      <div className="tw-flex-[2] tw-min-w-[300px]">
        <label className="tw-label">제목 / 설명</label>
        <div className="tw-relative">
          <input 
            type="text"
            placeholder="Case-insensitive keyword search..."
            className="tw-input tw-w-full tw-pl-10"
            value={filters.title}
            onChange={(e) => onFilterChange({ ...filters, title: e.target.value })}
          />
          <Search className="tw-absolute tw-left-3 tw-top-2.5 tw-text-slate-500" size={16} />
        </div>
      </div>
      <button 
        onClick={onSearch}
        className="tw-bg-slate-800 hover:tw-bg-slate-700 tw-text-white tw-px-6 tw-py-2 tw-rounded-lg tw-font-medium tw-transition-all"
      >
        검색
      </button>
    </div>
  );
};

export default RequestSearch;
