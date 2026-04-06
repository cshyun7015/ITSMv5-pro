import apiClient from '../../../api/apiClient';

const API_BASE_URL = '/system/codes'; // Removed redundant /api/v1 prefix

export interface CodeGroup {
    groupId: string;
    name: string;
    description: string;
    isSystem: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CommonCode {
    id?: number;
    groupId: string;
    codeId: string;
    codeName: string;
    description: string;
    sortOrder: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export const apiCommonCode = {
    // Group APIs
    getGroups: () => apiClient.get<CodeGroup[]>(`${API_BASE_URL}/groups`),
    getGroup: (groupId: string) => apiClient.get<CodeGroup>(`${API_BASE_URL}/groups/${groupId}`),
    createGroup: (data: CodeGroup) => apiClient.post<CodeGroup>(`${API_BASE_URL}/groups`, data),
    updateGroup: (groupId: string, data: CodeGroup) => apiClient.put<CodeGroup>(`${API_BASE_URL}/groups/${groupId}`, data),
    deleteGroup: (groupId: string) => apiClient.delete(`${API_BASE_URL}/groups/${groupId}`),

    // Code Item APIs
    getCodesByGroup: (groupId: string) => apiClient.get<CommonCode[]>(`${API_BASE_URL}/groups/${groupId}/items`),
    createCode: (data: CommonCode) => apiClient.post<CommonCode>(`${API_BASE_URL}/items`, data),
    updateCode: (id: number, data: CommonCode) => apiClient.put<CommonCode>(`${API_BASE_URL}/items/${id}`, data),
    deleteCode: (id: number) => apiClient.delete(`${API_BASE_URL}/items/${id}`),
};
