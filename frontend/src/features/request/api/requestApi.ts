import axios from 'axios';

const API_BASE_URL = '/api/v1/request';

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

const getCompanyId = () => {
  // Logic to get company ID from session/token
  return 'COMP-ALPHA'; // Mock for now
};

const requestApi = {
  getRequests: (params: any) => {
    return axios.get(API_BASE_URL, {
      params,
      headers: { 'X-Company-ID': getCompanyId() }
    });
  },

  getRequest: (id: number) => {
    return axios.get(`${API_BASE_URL}/${id}`);
  },

  createRequest: (data: RequestDTO) => {
    return axios.post(API_BASE_URL, data);
  },

  updateRequest: (id: number, data: RequestDTO) => {
    return axios.put(`${API_BASE_URL}/${id}`, data);
  },

  deleteRequest: (id: number) => {
    return axios.delete(`${API_BASE_URL}/${id}`);
  },

  addComment: (id: number, data: RequestCommentDTO) => {
    return axios.post(`${API_BASE_URL}/${id}/comments`, data);
  },

  getComments: (id: number) => {
    return axios.get(`${API_BASE_URL}/${id}/comments`);
  },

  uploadAttachment: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_BASE_URL}/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  downloadAttachment: (attachmentId: number) => {
    return axios.get(`${API_BASE_URL}/attachments/${attachmentId}/download`, {
      responseType: 'blob'
    });
  }
};

export default requestApi;
