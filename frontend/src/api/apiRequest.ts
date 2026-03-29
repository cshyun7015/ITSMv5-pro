import apiClient from './apiClient';

const API_BASE_URL = '/request'; // Removed redundant /api/v1 prefix

export interface RequestItem {
    id?: number;
    reqNumber?: string;
    companyId: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    srTypeCode: string;
    srCategoryCode: string;
    srImpactCode: string;
    srUrgencyCode: string;
    srResolutionCode?: string;
    resolutionText?: string;
    requesterId: string;
    assigneeId?: string;
    serviceId?: string;
    slaTargetAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface RequestComment {
    id?: number;
    requestId: number;
    authorId: string;
    content: string;
    isInternal: boolean;
    createdAt?: string;
}

export const apiRequest = {
    // Request APIs
    getRequests: () => apiClient.get<RequestItem[]>(API_BASE_URL),
    getRequest: (id: number) => apiClient.get<RequestItem>(`${API_BASE_URL}/${id}`),
    createRequest: (data: RequestItem) => apiClient.post<RequestItem>(API_BASE_URL, data),
    updateRequest: (id: number, data: RequestItem) => apiClient.put<RequestItem>(`${API_BASE_URL}/${id}`, data),
    deleteRequest: (id: number) => apiClient.delete(`${API_BASE_URL}/${id}`),
    
    // Comment APIs
    getComments: (requestId: number) => apiClient.get<RequestComment[]>(`${API_BASE_URL}/${requestId}/comments`),
    addComment: (requestId: number, data: RequestComment) => apiClient.post<RequestComment>(`${API_BASE_URL}/${requestId}/comments`, data),
};
