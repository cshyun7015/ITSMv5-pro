import apiClient from './apiClient';

export interface UserDTO {
  id?: number;
  userId: string;
  password?: string;
  name: string;
  email?: string;
  role?: string;
  companyId: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const apiUser = {
  // 조회 (Read List by Company)
  list: async (companyId?: string): Promise<UserDTO[]> => {
    // baseURL is already '/api/v1' in apiClient.ts
    const url = companyId ? `/system/users?companyId=${companyId}` : '/system/users';
    const response = await apiClient.get(url);
    return response.data;
  },

  // 상세 (Read Detail)
  get: async (id: number): Promise<UserDTO> => {
    const response = await apiClient.get(`/system/users/${id}`);
    return response.data;
  },

  // 등록 (Create)
  create: async (data: UserDTO): Promise<UserDTO> => {
    const response = await apiClient.post('/system/users', data);
    return response.data;
  },

  // 수정 (Update)
  update: async (id: number, data: UserDTO): Promise<UserDTO> => {
    const response = await apiClient.put(`/system/users/${id}`, data);
    return response.data;
  },

  // 삭제 (Delete)
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/system/users/${id}`);
  }
};

export default apiUser;
