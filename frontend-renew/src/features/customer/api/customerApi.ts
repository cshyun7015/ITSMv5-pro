import apiClient from '../../../core/api/apiClient';
import { CustomerCompany, CustomerTeam, CustomerUser } from '../types/customerType';

const BASE_URL = '/v1/customer';

/**
 * 고객 조직 관리 API 레이어 (Refactored ITIL v5)
 * - 고객사, 팀, 사용자 계층 구조 및 상세 정보 CRUD
 */
export const customerApi = {
  // --- 고객사 (Company) ---
  fetchCompanies: async (): Promise<CustomerCompany[]> => {
    const response = await apiClient.get(`${BASE_URL}/companies`);
    return response.data.data;
  },

  fetchCompany: async (id: number): Promise<CustomerCompany> => {
    const response = await apiClient.get(`${BASE_URL}/companies/${id}`);
    return response.data.data;
  },

  createCompany: async (company: Partial<CustomerCompany>): Promise<CustomerCompany> => {
    const response = await apiClient.post(`${BASE_URL}/companies`, company);
    return response.data.data;
  },

  updateCompany: async (id: number, company: Partial<CustomerCompany>): Promise<CustomerCompany> => {
    const response = await apiClient.put(`${BASE_URL}/companies/${id}`, company);
    return response.data.data;
  },

  deleteCompany: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/companies/${id}`);
  },

  // --- 조직 트리 (Organization Tree) ---
  fetchOrganizationTree: async (companyId: number): Promise<CustomerTeam[]> => {
    const response = await apiClient.get(`${BASE_URL}/companies/${companyId}/organization-tree`);
    return response.data.data;
  },

  // --- 팀 (Team) ---
  fetchTeamsByCompany: async (companyId: number): Promise<CustomerTeam[]> => {
    const response = await apiClient.get(`${BASE_URL}/companies/${companyId}/teams`);
    return response.data.data;
  },

  fetchTeam: async (id: number): Promise<CustomerTeam> => {
    const response = await apiClient.get(`${BASE_URL}/teams/${id}`);
    return response.data.data;
  },

  createTeam: async (companyId: number, team: Partial<CustomerTeam>): Promise<CustomerTeam> => {
    const response = await apiClient.post(`${BASE_URL}/companies/${companyId}/teams`, team);
    return response.data.data;
  },

  updateTeam: async (id: number, team: Partial<CustomerTeam>): Promise<CustomerTeam> => {
    const response = await apiClient.put(`${BASE_URL}/teams/${id}`, team);
    return response.data.data;
  },

  deleteTeam: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/teams/${id}`);
  },

  // --- 사용자 (User) ---
  fetchUsersByTeam: async (teamId: number): Promise<CustomerUser[]> => {
    const response = await apiClient.get(`${BASE_URL}/teams/${teamId}/users`);
    return response.data.data;
  },

  fetchUser: async (id: number): Promise<CustomerUser> => {
    const response = await apiClient.get(`${BASE_URL}/users/${id}`);
    return response.data.data;
  },

  createUser: async (teamId: number, user: Partial<CustomerUser>): Promise<CustomerUser> => {
    const response = await apiClient.post(`${BASE_URL}/teams/${teamId}/users`, user);
    return response.data.data;
  },

  updateUser: async (id: number, user: Partial<CustomerUser>): Promise<CustomerUser> => {
    const response = await apiClient.put(`${BASE_URL}/users/${id}`, user);
    return response.data.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/users/${id}`);
  }
};
