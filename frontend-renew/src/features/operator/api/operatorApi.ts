import apiClient from '../../../core/api/apiClient';
import { OperatorCompany, OperatorTeam, Operator, TeamCustomerMap } from '../types/operatorType';

const BASE_URL = '/v1/operator';

/**
 * Operator Management API Layer
 * - Operator Companies, Teams, and Operators CRUD
 * - Team-Customer Mapping
 */
export const operatorApi = {
  // --- Operator Company ---
  fetchCompanies: async (): Promise<OperatorCompany[]> => {
    const response = await apiClient.get(`${BASE_URL}/companies`);
    return response.data.data;
  },

  fetchCompany: async (id: number): Promise<OperatorCompany> => {
    const response = await apiClient.get(`${BASE_URL}/companies/${id}`);
    return response.data.data;
  },

  createCompany: async (company: Partial<OperatorCompany>): Promise<OperatorCompany> => {
    const response = await apiClient.post(`${BASE_URL}/companies`, company);
    return response.data.data;
  },

  updateCompany: async (id: number, company: Partial<OperatorCompany>): Promise<OperatorCompany> => {
    const response = await apiClient.put(`${BASE_URL}/companies/${id}`, company);
    return response.data.data;
  },

  deleteCompany: async (id: number, hardDelete: boolean = false): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/companies/${id}`, { params: { hardDelete } });
  },

  // --- Operator Team ---
  fetchTeamsByCompany: async (companyId: number): Promise<OperatorTeam[]> => {
    const response = await apiClient.get(`${BASE_URL}/companies/${companyId}/teams`);
    return response.data.data;
  },

  fetchTeam: async (id: number): Promise<OperatorTeam> => {
    const response = await apiClient.get(`${BASE_URL}/teams/${id}`);
    return response.data.data;
  },

  createTeam: async (companyId: number, team: Partial<OperatorTeam>): Promise<OperatorTeam> => {
    const response = await apiClient.post(`${BASE_URL}/companies/${companyId}/teams`, team);
    return response.data.data;
  },

  updateTeam: async (id: number, team: Partial<OperatorTeam>): Promise<OperatorTeam> => {
    const response = await apiClient.put(`${BASE_URL}/teams/${id}`, team);
    return response.data.data;
  },

  deleteTeam: async (id: number, hardDelete: boolean = false): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/teams/${id}`, { params: { hardDelete } });
  },

  // --- Operator (Individual) ---
  fetchOperatorsByTeam: async (teamId: number): Promise<Operator[]> => {
    const response = await apiClient.get(`${BASE_URL}/teams/${teamId}/operators`);
    return response.data.data;
  },

  fetchOperator: async (id: number): Promise<Operator> => {
    const response = await apiClient.get(`${BASE_URL}/operators/${id}`);
    return response.data.data;
  },

  createOperator: async (teamId: number, operator: Partial<Operator>): Promise<Operator> => {
    const response = await apiClient.post(`${BASE_URL}/teams/${teamId}/operators`, operator);
    return response.data.data;
  },

  updateOperator: async (id: number, operator: Partial<Operator>): Promise<Operator> => {
    const response = await apiClient.put(`${BASE_URL}/operators/${id}`, operator);
    return response.data.data;
  },

  deleteOperator: async (id: number, hardDelete: boolean = false): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/operators/${id}`, {
      params: { hardDelete }
    });
  },

  // --- Team-Customer Mapping ---
  fetchMappingsByTeam: async (teamId: number): Promise<TeamCustomerMap[]> => {
    const response = await apiClient.get(`${BASE_URL}/mapping/team/${teamId}`);
    return response.data.data;
  },

  saveMappings: async (teamId: number, customerIds: number[]): Promise<void> => {
    await apiClient.post(`${BASE_URL}/mapping/team/${teamId}`, { customerCompanyIds: customerIds });
  }
};
