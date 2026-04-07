import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import CommonCodeGroupList from './CommonCodeGroupList';
import CommonCodeItemList from './CommonCodeItemList';
import CommonCodeGroupDrawer from './CommonCodeGroupDrawer';
import CommonCodeItemDrawer from './CommonCodeItemDrawer';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import { commonCodeApi } from '../api/commonCodeApi';
import { CodeGroup, CommonCode } from '../types/CommonCodeTypes';

/**
 * 표준 코드 관리 메인 페이지 (MFE Module)
 * - [표준화] 400px 마스터 - 7:3 가변 디테일 레이아웃 적용
 * - [한글화] 글로벌 액션 및 타이틀 한국어 표준 전환
 * - [최적화] Drawer 기반 CRUD 통합 및 서버 상태 동기화
 */
const CommonCodePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Drawer 상태 관리
  const [isGroupDrawerOpen, setIsGroupDrawerOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<CodeGroup | null>(null);
  
  const [isItemDrawerOpen, setIsItemDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CommonCode | null>(null);

  // 컨펌 다이얼로그 상태 관리
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'danger'
  });

  // --- 서버 상태 동기화 (Groups) ---
  const groupMutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commonCodeGroups'] });
      setIsGroupDrawerOpen(false);
    }
  };

  const createGroupMut = useMutation({
    mutationFn: commonCodeApi.createGroup,
    ...groupMutationOptions
  });

  const updateGroupMut = useMutation({
    mutationFn: (data: Partial<CodeGroup>) => commonCodeApi.updateGroup(data.groupId!, data),
    ...groupMutationOptions
  });

  const deleteGroupMut = useMutation({
    mutationFn: commonCodeApi.deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commonCodeGroups'] });
      if (selectedGroupId) setSelectedGroupId(null);
    }
  });

  // --- 서버 상태 동기화 (Items) ---
  const itemMutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commonCodes', selectedGroupId] });
      setIsItemDrawerOpen(false);
    }
  };

  const createItemMut = useMutation({
    mutationFn: commonCodeApi.createItem,
    ...itemMutationOptions
  });

  const updateItemMut = useMutation({
    mutationFn: (data: Partial<CommonCode>) => commonCodeApi.updateItem(data.id!, data),
    ...itemMutationOptions
  });

  const deleteItemMut = useMutation({
    mutationFn: commonCodeApi.deleteItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['commonCodes', selectedGroupId] })
  });

  // --- 이벤트 핸들러 ---
  const handleAddGroup = () => {
    setSelectedGroup(null);
    setIsGroupDrawerOpen(true);
  };

  const handleEditGroup = (group: CodeGroup) => {
    setSelectedGroup(group);
    setIsGroupDrawerOpen(true);
  };

  const handleDeleteGroup = (groupId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: '코드 그룹 삭제',
      message: `[${groupId}] 그룹을 삭제하시겠습니까? 관련 상세 코드 데이터가 모두 영구히 소실됩니다.`,
      onConfirm: () => deleteGroupMut.mutate(groupId),
      variant: 'danger'
    });
  };

  const handleAddItem = () => {
    setSelectedItem(null);
    setIsItemDrawerOpen(true);
  };

  const handleEditItem = (item: CommonCode) => {
    if (!item.id) {
       handleAddItem();
       return;
    }
    setSelectedItem(item);
    setIsItemDrawerOpen(true);
  };

  const handleDeleteItem = (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: '상세 코드 삭제',
      message: '선택한 코드를 목록에서 영구히 삭제하시겠습니까?',
      onConfirm: () => deleteItemMut.mutate(id),
      variant: 'danger'
    });
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in relative pb-4">
      {/* 글로벌 액션 바 */}
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-text-primary tracking-tighter italic">표준 코드 관리</h2>
          <p className="text-sm text-text-muted mt-1 font-medium italic opacity-60">
            시스템 전반에서 공유되는 마스터 코드를 고밀도 마스터-디테일 구조로 관리합니다.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-md btn-secondary px-6 font-black tracking-widest text-[10px]">엑셀 내보내기</button>
          <button 
            onClick={handleAddGroup}
            className="btn-md btn-primary px-6 shadow-xl shadow-brand-primary/20 font-black tracking-widest text-[10px]"
          >
            새 코드 그룹 추가
          </button>
        </div>
      </header>

      {/* 400px Master - Flexible Detail Grid */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* 마스터 (400px 고정 영역) */}
        <div className="w-[400px] shrink-0 h-full">
          <CommonCodeGroupList 
            selectedGroupId={selectedGroupId} 
            onSelectGroup={setSelectedGroupId}
            onEdit={handleEditGroup}
            onDelete={handleDeleteGroup}
          />
        </div>

        {/* 디테일 (가변 영역) */}
        <div className="flex-1 h-full min-w-0">
          <CommonCodeItemList 
            selectedGroupId={selectedGroupId} 
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
          />
        </div>
      </div>

      {/* CRUD 전용 슬라이딩 Drawer (표준 준수) */}
      <CommonCodeGroupDrawer 
        isOpen={isGroupDrawerOpen}
        onClose={() => setIsGroupDrawerOpen(false)}
        initialData={selectedGroup}
        onSubmit={(data) => {
          if (selectedGroup) updateGroupMut.mutate(data);
          else createGroupMut.mutate(data);
        }}
        isSubmitting={createGroupMut.isPending || updateGroupMut.isPending}
      />

      <CommonCodeItemDrawer 
        isOpen={isItemDrawerOpen}
        onClose={() => setIsItemDrawerOpen(false)}
        groupId={selectedGroupId || ''}
        initialData={selectedItem}
        onSubmit={(data) => {
          if (selectedItem) updateItemMut.mutate(data);
          else createItemMut.mutate(data);
        }}
        isSubmitting={createItemMut.isPending || updateItemMut.isPending}
      />

      <ConfirmDialog 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        variant={confirmConfig.variant}
      />
    </div>
  );
};

export default CommonCodePage;
