import { useState, useEffect } from 'react';
import apiCompany, { type CompanyDTO } from '../../api/apiCompany';
import CompanyModal from './CompanyModal';

const CompanyList = () => {
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDTO | undefined>(undefined);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await apiCompany.list();
      setCompanies(data);
    } catch (error) {
      console.error('Failed to fetch companies', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await apiCompany.delete(id);
        setCompanies(prev => prev.filter(c => c.id !== id));
      } catch (error) {
        alert('Delete failed');
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

  return (
    <div className="company-feature">
      <div className="action-bar">
        <button className="btn-primary neon-glow" onClick={handleCreate}>
          + Register Company
        </button>
      </div>

      <div className="table-container glass-card">
        {loading ? (
          <div className="loading">Syncing data...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Company ID</th>
                <th>Name</th>
                <th>Representative</th>
                <th>Status</th>
                <th>Created At</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className="table-row">
                  <td className="id-cell">{company.companyId}</td>
                  <td className="name-cell">{company.name}</td>
                  <td>{company.representativeName || '-'}</td>
                  <td>
                    <span className={`status-badge ${company.status?.toLowerCase()}`}>
                      {company.status}
                    </span>
                  </td>
                  <td>{company.createdAt ? new Date(company.createdAt).toLocaleDateString() : '-'}</td>
                  <td className="actions-cell">
                    <button className="btn-icon" onClick={() => handleEdit(company)}>✏️</button>
                    <button className="btn-icon delete" onClick={() => handleDelete(company.id!)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                    No companies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
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

export default CompanyList;
