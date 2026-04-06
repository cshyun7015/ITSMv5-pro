import apiClient from '../../../api/apiClient';

export interface RequestDTO {
  id?: number;
  reqNumber?: string;
  companyId: string;
  title: string;
  description: string;
  status?: string;
  priority?: string;
  srTypeCode: string;
  srCategoryCode: string;
  srImpactCode: string;
  srUrgencyCode: string;
  srResolutionCode?: string;
  resolutionText?: string;
  requesterId: string;
  assigneeId?: string;
  serviceId?: string;
  ciId?: string;
  slaTargetAt?: string;
  expectedAt?: string;
  srSourceCode?: string;
  resolvedAt?: string;
  closedAt?: string;
  reopenCount?: number;
  createdAt?: string;
  updatedAt?: string;
  attachments?: AttachmentDTO[];
}

export interface AttachmentDTO {
  id: number;
  requestId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export interface RequestCommentDTO {
  id?: number;
  requestId?: number;
  authorId: string;
  content: string;
  isInternal?: boolean;
  createdAt?: string;
}

const API_PATH = '/request';

const requestApi = {
  getRequests: (params: any) => {
    return apiClient.get(API_PATH, { params });
  },

  getRequest: (id: number) => {
    return apiClient.get(`${API_PATH}/${id}`);
  },

  createRequest: (data: RequestDTO) => {
    return apiClient.post(API_PATH, data);
  },

  updateRequest: (id: number, data: RequestDTO) => {
    return apiClient.put(`${API_PATH}/${id}`, data);
  },

  deleteRequest: (id: number) => {
    return apiClient.delete(`${API_PATH}/${id}`);
  },

  addComment: (id: number, data: RequestCommentDTO) => {
    return apiClient.post(`${API_PATH}/${id}/comments`, data);
  },

  getComments: (id: number) => {
    return apiClient.get(`${API_PATH}/${id}/comments`);
  },

  uploadAttachment: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`${API_PATH}/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  downloadAttachment: (attachmentId: number) => {
    return apiClient.get(`${API_PATH}/attachments/${attachmentId}/download`, {
      responseType: 'blob'
    });
  },

  getHistory: (id: number) => {
    return apiClient.get(`${API_PATH}/${id}/history`);
  }
};

export default requestApi;
