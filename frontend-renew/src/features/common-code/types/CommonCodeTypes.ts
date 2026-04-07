/**
 * ITSM v5 Standard Code Types
 * - 백엔드 CodeGroupDTO, CommonCodeDTO와 최종 맵핑 (수정됨)
 */

export interface CodeGroup {
  groupId: string;
  name: string; // groupName -> name
  description?: string;
  isSystem: boolean; // useYn -> isSystem
  createdAt?: string;
  updatedAt?: string;
}

export interface CommonCode {
  id: number;
  groupId: string;
  codeId: string; // code -> codeId
  codeName: string;
  sortOrder: number;
  description?: string;
  isActive: boolean; // useYn -> isActive
  createdAt?: string;
  updatedAt?: string;
}
