import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { commonCodeApi } from '../api/commonCodeApi';
import { CodeGroup } from '../types/CommonCodeTypes';

interface Props {
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  onEdit: (group: CodeGroup) => void;
  onDelete: (groupId: string) => void;
}

/**
 * 코드 그룹 마스터 테이블 (좌측 400px 고정)
 * - [표준화] base.css의 .table-base 클래스 적용
 * - [한글화] 모든 라벨 및 툴팁 한국어 전환
 */
const CommonCodeGroupList: React.FC<Props> = ({ 
  selectedGroupId, 
  onSelectGroup, 
  onEdit, 
  onDelete 
}) => {
  const { data: groups, isLoading, error } = useQuery<CodeGroup[]>({
    queryKey: ['commonCodeGroups'],
    queryFn: commonCodeApi.fetchGroups,
  });

  if (isLoading) return (
    <div className="space-y-4 animate-pulse p-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-11 bg-white/5 rounded-lg"></div>
      ))}
    </div>
  );

  if (error) return (
    <div className="p-8 text-center bg-red-500/5 border border-red-500/20 rounded-2xl font-main">
      <p className="text-sm text-red-400 font-bold">코드 그룹 로드 중 오류가 발생했습니다.</p>
    </div>
  );

  return (
    <div className="card-base border-white/5 bg-white/[0.01] flex flex-col h-full overflow-hidden !hover:scale-100 !hover:bg-white/[0.01] !cursor-default">
      <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <h3 className="text-xs font-black text-white/60 tracking-widest uppercase">코드 그룹 목록</h3>
        <span className="text-[10px] px-2 py-0.5 bg-brand-primary/10 rounded-full font-mono text-brand-primary font-bold">
          {groups?.length || 0} 건
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <table className="table-base">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="table-header-cell !px-4 !py-3">그룹 정보</th>
              <th className="table-header-cell !px-4 !py-3 w-16 text-center">상태</th>
            </tr>
          </thead>
          <tbody>
            {(groups || []).map((group) => {
              const isSelected = selectedGroupId === group.groupId;
              return (
                <tr 
                  key={group.groupId} 
                  onClick={() => onSelectGroup(group.groupId)}
                  className={`group table-row ${
                    isSelected 
                    ? 'bg-brand-primary/10 border-l-2 border-brand-primary' 
                    : ''
                  }`}
                >
                  <td className="px-4 py-3 relative border-b border-white/5">
                    <div className="flex flex-col min-w-0">
                      <span className={`text-sm font-bold truncate whitespace-nowrap ${isSelected ? 'text-brand-primary' : 'text-text-primary'}`}>
                        {group.name}
                      </span>
                      <span className="text-[10px] font-mono text-text-muted italic truncate leading-tight mt-0.5">
                        {group.groupId}
                      </span>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background-secondary/90 backdrop-blur-sm pl-2 rounded-l-lg border-l border-white/5">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(group); }}
                        className="p-1.5 hover:bg-white/10 rounded-md text-text-muted hover:text-brand-primary transition-colors"
                        title="그룹 정보 수정"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(group.groupId); }}
                        disabled={group.isSystem}
                        className={`p-1.5 hover:bg-white/10 rounded-md transition-colors ${group.isSystem ? 'opacity-20 cursor-not-allowed' : 'text-text-muted hover:text-status-critical'}`}
                        title={group.isSystem ? '시스템 필수 코드는 삭제할 수 없습니다' : '그룹 삭제'}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center border-b border-white/5">
                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${group.isSystem ? 'bg-brand-primary shadow-[0_0_8px_rgba(var(--brand-primary-rgb),0.5)]' : 'bg-white/10'}`}></span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommonCodeGroupList;
