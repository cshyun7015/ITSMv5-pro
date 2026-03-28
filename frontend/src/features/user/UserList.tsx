import { useState, useEffect } from 'react';
import apiUser, { type UserDTO } from '../../api/apiUser';
import apiCompany, { type CompanyDTO } from '../../api/apiCompany';
import UserModal from './UserModal';

const UserList = () => {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('MSP'); // Default to MSP
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDTO | undefined>(undefined);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uData, cData] = await Promise.all([
        apiUser.list(selectedCompanyId),
        apiCompany.list()
      ]);
      setUsers(uData);
      setCompanies(cData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCompanyId]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiUser.delete(id);
        setUsers(prev => prev.filter(u => u.id !== id));
      } catch (error) {
        alert('Delete failed');
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
    <div className="user-feature">
      <div className="action-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="filter-group">
          <label style={{ marginRight: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>Select Company:</label>
          <select 
            value={selectedCompanyId} 
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            style={{ 
              background: 'hsla(0,0%,100%,0.05)', 
              color: 'white', 
              border: '1px solid var(--glass-border)', 
              padding: '8px 16px', 
              borderRadius: '8px' 
            }}
          >
            {companies.map(c => <option key={c.companyId} value={c.companyId} style={{ background: '#121214' }}>{c.name}</option>)}
          </select>
        </div>
        <button className="btn-primary neon-glow" onClick={handleCreate}>
          + Register User
        </button>
      </div>

      <div className="table-container glass-card">
        {loading ? (
          <div className="loading">Syncing users...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="table-row">
                  <td className="id-cell">{user.userId}</td>
                  <td className="name-cell">{user.name}</td>
                  <td>{user.email || '-'}</td>
                  <td>
                    <span className="role-badge">{user.role}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-icon" onClick={() => handleEdit(user)}>✏️</button>
                    <button className="btn-icon delete" onClick={() => handleDelete(user.id!)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                    No users found for this company.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
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
        .action-bar { margin-bottom: 20px; display: flex; justify-content: flex-end; }
        .btn-primary {
          background: linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-secondary)));
          border: none; color: white; padding: 10px 24px; border-radius: 8px;
          cursor: pointer; font-weight: 600; font-size: 14px;
        }
        .table-container { min-height: 500px; padding: 0; overflow: hidden; }
        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th { padding: 16px 24px; background: hsla(0, 0%, 100%, 0.05); color: hsl(var(--text-secondary)); font-size: 13px; text-transform: uppercase; font-weight: 600; }
        .data-table td { padding: 16px 24px; border-bottom: 1px solid var(--glass-border); font-size: 15px; }
        .table-row { transition: background 0.2s ease; }
        .table-row:hover { background: hsla(0, 0%, 100%, 0.02); }
        .id-cell { color: hsl(var(--brand-primary)); font-family: monospace; font-weight: 600; }
        .role-badge { font-size: 12px; color: hsl(var(--text-primary)); background: hsla(0, 0%, 100%, 0.05); padding: 2px 8px; border-radius: 4px; }
        .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .status-badge.active { background: hsla(140, 100%, 50%, 0.1); color: #00ff88; border: 1px solid hsla(140, 100%, 50%, 0.2); }
        .status-badge.inactive { background: hsla(0, 100%, 50%, 0.1); color: #ff5555; border: 1px solid hsla(0, 100%, 50%, 0.2); }
        .btn-icon { background: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background 0.2s; margin-right: 8px; }
        .btn-icon:hover { background: hsla(0, 0%, 100%, 0.1); }
        .btn-icon.delete:hover { background: hsla(0, 100%, 50%, 0.1); }
        .loading { display: flex; align-items: center; justify-content: center; height: 500px; color: hsl(var(--text-secondary)); letter-spacing: 2px; }
      `}</style>
    </div>
  );
};

export default UserList;
