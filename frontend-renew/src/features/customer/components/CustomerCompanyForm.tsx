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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2 md:col-span-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">고객사 ID</label>
          <input
            name="customerId"
            value={formData.customerId}
            onChange={handleChange}
            placeholder="예: C-001"
            required
            disabled={!!initialData}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 focus:bg-white/10 outline-none transition-all disabled:opacity-50"
          />
        </div>
        <div className="space-y-2 col-span-2 md:col-span-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">고객사명</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="상호명 입력"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 focus:bg-white/10 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">사업자 번호</label>
          <input
            name="businessNumber"
            value={formData.businessNumber}
            onChange={handleChange}
            placeholder="000-00-00000"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 focus:bg-white/10 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">대표자명</label>
          <input
            name="representativeName"
            value={formData.representativeName}
            onChange={handleChange}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 focus:bg-white/10 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">연락처</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 focus:bg-white/10 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">이메일</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 focus:bg-white/10 outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">주소</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 focus:bg-white/10 outline-none transition-all resize-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 px-8 py-3 rounded-xl font-bold text-sm text-white transition-all shadow-lg shadow-cyan-500/20"
        >
          {isLoading ? '저장 중...' : initialData ? '정보 수정' : '고객사 등록'}
        </button>
      </div>
    </form>
  );
};

export default CustomerCompanyForm;
