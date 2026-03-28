import { useState, useEffect } from 'react';
import apiCompany, { type CompanyDTO } from '../../api/apiCompany';

interface Props {
  company?: CompanyDTO;
  onClose: () => void;
  onSuccess: () => void;
}

const CompanyModal = ({ company, onClose, onSuccess }: Props) => {
  const [formData, setFormData] = useState<CompanyDTO>({
    companyId: '',
    name: '',
    businessNumber: '',
    representativeName: '',
    phone: '',
    email: '',
    address: '',
    status: 'ACTIVE'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData(company);
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (company?.id) {
        await apiCompany.update(company.id, formData);
      } else {
        await apiCompany.create(formData);
      }
      onSuccess();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Check if Company ID is duplicate.';
      alert(`Save failed: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card">
        <header className="modal-header">
          <h3>{company ? 'Edit Company' : 'Register New Company'}</h3>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </header>

        <form onSubmit={handleSubmit} className="company-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Company ID (Unique)</label>
              <input
                type="text"
                value={formData.companyId}
                onChange={e => setFormData({ ...formData, companyId: e.target.value })}
                required
                disabled={!!company}
                placeholder="e.g. COMP-001"
              />
            </div>
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Business Name"
              />
            </div>
            <div className="form-group">
              <label>Business Number</label>
              <input
                type="text"
                value={formData.businessNumber || ''}
                onChange={e => setFormData({ ...formData, businessNumber: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Representative</label>
              <input
                type="text"
                value={formData.representativeName || ''}
                onChange={e => setFormData({ ...formData, representativeName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group full-width">
              <label>Address</label>
              <textarea
                value={formData.address || ''}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <footer className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save neon-glow" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (company ? 'Update' : 'Register')}
            </button>
          </footer>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .modal-content {
          width: 600px; padding: 40px; position: relative;
        }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .btn-close { background: none; border: none; font-size: 28px; color: hsl(var(--text-secondary)); cursor: pointer; }
        .company-form { display: flex; flex-direction: column; gap: 20px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group.full-width { grid-column: span 2; }
        .form-group label { font-size: 13px; color: hsl(var(--text-secondary)); font-weight: 600; }
        .form-group input, .form-group select, .form-group textarea {
          background: hsla(0, 0%, 100%, 0.05); border: 1px solid var(--glass-border);
          border-radius: 6px; padding: 10px 12px; color: white; font-size: 14px; outline: none; transition: border 0.2s;
        }
        .form-group input:focus { border-color: hsl(var(--brand-primary)); }
        .form-group textarea { min-height: 80px; resize: vertical; }
        .modal-footer { margin-top: 30px; display: flex; justify-content: flex-end; gap: 12px; }
        .btn-secondary { background: none; border: 1px solid var(--glass-border); color: white; padding: 10px 24px; border-radius: 8px; cursor: pointer; }
        .btn-save {
          background: linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-secondary)));
          border: none; color: white; padding: 10px 32px; border-radius: 8px;
          cursor: pointer; font-weight: 800;
        }
      `}</style>
    </div>
  );
};

export default CompanyModal;
