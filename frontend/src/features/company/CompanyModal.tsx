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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setIsSubmitting(true);
      if (company?.id) {
        await apiCompany.update(company.id, formData);
      } else {
        await apiCompany.create(formData);
      }
      onSuccess();
    } catch (error: any) {
      const msg = error.response?.data?.message || '회사 ID 중복 여부를 확인해 주세요.';
      alert(`저장 실패: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card" style={{ width: '800px', maxWidth: '90vw' }}>
        <header className="modal-header" style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800 }}>{company ? '고객사 수정' : '고객사 등록'}</h2>
          
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
              {isSubmitting ? '저장 중...' : (company ? '수정' : '등록')}
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="company-form">
          <div className="form-grid">
            <div className="form-group">
              <label>회사 ID</label>
              <input
                type="text"
                value={formData.companyId}
                onChange={e => setFormData({ ...formData, companyId: e.target.value })}
                required
                disabled={!!company}
                placeholder="예: COMP-001"
              />
            </div>
            <div className="form-group">
              <label>회사명</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="회사 정식 명칭"
              />
            </div>
            <div className="form-group">
              <label>전화번호</label>
              <input
                type="text"
                value={formData.businessNumber || ''}
                onChange={e => setFormData({ ...formData, businessNumber: e.target.value })}
                placeholder="지역번호 포함"
              />
            </div>
            <div className="form-group">
              <label>대표자</label>
              <input
                type="text"
                value={formData.representativeName || ''}
                onChange={e => setFormData({ ...formData, representativeName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>이메일</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>핸드폰번호</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group full-width">
              <label>주소</label>
              <textarea
                value={formData.address || ''}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                style={{ minHeight: '100px' }}
              />
            </div>
            <div className="form-group">
              <label>상태</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">활성 (ACTIVE)</option>
                <option value="INACTIVE">비활성 (INACTIVE)</option>
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
        .company-form { display: flex; flex-direction: column; gap: 24px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .form-group { display: flex; flex-direction: column; gap: 10px; }
        .form-group.full-width { grid-column: span 2; }
        .form-group label { font-size: 11px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .form-group input, .form-group select, .form-group textarea {
          background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border);
          border-radius: 8px; padding: 12px 16px; color: white; font-size: 15px; outline: none; transition: all 0.2s;
        }
        .form-group input:focus, .form-group textarea:focus { border-color: hsl(var(--brand-primary)); background: rgba(255,255,255,0.06); }
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

export default CompanyModal;
