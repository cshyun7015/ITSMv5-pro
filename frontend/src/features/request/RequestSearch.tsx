import React, { useState, useEffect } from 'react';
import { Search, Calendar, Database, ShieldCheck } from 'lucide-react';
import CustomerCompanyAPI, { type CustomerCompanyDTO } from '../organization/customercompany/api/CustomerCompany';
import OperatorCompanyAPI, { type OperatorCompanyDTO } from '../organization/operatorcompany/api/OperatorCompany';
import { useAuth } from '../auth/AuthProvider';

interface RequestSearchProps {
  filters: {
    fromDate: string;
    toDate: string;
    title: string;
    companyId: string;
    mspId: string;
  };
  onFilterChange: (filters: any) => void;
  onSearch: () => void;
}

const RequestSearch: React.FC<RequestSearchProps> = ({ filters, onFilterChange, onSearch }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<CustomerCompanyDTO[]>([]);
  const [operators, setOperators] = useState<OperatorCompanyDTO[]>([]);

  const isMSP = user?.companyId === 'MSP' || user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_OPER';

  useEffect(() => {
    if (isMSP) {
        CustomerCompanyAPI.getCustomerCompanies().then(setCustomers);
        OperatorCompanyAPI.getOperatorCompanies().then(setOperators);
    }
  }, [isMSP]);

  return (
    <div className="tw-card tw-p-4 tw-bg-obsidian-light tw-border-white/5">
      <div className="tw-flex tw-flex-wrap tw-items-end tw-gap-4">
        
        {/* 1. 고객사 (Visible to MSP/Admin) */}
        {isMSP && (
            <div className="tw-w-[180px]">
                <label className="tw-label tw-text-[10px] tw-uppercase tw-tracking-widest tw-mb-1.5 opacity-50">고객사 (Client)</label>
                <div className="tw-relative">
                    <select 
                        className="tw-input tw-w-full tw-pl-10 !tw-py-1.5 !tw-text-xs tw-appearance-none"
                        value={filters.companyId}
                        onChange={(e) => onFilterChange({ ...filters, companyId: e.target.value })}
                        data-testid="req-search-client-select"
                    >
                        <option value="">전체 고객사</option>
                        {customers.map(c => <option key={c.id} value={c.customerId}>{c.name}</option>)}
                    </select>
                    <Database className="tw-absolute tw-left-3 tw-top-2.5 tw-text-indigo-400" size={14} />
                </div>
            </div>
        )}

        {/* 2. 운영사 (Visible to MSP/Admin) */}
        {isMSP && (
            <div className="tw-w-[180px]">
                <label className="tw-label tw-text-[10px] tw-uppercase tw-tracking-widest tw-mb-1.5 opacity-50">운영사 (MSP)</label>
                <div className="tw-relative">
                    <select 
                        className="tw-input tw-w-full tw-pl-10 !tw-py-1.5 !tw-text-xs tw-appearance-none"
                        value={filters.mspId}
                        onChange={(e) => onFilterChange({ ...filters, mspId: e.target.value })}
                        data-testid="req-search-msp-select"
                    >
                        <option value="">전체 운영사</option>
                        {operators.map(o => <option key={o.id} value={o.operatorCompanyId}>{o.name}</option>)}
                    </select>
                    <ShieldCheck className="tw-absolute tw-left-3 tw-top-2.5 tw-text-emerald-400" size={14} />
                </div>
            </div>
        )}

        {/* 3. 조회 시작일 */}
        <div className="tw-w-[150px]">
            <label className="tw-label tw-text-[10px] tw-uppercase tw-tracking-widest tw-mb-1.5 opacity-50">조회 시작일</label>
            <div className="tw-relative">
                <input 
                    type="date"
                    className="tw-input tw-w-full tw-pl-10 !tw-py-1.5 !tw-text-xs"
                    value={filters.fromDate}
                    onChange={(e) => onFilterChange({ ...filters, fromDate: e.target.value })}
                    data-testid="req-search-from-date"
                />
                <Calendar className="tw-absolute tw-left-3 tw-top-2.5 tw-text-brand-400" size={14} />
            </div>
        </div>

        {/* 4. 조회 종료일 */}
        <div className="tw-w-[150px]">
            <label className="tw-label tw-text-[10px] tw-uppercase tw-tracking-widest tw-mb-1.5 opacity-50">조회 종료일</label>
            <div className="tw-relative">
                <input 
                    type="date"
                    className="tw-input tw-w-full tw-pl-10 !tw-py-1.5 !tw-text-xs"
                    value={filters.toDate}
                    onChange={(e) => onFilterChange({ ...filters, toDate: e.target.value })}
                    data-testid="req-search-to-date"
                />
                <Calendar className="tw-absolute tw-left-3 tw-top-2.5 tw-text-brand-400" size={14} />
            </div>
        </div>

        {/* 5. 검색어 (제목/설명) - Flex Grow */}
        <div className="tw-flex-1 tw-min-w-[240px]">
            <label className="tw-label tw-text-[10px] tw-uppercase tw-tracking-widest tw-mb-1.5 opacity-50">검색어 (제목/설명)</label>
            <div className="tw-relative">
                <input 
                    type="text"
                    placeholder="Search query..."
                    className="tw-input tw-w-full tw-pl-10 !tw-py-1.5 !tw-text-xs"
                    value={filters.title}
                    onChange={(e) => onFilterChange({ ...filters, title: e.target.value })}
                    data-testid="req-search-query-input"
                />
                <Search className="tw-absolute tw-left-3 tw-top-2.5 tw-text-slate-500" size={14} />
            </div>
        </div>

        {/* 6. 검색 버튼 (Far Right) */}
        <button 
          onClick={onSearch}
          className="tw-bg-brand-600 hover:tw-bg-brand-500 tw-text-white tw-px-8 tw-py-1.5 tw-rounded-lg tw-text-xs tw-font-black tw-uppercase tw-tracking-widest tw-transition-all tw-shadow-lg tw-shadow-brand-600/20"
          data-testid="req-search-submit-btn"
        >
          검색
        </button>
      </div>
    </div>
  );
};

export default RequestSearch;
