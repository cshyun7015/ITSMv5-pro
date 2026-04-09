import React, { useState } from 'react';
import { CustomerTeam } from '../types/customerType';

interface CustomerTeamFormProps {
  initialData?: CustomerTeam;
  companyId: number;
  onSubmit: (data: Partial<CustomerTeam>) => void;
  isLoading: boolean;
}

const CustomerTeamForm: React.FC<CustomerTeamFormProps> = ({ initialData, companyId, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<Partial<CustomerTeam>>(
    initialData || {
      name: '',
      description: '',
      costCenter: '',
      serviceHours: '',
      status: 'ACTIVE',
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
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">팀 명칭</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="팀 이름 입력 (예: IT 운영팀)"
          required
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 focus:bg-white/10 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">코스트 센터 (CC)</label>
          <input
            name="costCenter"
            value={formData.costCenter}
            onChange={handleChange}
            placeholder="CC001"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 focus:bg-white/10 outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">서비스 시간대</label>
          <input
            name="serviceHours"
            value={formData.serviceHours}
            onChange={handleChange}
            placeholder="예: 24x7, 9x18"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 focus:bg-white/10 outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">팀 상세 설명</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="팀의 주요 역할 및 책임 기술"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 focus:bg-white/10 outline-none transition-all resize-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-brand-primary text-white hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-primary/20"
        >
          {isLoading ? '저장 중...' : initialData ? '팀 정보 수정' : '팀 생성'}
        </button>
      </div>
    </form>
  );
};

export default CustomerTeamForm;
