import apiClient from './apiClient';

export interface CompanyDTO {
  id?: number;
  companyId: string;
  name: string;
  businessNumber?: string;
  representativeName?: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

const apiCompany = {
  // 조회 (Read List)
  list: async (): Promise<CompanyDTO[]> => {
    // baseURL is already '/api/v1' in apiClient.ts
    const response = await apiClient.get('/system/companies');
    return response.data;
  },

  // 상세 (Read Detail)
  get: async (id: number): Promise<CompanyDTO> => {
    const response = await apiClient.get(`/system/companies/${id}`);
    return response.data;
  },

  // 등록 (Create)
  create: async (data: CompanyDTO): Promise<CompanyDTO> => {
    const response = await apiClient.post('/system/companies', data);
    return response.data;
  },

  // 수정 (Update)
  update: async (id: number, data: CompanyDTO): Promise<CompanyDTO> => {
    const response = await apiClient.put(`/system/companies/${id}`, data);
    return response.data;
  },

  // 삭제 (Delete)
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/system/companies/${id}`);
  }
};

export default apiCompany;
