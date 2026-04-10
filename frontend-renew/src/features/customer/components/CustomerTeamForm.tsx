import React, { useState } from 'react';
import { CustomerTeam } from '../types/customerType';

interface CustomerTeamFormProps {
  initialData?: CustomerTeam;
  companyId: number;
  defaultTenantId?: string;
  onSubmit: (data: Partial<CustomerTeam>) => void;
  isLoading: boolean;
}

const CustomerTeamForm: React.FC<CustomerTeamFormProps> = ({ 
  initialData, 
  companyId, 
  defaultTenantId, 
  onSubmit, 
  isLoading 
}) => {
  const [formData, setFormData] = useState<Partial<CustomerTeam>>(
    initialData || {
      name: '',
      description: '',
      costCenter: '',
      serviceHours: '',
      status: 'ACTIVE',
      tenantId: defaultTenantId || 'MSP',
      customerCompanyId: companyId,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="label-base pl-1">Tenant ID</label>
          <input
            name="tenantId"
            value={formData.tenantId}
            onChange={handleChange}
            placeholder="시스템 식별자 (예: MSP)"
            required
            className="input-base"
          />
        </div>
        <div className="space-y-1">
          <label className="label-base pl-1">팀 명칭</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="팀 이름 (예: IT 운영팀)"
            required
            className="input-base font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="label-base pl-1">코스트 센터 (CC)</label>
          <input
            name="costCenter"
            value={formData.costCenter}
            onChange={handleChange}
            placeholder="CC001"
            className="input-base"
          />
        </div>
        <div className="space-y-1">
          <label className="label-base pl-1">서비스 시간대</label>
          <input
            name="serviceHours"
            value={formData.serviceHours}
            onChange={handleChange}
            placeholder="예: 24x7, 9x18"
            className="input-base font-mono"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="label-base pl-1">팀 상세 설명</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="팀의 주요 역할 및 책임 기술을 입력하세요"
          className="input-base h-auto py-3 resize-none"
        />
      </div>

      <div className="space-y-1">
        <label className="label-base pl-1">운영 상태</label>
        <select 
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="select-base"
        >
          <option value="ACTIVE" className="bg-background-secondary text-primary">ACTIVE (활성)</option>
          <option value="INACTIVE" className="bg-background-secondary text-primary">INACTIVE (비활성)</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-md btn-primary px-10"
        >
          {isLoading ? 'Processing...' : initialData ? '팀 정보 수정' : '신규 팀 생성'}
        </button>
      </div>
    </form>
  );
};

export default CustomerTeamForm;
