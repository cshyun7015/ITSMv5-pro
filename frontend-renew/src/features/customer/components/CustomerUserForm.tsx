import React, { useState, useEffect } from 'react';
import { CustomerUser } from '../types/customerType';

interface CustomerUserFormProps {
  initialData?: CustomerUser;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const CustomerUserForm: React.FC<CustomerUserFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    name: '',
    email: '',
    position: '',
    isVip: false,
    isApprover: false,
    userCriticality: 'NORMAL',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        userId: initialData.userId || '',
        password: '', // Password is usually not edited here for security
        name: initialData.name || '',
        email: initialData.email || '',
        position: initialData.position || '',
        isVip: initialData.isVip || false,
        isApprover: initialData.isApprover || false,
        userCriticality: initialData.userCriticality || 'NORMAL',
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">User ID</label>
          <input
            type="text"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            disabled={!!initialData}
            required
            placeholder="시스템 접속 ID"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 transition-all disabled:opacity-50"
          />
        </div>
        {!initialData && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!initialData}
              placeholder="임시 비밀번호"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">User Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="성명"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Position</label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            placeholder="직책 (예: 대리)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="email@example.com"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 p-4 bg-white/5 border border-white/10 rounded-2xl">
        <div className="flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-xs font-bold">VIP 사용자</span>
              <span className="text-[9px] text-text-muted mt-0.5 italic">긴급 처리 대상 여부</span>
           </div>
           <input
             type="checkbox"
             name="isVip"
             checked={formData.isVip}
             onChange={handleChange}
             className="w-5 h-5 rounded-md accent-amber-400 bg-white/10 border-white/10"
           />
        </div>
        <div className="flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-xs font-bold">결재권자</span>
              <span className="text-[9px] text-text-muted mt-0.5 italic">승인 워크플로우 권한</span>
           </div>
           <input
             type="checkbox"
             name="isApprover"
             checked={formData.isApprover}
             onChange={handleChange}
             className="w-5 h-5 rounded-md accent-cyan-500 bg-white/10 border-white/10"
           />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Criticality</label>
        <select
          name="userCriticality"
          value={formData.userCriticality}
          onChange={handleChange}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 transition-all appearance-none"
        >
          <option value="NORMAL">NORMAL</option>
          <option value="HIGH">HIGH (중점 관리 대상)</option>
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-[1.02] active:scale-[0.98] py-3 rounded-xl font-bold text-xs tracking-widest text-white shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:scale-100"
        >
          {isLoading ? '저장 중...' : initialData ? '사용자 정보 수정' : '신규 사용자 등록'}
        </button>
      </div>
    </form>
  );
};

export default CustomerUserForm;
