import React from 'react';
import { useAuthStore } from '../../core/auth/useAuthStore';

// Note: In a real MFE, this would be fetched from '../api/incidentApi'
const mockIncidents = [
  { id: 'INC-2024-001', title: 'ERP 시스템 접속 불가 장애', requester: '김철수', status: 'critical', badge: 'Critical' },
  { id: 'INC-2024-002', title: '인사 연동 오류 발생', requester: '이영희', status: 'high', badge: 'High' },
  { id: 'INC-2024-003', title: '네트워크 속도 저하', requester: '박지민', status: 'medium', badge: 'Medium' },
];

/**
 * 인시던트 관리 - 목록 조회 (MFE Module)
 * - 독립적 상태 관리 및 데이터 페칭 담당
 */
const IncidentList: React.FC = () => {
  const { tenantId } = useAuthStore();

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">인시던트 관리</h2>
          <p className="text-sm text-text-muted mt-1 font-medium italic">
            {tenantId.toUpperCase()} 테넌트에 등록된 실시간 장애 현황입니다.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-md btn-secondary">필터링</button>
          <button className="btn-md btn-primary shadow-lg shadow-cyan-500/20">신규 인시던트 등록</button>
        </div>
      </header>

      {/* 통계 요약 카드 (MFE 로컬 컴포넌트) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['Critical', 'High', 'Medium', 'Low'].map((level) => (
          <div key={level} className="card-base border-white/5 bg-white/[0.02] p-4 group hover:bg-white/[0.05]">
            <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase">{level}</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-3xl font-black text-white group-hover:text-cyan-400 transition-colors">12</span>
              <span className="text-[10px] text-white/20">Last 24h</span>
            </div>
          </div>
        ))}
      </div>

      {/* 데이터 테이블 표준 적용 */}
      <div className="table-container bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
        <table className="table-base">
          <thead>
            <tr>
              <th className="table-header-cell w-32 border-none">No</th>
              <th className="table-header-cell border-none">인시던트 요약</th>
              <th className="table-header-cell w-40 border-none">요청자</th>
              <th className="table-header-cell w-40 border-none text-center">상태</th>
              <th className="table-header-cell w-16 border-none"></th>
            </tr>
          </thead>
          <tbody>
            {mockIncidents.map((incident) => (
              <tr key={incident.id} className="table-row group hover:bg-white/[0.05]">
                <td className="table-body-cell font-mono text-xs text-white/40">{incident.id}</td>
                <td className="table-body-cell">
                  <div className="font-bold text-text-primary group-hover:text-cyan-400 transition-colors text-base line-clamp-1">
                    {incident.title}
                  </div>
                </td>
                <td className="table-body-cell text-sm font-medium">{incident.requester}</td>
                <td className="table-body-cell text-center">
                  <span className={`badge-status badge-md badge-${incident.status}`}>{incident.badge}</span>
                </td>
                <td className="table-body-cell text-center">
                  <button className="text-white/10 group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncidentList;
