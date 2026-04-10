import React, { useState, useEffect } from 'react';
import { CustomerUser } from '../types/customerType';

interface CustomerUserFormProps {
  initialData?: CustomerUser;
  defaultTenantId?: string;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const CustomerUserForm: React.FC<CustomerUserFormProps> = ({ 
  initialData, 
  defaultTenantId, 
  onSubmit, 
  isLoading 
}) => {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    name: '',
    email: '',
    position: '',
    isVip: false,
    isApprover: false,
    userCriticality: 'NORMAL',
    tenantId: defaultTenantId || 'MSP',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        userId: initialData.userId || '',
        password: '',
        name: initialData.name || '',
        email: initialData.email || '',
        position: initialData.position || '',
        isVip: initialData.isVip || false,
        isApprover: initialData.isApprover || false,
        userCriticality: initialData.userCriticality || 'NORMAL',
        tenantId: initialData.tenantId || 'MSP',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
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
            type="text"
            name="tenantId"
            value={formData.tenantId}
            onChange={handleChange}
            required
            placeholder="시스템 식별자"
            className="input-base"
          />
        </div>
        <div className="space-y-1">
          <label className="label-base pl-1">User ID</label>
          <input
            type="text"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            disabled={!!initialData}
            required
            placeholder="시스템 접속 ID"
            className="input-base font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="label-base pl-1">User Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="성명"
            className="input-base font-bold"
          />
        </div>
        {!initialData ? (
          <div className="space-y-1">
            <label className="label-base pl-1">Initial Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!initialData}
              placeholder="임시 비밀번호"
              className="input-base"
            />
          </div>
        ) : (
          <div className="space-y-1">
            <label className="label-base pl-1">Position</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="직책 (예: 대리)"
              className="input-base"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="label-base pl-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="email@example.com"
            className="input-base"
          />
        </div>
        {!initialData && (
          <div className="space-y-1">
            <label className="label-base pl-1">Position</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="직책 (예: 대리)"
              className="input-base"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6 p-5 bg-white/[0.03] border border-white/10 rounded-2xl">
        <div className="flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-xs font-bold text-text-secondary">VIP 사용자</span>
              <span className="text-[10px] text-text-muted mt-0.5 italic">긴급 처리 대상</span>
           </div>
           <input
             type="checkbox"
             name="isVip"
             checked={formData.isVip}
             onChange={handleChange}
             className="w-5 h-5 rounded-md accent-amber-400 bg-white/10 border-white/10"
           />
        </div>
        <div className="flex items-center justify-between px-4 border-l border-white/5">
           <div className="flex flex-col">
              <span className="text-xs font-bold text-text-secondary">결재권자</span>
              <span className="text-[10px] text-text-muted mt-0.5 italic">승인 워크플로우</span>
           </div>
           <input
             type="checkbox"
             name="isApprover"
             checked={formData.isApprover}
             onChange={handleChange}
             className="w-5 h-5 rounded-md accent-brand-primary bg-white/10 border-white/10"
           />
        </div>
      </div>

      <div className="space-y-1">
        <label className="label-base pl-1">User Criticality</label>
        <select
          name="userCriticality"
          value={formData.userCriticality}
          onChange={handleChange}
          className="select-base"
        >
          <option value="NORMAL" className="bg-background-secondary text-primary">NORMAL</option>
          <option value="HIGH" className="bg-background-secondary text-primary">HIGH (중점 관리 대상)</option>
        </select>
      </div>

      <div className="flex gap-3 pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-md btn-primary w-full"
        >
          {isLoading ? 'Processing...' : initialData ? '정보 수정 내용 저장' : '신규 사용자 등록 완료'}
        </button>
      </div>
    </form>
  );
};

export default CustomerUserForm;
