import { useState, useEffect } from 'react';
import apiUser, { type UserDTO } from '../../api/apiUser';
import apiCompany, { type CompanyDTO } from '../../api/apiCompany';
import UserModal from './UserModal';

const UserList = () => {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDTO | undefined>(undefined);

  // Pagination & Sorting States
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  
  // Filters
  const [filters, setFilters] = useState({
    name: '',
    companyId: 'ALL',
    role: 'ALL',
    isActive: 'ALL'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch companies for the filter dropdown
      const cRes = await apiCompany.list({ size: 1000 });
      setCompanies(cRes.content);

      // Fetch filtered users
      const uRes = await apiUser.list({
        companyId: filters.companyId !== 'ALL' ? filters.companyId : undefined,
        name: filters.name || undefined,
        role: filters.role !== 'ALL' ? filters.role : undefined,
        isActive: filters.isActive === 'ACTIVE' ? true : (filters.isActive === 'INACTIVE' ? false : undefined),
        page,
        size,
        sort: `${sortBy},${sortDir}`
      });
      
      setUsers(uRes.content);
      setTotalElements(uRes.totalElements);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, sortBy, sortDir]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
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
        await apiUser.delete(id);
        fetchData();
      } catch (error) {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const handleEdit = (user: UserDTO) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedUser(undefined);
    setIsModalOpen(true);
  };

  return (
    <div className="user-feature" style={{ padding: '0 24px' }}>
      {/* Header Actions */}
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>사용자 관리</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>포털 시스템을 이용하는 사용자 계정을 관리합니다.</p>
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
      <div className="filter-bar glass-card" style={{ display: 'flex', gap: '20px', padding: '20px 24px', marginBottom: '24px', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ marginBottom: 0, width: '200px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>고객사</label>
          <select 
            value={filters.companyId} 
            onChange={e => setFilters({...filters, companyId: e.target.value})}
            style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', fontSize: '14px' }}
          >
            <option value="ALL">전체 고객사</option>
            {companies.map(c => <option key={c.companyId} value={c.companyId} style={{ background: '#121214' }}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0, width: '150px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>권한</label>
          <select 
            value={filters.role} 
            onChange={e => setFilters({...filters, role: e.target.value})}
            style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', fontSize: '14px' }}
          >
            <option value="ALL">전체 권한</option>
            <option value="ROLE_ADMIN">ADMIN</option>
            <option value="ROLE_MANAGER">MANAGER</option>
            <option value="ROLE_USER">USER</option>
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0, width: '120px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>상태</label>
          <select 
            value={filters.isActive} 
            onChange={e => setFilters({...filters, isActive: e.target.value})}
            style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', fontSize: '14px' }}
          >
            <option value="ALL">전체 상태</option>
            <option value="ACTIVE">활성</option>
            <option value="INACTIVE">비활성</option>
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0, width: '220px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>성명</label>
          <input 
            type="text" 
            placeholder="사용자명 입력..." 
            value={filters.name} 
            onChange={e => setFilters({...filters, name: e.target.value})}
            style={{ padding: '8px 12px', width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', fontSize: '14px' }}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container glass-card" style={{ minHeight: '500px' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th onClick={() => handleSort('userId')} style={{ cursor: 'pointer', width: '150px' }}>
                사용자 ID {sortBy === 'userId' && (sortDir === 'asc' ? '▴' : '▾')}
              </th>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                성명 {sortBy === 'name' && (sortDir === 'asc' ? '▴' : '▾')}
              </th>
              <th>이메일</th>
              <th onClick={() => handleSort('role')} style={{ cursor: 'pointer', width: '150px' }}>
                권한 {sortBy === 'role' && (sortDir === 'asc' ? '▴' : '▾')}
              </th>
              <th onClick={() => handleSort('isActive')} style={{ cursor: 'pointer', width: '120px' }}>
                상태 {sortBy === 'isActive' && (sortDir === 'asc' ? '▴' : '▾')}
              </th>
              <th className="actions-col" style={{ width: '120px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '100px' }}>Syncing data...</td></tr>
            ) : users.map((user) => (
              <tr key={user.id} className="table-row">
                <td className="id-cell" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>{user.userId}</td>
                <td>{user.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{user.email || '-'}</td>
                <td>
                  <span className="role-tag" style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                    {user.role?.replace('ROLE_', '')}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td className="actions-cell" style={{ textAlign: 'center' }}>
                  <button className="btn-icon" onClick={() => handleEdit(user)} style={{ marginRight: '16px' }}>✏️</button>
                  <button className="btn-icon delete" onClick={() => handleDelete(user.id!)}>🗑️</button>
                </td>
              </tr>
            ))}
            {!loading && users.length === 0 && (
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
        <UserModal
          user={selectedUser}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchData();
          }}
        />
      )}

      <style>{`
        .btn-primary { background: linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-secondary))); border: none; color: white; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: white; cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); }
        .data-table th { padding: 12px 24px; background: hsla(0, 0%, 100%, 0.05); text-align: left; font-size: 11px; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 1px; }
        .table-row td { padding: 12px 24px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; }
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

export default UserList;
