import { useState, useEffect } from 'react';
import apiUser, { type UserDTO } from '../../api/apiUser';
import apiCompany, { type CompanyDTO } from '../../api/apiCompany';

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
    companyId: '',
    isActive: true
  });
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch companies for dropdown
    apiCompany.list({ size: 1000 }).then(res => {
      setCompanies(res.content);
      if (!user && res.content.length > 0) {
        setFormData(prev => ({ ...prev, companyId: res.content[0].companyId }));
      }
    });

    if (user) {
      setFormData({
        ...user,
        password: '' // Don't populate password during edit
      });
    }
  }, [user]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setIsSubmitting(true);
      if (user?.id) {
        await apiUser.update(user.id, formData);
      } else {
        await apiUser.create(formData);
      }
      onSuccess();
    } catch (error: any) {
      const msg = error.response?.data?.message || '아이디 중복 여부를 확인해 주세요.';
      alert(`저장 실패: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card" style={{ width: '800px', maxWidth: '90vw' }}>
        <header className="modal-header" style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800 }}>{user ? '사용자 정보 수정' : '신규 사용자 등록'}</h2>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
              style={{ minWidth: '120px', height: '44px', padding: '0 32px', borderRadius: '12px', fontSize: '14px', fontWeight: 700 }}
            >
              목록
            </button>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={() => handleSubmit()} 
              disabled={isSubmitting}
              style={{ minWidth: '120px', height: '44px', padding: '0 32px', borderRadius: '12px', fontSize: '14px', fontWeight: 700 }}
            >
              {isSubmitting ? '저장 중...' : (user ? '수정' : '등록')}
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-grid">
            <div className="form-group">
              <label>로그인 ID</label>
              <input
                type="text"
                value={formData.userId}
                onChange={e => setFormData({ ...formData, userId: e.target.value })}
                required
                disabled={!!user}
                placeholder="예: jdoe"
              />
            </div>
            
            <div className="form-group">
              <label>{user ? '새 비밀번호' : '비밀번호'}</label>
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required={!user}
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label>성명</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="홍길동"
              />
            </div>

            <div className="form-group">
              <label>이메일</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@company.com"
              />
            </div>

            <div className="form-group">
              <label>권한</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="ROLE_USER">일반 사용자 (ROLE_USER)</option>
                <option value="ROLE_MANAGER">매니저 (ROLE_MANAGER)</option>
                <option value="ROLE_ADMIN">관리자 (ROLE_ADMIN)</option>
              </select>
            </div>

            <div className="form-group">
              <label>상태</label>
              <select
                value={formData.isActive ? 'ACTIVE' : 'INACTIVE'}
                onChange={e => setFormData({ ...formData, isActive: e.target.value === 'ACTIVE' })}
              >
                <option value="ACTIVE">활성 (ACTIVE)</option>
                <option value="INACTIVE">비활성 (INACTIVE)</option>
              </select>
            </div>
            
            <div className="form-group full-width">
              <label>소속 고객사</label>
              <select
                value={formData.companyId}
                onChange={e => setFormData({ ...formData, companyId: e.target.value })}
                required
              >
                <option value="">고객사 선택...</option>
                {companies.map(c => <option key={c.companyId} value={c.companyId}>{c.name} ({c.companyId})</option>)}
              </select>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .modal-content {
          padding: 48px; border: 1px solid var(--glass-border);
        }
        .modal-header { display: flex; justify-content: space-between; align-items: center; }
        .user-form { display: flex; flex-direction: column; gap: 24px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .form-group { display: flex; flex-direction: column; gap: 10px; }
        .form-group.full-width { grid-column: span 2; }
        .form-group label { font-size: 11px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .form-group input, .form-group select {
          background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border);
          border-radius: 8px; padding: 12px 16px; color: white; font-size: 15px; outline: none; transition: all 0.2s;
        }
        .form-group input:focus, .form-group select:focus { border-color: hsl(var(--brand-primary)); background: rgba(255,255,255,0.06); }
        .form-group input:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .btn-primary { 
          background: linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-secondary))); 
          border: none; color: white; cursor: pointer; transition: all 0.2s; 
        }
        .btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-secondary { 
          background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); 
          color: white; cursor: pointer; transition: all 0.2s; 
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default UserModal;
