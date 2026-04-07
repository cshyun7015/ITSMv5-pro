import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { commonCodeApi } from '../api/commonCodeApi';
import { CommonCode } from '../types/CommonCodeTypes';

interface Props {
  selectedGroupId: string | null;
  onEdit: (item: CommonCode) => void;
  onDelete: (id: number) => void;
}

/**
 * 전역 공통 코드 아이템 관리 테이블 (우측 70%)
 * - [표준화] base.css의 .table-container 및 .table-base 적용
 * - [한글화] 액션 버튼 및 상태 라벨 한국어 전환
 * - [최적화] 가로 스크롤 제로(Zero-Scroll)를 위한 유동 레이아웃
 */
const CommonCodeItemList: React.FC<Props> = ({ 
  selectedGroupId, 
  onEdit, 
  onDelete 
}) => {
  const { data: items, isLoading, isFetching } = useQuery<CommonCode[]>({
    queryKey: ['commonCodes', selectedGroupId],
    queryFn: () => commonCodeApi.fetchItemsByGroup(selectedGroupId!),
    enabled: !!selectedGroupId,
  });

  if (!selectedGroupId) {
    return (
      <div className="card-base h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-white/[0.02] to-transparent !cursor-default !hover:scale-100">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h3 className="text-lg font-black text-white tracking-widest uppercase italic">그룹을 선택하세요</h3>
        <p className="text-xs text-text-muted mt-2 max-w-xs italic">
          좌측 목록에서 상세 정보를 확인하고 싶은 코드 그룹를 선택해 주세요.
        </p>
      </div>
    );
  }

  if (isLoading) return (
    <div className="space-y-4 animate-pulse p-4 h-full">
      <div className="h-20 bg-white/10 rounded-2xl"></div>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-11 bg-white/5 rounded-lg"></div>
      ))}
    </div>
  );

  return (
    <div className="table-container flex flex-col h-full bg-white/[0.01] border-white/5 relative overflow-hidden">
      {/* 백그라운드 리프레시 진행중 */}
      {isFetching && (
        <div className="absolute top-0 right-0 p-4 z-20">
          <div className="w-4 h-4 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
        </div>
      )}

      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="min-w-0">
          <h3 className="text-xl font-black text-white tracking-tight">상세 코드 아이템</h3>
          <p className="text-[10px] text-brand-primary font-mono mt-1 font-bold italic tracking-wider truncate uppercase">전개된 컨텍스트: {selectedGroupId}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button 
            className="btn-sm btn-primary px-4 shadow-lg shadow-brand-primary/10"
            onClick={() => onEdit({} as CommonCode)}
          >
            아이템 추가
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="table-base w-full">
          <thead className="sticky top-0 z-10 w-full">
            <tr>
              <th className="table-header-cell !px-6 !py-3 w-1/4">코드 ID</th>
              <th className="table-header-cell !px-6 !py-3 w-auto">명칭 및 설명</th>
              <th className="table-header-cell !px-6 !py-3 w-20 text-center">정렬</th>
              <th className="table-header-cell !px-6 !py-3 w-24 text-center">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {(items || []).length === 0 ? (
              <tr>
                <td colSpan={4} className="py-24 text-center text-text-muted italic text-sm">
                  현재 그룹에는 정의된 상세 코드가 없습니다.
                </td>
              </tr>
            ) : (
              (items || []).map((item) => (
                <tr key={item.id} className="group table-row relative">
                  <td className="table-body-cell !px-6 !py-4 font-mono !text-xs !text-text-muted group-hover:text-brand-primary transition-colors">
                    {item.codeId}
                  </td>
                  <td className="table-body-cell !px-6 !py-4 relative">
                    <div className="flex flex-col min-w-0 pr-20">
                      <span className="text-sm font-bold text-text-primary group-hover:text-brand-primary transition-colors truncate">
                        {item.codeName}
                      </span>
                      {item.description && (
                        <p className="text-[10px] text-text-muted italic mt-1 truncate">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Hover Row Actions Overlay */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 bg-background-secondary shadow-2xl border border-white/10 p-1 rounded-lg">
                      <button 
                        onClick={() => onEdit(item)}
                        className="p-1.5 hover:bg-white/10 rounded-md text-text-muted hover:text-brand-primary transition-colors"
                        title="아이템 상세 수정"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 hover:bg-white/10 rounded-md text-text-muted hover:text-status-critical transition-colors"
                        title="아이템 삭제"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="table-body-cell !px-6 !py-4 text-center">
                    <span className="text-[11px] font-mono font-black text-text-muted bg-white/5 px-2 py-0.5 rounded group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-all border border-white/5">
                      {String(item.sortOrder).padStart(2, '0')}
                    </span>
                  </td>
                  <td className="table-body-cell !px-6 !py-4 text-center">
                    <span className={`badge-status badge-sm px-2 ${item.isActive ? 'badge-low border-status-low/20' : 'bg-white/5 border-white/10 text-text-muted'}`}>
                      {item.isActive ? '사용중' : '중지됨'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommonCodeItemList;
