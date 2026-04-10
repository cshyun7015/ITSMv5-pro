import React, { useState } from 'react';
import { CustomerCompany } from '../types/customerType';

interface CustomerCompanyFormProps {
  initialData?: CustomerCompany;
  onSubmit: (data: Partial<CustomerCompany>) => void;
  isLoading: boolean;
}

const CustomerCompanyForm: React.FC<CustomerCompanyFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<Partial<CustomerCompany>>(
    initialData || {
      tenantId: 'MSP',
      customerId: '',
      name: '',
      businessNumber: '',
      representativeName: '',
      phone: '',
      email: '',
      address: '',
      status: 'ACTIVE',
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
          <label className="label-base">Tenant ID</label>
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
          <label className="label-base">고객사 식별 ID</label>
          <input
            name="customerId"
            value={formData.customerId}
            onChange={handleChange}
            placeholder="예: C-001"
            required
            disabled={!!initialData}
            className="input-base font-mono"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="label-base">고객사 명칭</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="공식 상호명 입력"
          required
          className="input-base font-bold"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="label-base">사업자 번호</label>
          <input
            name="businessNumber"
            value={formData.businessNumber}
            onChange={handleChange}
            placeholder="000-00-00000"
            className="input-base"
          />
        </div>
        <div className="space-y-1">
          <label className="label-base">대표자 성명</label>
          <input
            name="representativeName"
            value={formData.representativeName}
            onChange={handleChange}
            className="input-base"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="label-base">대표 연락처</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="input-base"
          />
        </div>
        <div className="space-y-1">
          <label className="label-base">대표 이메일</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="input-base"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="label-base">본사 주소</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={2}
            className="input-base h-auto py-3 resize-none"
          />
        </div>
        <div className="space-y-1">
          <label className="label-base">운영 상태</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="select-base font-bold"
          >
            <option value="ACTIVE" className="bg-background-secondary text-green-400">ACTIVE (정상 운영)</option>
            <option value="INACTIVE" className="bg-background-secondary text-red-400">INACTIVE (임시 중단)</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-md btn-primary px-10"
        >
          {isLoading ? '저장 중...' : initialData ? '정보 수정' : '고객사 등록'}
        </button>
      </div>
    </form>
  );
};

export default CustomerCompanyForm;
