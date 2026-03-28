import { useState, useEffect } from 'react';
import apiUser, { type UserDTO } from '../../api/apiUser';

interface Props {
  user?: UserDTO;
  onClose: () => void;
  onSuccess: () => void;
}

const UserModal = ({ user, onClose, onSuccess }: Props) => {
  const [formData, setFormData] = useState<UserDTO>({
    userId: '',
    password: '',
    name: '',
    email: '',
    role: 'ROLE_USER',
    companyId: localStorage.getItem('companyId') || 'SYSTEM',
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        password: '' // Don't populate password during edit
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (user?.id) {
        await apiUser.update(user.id, formData);
      } else {
        await apiUser.create(formData);
      }
      onSuccess();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Check if User ID is duplicate.';
      alert(`Save failed: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card">
        <header className="modal-header">
          <h3>{user ? 'Edit User' : 'Register New User'}</h3>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </header>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Login ID (Unique)</label>
              <input
                type="text"
                value={formData.userId}
                onChange={e => setFormData({ ...formData, userId: e.target.value })}
                required
                disabled={!!user}
                placeholder="e.g. jdoe"
              />
            </div>
            
            <div className="form-group">
              <label>{user ? 'New Password (Optional)' : 'Password'}</label>
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required={!user}
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Name"
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@company.com"
              />
            </div>

            <div className="form-group">
              <label>System Role</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="ROLE_USER">Standard User (ROLE_USER)</option>
                <option value="ROLE_ADMIN">Administrator (ROLE_ADMIN)</option>
                <option value="ROLE_MANAGER">Manager (ROLE_MANAGER)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Active Status</label>
              <div className="toggle-group">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span className="slider round"></span>
                </label>
                <span className="toggle-label">{formData.isActive ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
            
            <div className="form-group full-width">
              <label>Company Context</label>
              <input
                type="text"
                value={formData.companyId}
                disabled
                className="disabled-input"
              />
            </div>
          </div>

          <footer className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save neon-glow" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : (user ? 'Update' : 'Register')}
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
          width: 580px; padding: 40px; position: relative;
        }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .btn-close { background: none; border: none; font-size: 28px; color: hsl(var(--text-secondary)); cursor: pointer; }
        .user-form { display: flex; flex-direction: column; gap: 20px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group.full-width { grid-column: span 2; }
        .form-group label { font-size: 13px; color: hsl(var(--text-secondary)); font-weight: 600; }
        .form-group input, .form-group select {
          background: hsla(0, 0%, 100%, 0.05); border: 1px solid var(--glass-border);
          border-radius: 6px; padding: 10px 12px; color: white; font-size: 14px; outline: none; transition: border 0.2s;
        }
        .form-group input:focus { border-color: hsl(var(--brand-primary)); }
        .disabled-input { opacity: 0.5; cursor: not-allowed; }
        .modal-footer { margin-top: 30px; display: flex; justify-content: flex-end; gap: 12px; }
        .btn-secondary { background: none; border: 1px solid var(--glass-border); color: white; padding: 10px 24px; border-radius: 8px; cursor: pointer; }
        .btn-save {
          background: linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-secondary)));
          border: none; color: white; padding: 10px 32px; border-radius: 8px;
          cursor: pointer; font-weight: 800;
        }
        
        /* Toggle Switch */
        .toggle-group { display: flex; align-items: center; gap: 10px; }
        .switch { position: relative; display: inline-block; width: 44px; height: 22px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #333; transition: .4s; }
        .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
        input:checked + .slider { background-color: hsl(var(--brand-primary)); }
        input:checked + .slider:before { transform: translateX(22px); }
        .slider.round { border-radius: 34px; }
        .slider.round:before { border-radius: 50%; }
        .toggle-label { font-size: 13px; color: hsl(var(--text-primary)); }
      `}</style>
    </div>
  );
};

export default UserModal;
