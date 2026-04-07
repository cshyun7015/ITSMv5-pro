import apiClient from '../../../core/api/apiClient';
import { CodeGroup, CommonCode } from '../types/CommonCodeTypes';

const BASE_URL = '/v1/system/codes';

/**
 * 표준 코드 관리 API 레이어
 * - 그룹 조회, 상세 코드 조회 및 CRUD 기능 제공
 */
export const commonCodeApi = {
  // --- 코드 그룹 ---
  fetchGroups: async (): Promise<CodeGroup[]> => {
    const response = await apiClient.get(`${BASE_URL}/groups`);
    return response.data;
  },
  
  createGroup: async (group: Partial<CodeGroup>): Promise<CodeGroup> => {
    const response = await apiClient.post(`${BASE_URL}/groups`, group);
    return response.data;
  },
  
  updateGroup: async (groupId: string, group: Partial<CodeGroup>): Promise<CodeGroup> => {
    const response = await apiClient.put(`${BASE_URL}/groups/${groupId}`, group);
    return response.data;
  },
  
  deleteGroup: async (groupId: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/groups/${groupId}`);
  },

  // --- 상세 코드 아이템 ---
  fetchItemsByGroup: async (groupId: string): Promise<CommonCode[]> => {
    const response = await apiClient.get(`${BASE_URL}/groups/${groupId}/items`);
    return response.data;
  },
  
  createItem: async (item: Partial<CommonCode>): Promise<CommonCode> => {
    const response = await apiClient.post(`${BASE_URL}/items`, item);
    return response.data;
  },
  
  updateItem: async (id: number, item: Partial<CommonCode>): Promise<CommonCode> => {
    const response = await apiClient.put(`${BASE_URL}/items/${id}`, item);
    return response.data;
  },
  
  deleteItem: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/items/${id}`);
  }
};
