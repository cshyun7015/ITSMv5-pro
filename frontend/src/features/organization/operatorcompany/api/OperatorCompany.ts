import apiClient from '../../../../api/apiClient';

export interface OperatorCompanyDTO {
  id: number;
  operatorCompanyId: string;
  name: string;
  businessNumber?: string;
  representativeName?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: string;
  teamCount?: number;
  operatorCount?: number;
  createdAt?: string;
}

export interface OperatorTeamDTO {
  id: number;
  operatorCompanyId: number;
  operatorCompanyName: string;
  name: string;
  description?: string;
  createdAt?: string;
}

export interface OperatorDTO {
  id: number;
  userId: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  teams: OperatorTeamDTO[];
}

const OperatorCompany = {
  // --- Operator Companies CRUD ---
  getOperatorCompanies: async (): Promise<OperatorCompanyDTO[]> => {
    const response = await apiClient.get('/organization/operators/companies');
    return response.data;
  },
  getOperatorCompany: async (id: number): Promise<OperatorCompanyDTO> => {
    const response = await apiClient.get(`/organization/operators/companies/${id}`);
    return response.data;
  },
  createOperatorCompany: async (data: any): Promise<OperatorCompanyDTO> => {
    const response = await apiClient.post('/organization/operators/companies', data);
    return response.data;
  },
  updateOperatorCompany: async (id: number, data: any): Promise<OperatorCompanyDTO> => {
    const response = await apiClient.put(`/organization/operators/companies/${id}`, data);
    return response.data;
  },
  deleteOperatorCompany: async (id: number): Promise<void> => {
    await apiClient.delete(`/organization/operators/companies/${id}`);
  },

  // --- Operator Teams CRUD ---
  getOperatorTeams: async (companyId: number): Promise<OperatorTeamDTO[]> => {
    const response = await apiClient.get(`/organization/operators/companies/${companyId}/teams`);
    return response.data;
  },
  getAllTeams: async (): Promise<OperatorTeamDTO[]> => {
    const response = await apiClient.get('/organization/operators/teams');
    return response.data;
  },
  createOperatorTeam: async (companyId: number, data: any): Promise<OperatorTeamDTO> => {
    const response = await apiClient.post(`/organization/operators/companies/${companyId}/teams`, data);
    return response.data;
  },
  updateOperatorTeam: async (id: number, data: any): Promise<OperatorTeamDTO> => {
    const response = await apiClient.put(`/organization/operators/teams/${id}`, data);
    return response.data;
  },
  deleteOperatorTeam: async (id: number): Promise<void> => {
    await apiClient.delete(`/organization/operators/teams/${id}`);
  },

  // --- Operator Users CRUD ---
  getOperatorsByTeam: async (teamId: number): Promise<OperatorDTO[]> => {
    const response = await apiClient.get(`/organization/operators/teams/${teamId}/operators`);
    return response.data;
  },
  getAllOperators: async (): Promise<OperatorDTO[]> => {
    const response = await apiClient.get('/organization/operators/operators');
    return response.data;
  },
  createOperator: async (teamId: number, data: any): Promise<OperatorDTO> => {
    const response = await apiClient.post(`/organization/operators/teams/${teamId}/operators`, data);
    return response.data;
  },
  updateOperator: async (id: number, data: any): Promise<OperatorDTO> => {
    const response = await apiClient.put(`/organization/operators/operators/${id}`, data);
    return response.data;
  },
  deleteOperator: async (id: number): Promise<void> => {
    await apiClient.delete(`/organization/operators/operators/${id}`);
  }
};

export default OperatorCompany;
