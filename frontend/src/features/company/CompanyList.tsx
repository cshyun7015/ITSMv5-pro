import { useState, useEffect } from 'react';
import apiCompany, { type CompanyDTO } from '../../api/apiCompany';
import CompanyModal from './CompanyModal';

const CompanyList = () => {
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDTO | undefined>(undefined);

  // Pagination & Sorting States
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({ name: '', status: 'ALL' });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await apiCompany.list({
        name: filters.name || undefined,
        status: filters.status !== 'ALL' ? filters.status : undefined,
        page,
        size,
        sort: `${sortBy},${sortDir}`
      });
      setCompanies(res.content);
      setTotalElements(res.totalElements);
    } catch (error) {
      console.error('Failed to fetch companies', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [page, sortBy, sortDir]);

  const handleSearch = () => {
    setPage(0);
    fetchCompanies();
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

  const handleDelete = async (id: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await apiCompany.delete(id);
        fetchCompanies();
      } catch (error) {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const handleEdit = (company: CompanyDTO) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCompany(undefined);
    setIsModalOpen(true);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return dateStr.substring(0, 10).replace(/-/g, '.');
  };

  return (
    <div className="company-feature" style={{ padding: '0 24px' }}>
      {/* Header Actions */}
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>고객사 관리</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>회원 고객사 및 파트너사를 등록하고 관리합니다.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <button 
             onClick={handleSearch} 
             className="btn-secondary" 
             style={{ minWidth: '120px', height: '44px', padding: '0 32px', borderRadius: '12px', fontSize: '14px', fontWeight: 700 }}
           >
             조회
           </button>
           <button 
             onClick={handleCreate} 
             className="btn-primary" 
             style={{ minWidth: '120px', height: '44px', padding: '0 32px', borderRadius: '12px', fontSize: '14px', fontWeight: 700 }}
           >
             등록
           </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar glass-card" style={{ display: 'flex', gap: '20px', padding: '20px 24px', marginBottom: '24px', alignItems: 'flex-end', justifyContent: 'flex-start' }}>
        <div className="form-group" style={{ marginBottom: 0, width: '240px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>회사명</label>
          <input 
            type="text" 
            placeholder="회사명 검색..." 
            value={filters.name} 
            onChange={e => setFilters({...filters, name: e.target.value})}
            style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', fontSize: '14px' }}
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0, width: '180px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>상태</label>
          <select 
            value={filters.status} 
            onChange={e => setFilters({...filters, status: e.target.value})}
            style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', fontSize: '14px' }}
          >
            <option value="ALL">전체 상태</option>
            <option value="ACTIVE">활성 (ACTIVE)</option>
            <option value="INACTIVE">비활성 (INACTIVE)</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container glass-card" style={{ minHeight: '500px' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th onClick={() => handleSort('companyId')} style={{ cursor: 'pointer', width: '180px' }}>
                회사 ID {sortBy === 'companyId' && (sortDir === 'asc' ? '▴' : '▾')}
              </th>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                회사명 {sortBy === 'name' && (sortDir === 'asc' ? '▴' : '▾')}
              </th>
              <th>대표자</th>
              <th onClick={() => handleSort('status')} style={{ cursor: 'pointer', width: '120px' }}>
                상태 {sortBy === 'status' && (sortDir === 'asc' ? '▴' : '▾')}
              </th>
              <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer', width: '150px' }}>
                등록일 {sortBy === 'createdAt' && (sortDir === 'asc' ? '▴' : '▾')}
              </th>
              <th className="actions-col" style={{ width: '120px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '100px' }}>Syncing data...</td></tr>
            ) : companies.map((company) => (
              <tr key={company.id} className="table-row">
                <td className="id-cell" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>{company.companyId}</td>
                <td>{company.name}</td>
                <td>{company.representativeName || '-'}</td>
                <td>
                  <span className={`status-badge ${company.status?.toLowerCase()}`}>
                    {company.status}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{formatDate(company.createdAt)}</td>
                <td className="actions-cell" style={{ textAlign: 'center' }}>
                  <button className="btn-icon" onClick={() => handleEdit(company)} style={{ marginRight: '16px' }}>✏️</button>
                  <button className="btn-icon delete" onClick={() => handleDelete(company.id!)}>🗑️</button>
                </td>
              </tr>
            ))}
            {!loading && companies.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>검색 결과가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="table-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>전체 {totalElements} 건</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            disabled={page === 0} 
            onClick={() => setPage(p => p - 1)}
            style={{ background: 'none', border: '1px solid var(--glass-border)', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: page === 0 ? 'not-allowed' : 'pointer' }}
          >
            ◀
          </button>
          <span style={{ fontSize: '14px', fontWeight: 700, margin: '0 8px' }}>페이지 {page + 1}</span>
          <button 
            disabled={(page + 1) * size >= totalElements} 
            onClick={() => setPage(p => p + 1)}
            style={{ background: 'none', border: '1px solid var(--glass-border)', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: (page + 1) * size >= totalElements ? 'not-allowed' : 'pointer' }}
          >
            ▶
          </button>
        </div>
      </div>

      {isModalOpen && (
        <CompanyModal
          company={selectedCompany}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchCompanies();
          }}
        />
      )}

      <style>{`
        .btn-primary { background: linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-secondary))); border: none; color: white; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: white; cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); }
        .data-table th { padding: 12px 16px; background: hsla(0, 0%, 100%, 0.05); text-align: left; font-size: 11px; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 1px; }
        .table-row td { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; }
        .table-row:hover { background: hsla(0, 0%, 100%, 0.02); }
        .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 800; }
        .status-badge.active { background: rgba(0, 255, 136, 0.1); color: #00ff88; border: 1px solid rgba(0, 255, 136, 0.2); }
        .status-badge.inactive { background: rgba(255, 85, 85, 0.1); color: #ff5555; border: 1px solid rgba(255, 85, 85, 0.2); }
        .btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; filter: grayscale(1); opacity: 0.6; }
        .btn-icon:hover { opacity: 1; filter: none; }
      `}</style>
    </div>
  );
};

export default CompanyList;
