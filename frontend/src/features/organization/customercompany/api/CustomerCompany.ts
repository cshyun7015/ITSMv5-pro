import apiClient from '../../../../api/apiClient';

export interface CustomerCompanyDTO {
  id: number;
  customerId: string;
  name: string;
  businessNumber?: string;
  representativeName?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerTeamDTO {
  id: number;
  customerCompanyId: number;
  customerCompanyName: string;
  name: string;
}

export interface CustomerUserDTO {
  id: number;
  userId: string;
  name: string;
  email: string;
  role: string;
  customerTeamName: string;
}

export interface OperatorCompanyDTO {
  id: number;
  operatorCompanyId: string;
  name: string;
  businessNumber?: string;
  status: string;
}

export interface OperatorTeamDTO {
  id: number;
  operatorCompanyId: number;
  operatorCompanyName: string;
  name: string;
  description?: string;
}

export interface OperatorDTO {
  id: number;
  userId: string;
  name: string;
  email: string;
  role: string;
  teams: OperatorTeamDTO[];
}

const CustomerCompany = {
  // --- Customers CRUD ---
  getCustomerCompany: async (id: number): Promise<CustomerCompanyDTO> => {
    const response = await apiClient.get(`/customer-governance/companies/${id}`);
    return response.data;
  },
  createCustomerCompany: async (data: any): Promise<CustomerCompanyDTO> => {
    const response = await apiClient.post('/customer-governance/companies', data);
    return response.data;
  },
  updateCustomerCompany: async (id: number, data: any): Promise<CustomerCompanyDTO> => {
    const response = await apiClient.put(`/customer-governance/companies/${id}`, data);
    return response.data;
  },
  deleteCustomerCompany: async (id: number): Promise<void> => {
    await apiClient.delete(`/customer-governance/companies/${id}`);
  },

  // --- Customers Navigation ---
  getCustomerCompanies: async (): Promise<CustomerCompanyDTO[]> => {
    const response = await apiClient.get('/customer-governance/companies');
    return response.data;
  },
  getCustomerTeams: async (companyId: number): Promise<CustomerTeamDTO[]> => {
    const response = await apiClient.get(`/customer-governance/companies/${companyId}/teams`);
    return response.data;
  },
  createCustomerTeam: async (companyId: number, data: any): Promise<CustomerTeamDTO> => {
    const response = await apiClient.post(`/customer-governance/companies/${companyId}/teams`, data);
    return response.data;
  },
  updateCustomerTeam: async (id: number, data: any): Promise<CustomerTeamDTO> => {
    const response = await apiClient.put(`/customer-governance/teams/${id}`, data);
    return response.data;
  },
  deleteCustomerTeam: async (id: number): Promise<void> => {
    await apiClient.delete(`/customer-governance/teams/${id}`);
  },

  getCustomerUsers: async (teamId: number): Promise<CustomerUserDTO[]> => {
    const response = await apiClient.get(`/customer-governance/teams/${teamId}/users`);
    return response.data;
  },
  createCustomerUser: async (teamId: number, data: any): Promise<CustomerUserDTO> => {
    const response = await apiClient.post(`/customer-governance/teams/${teamId}/users`, data);
    return response.data;
  },
  updateCustomerUser: async (id: number, data: any): Promise<CustomerUserDTO> => {
    const response = await apiClient.put(`/customer-governance/users/${id}`, data);
    return response.data;
  },
  deleteCustomerUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/customer-governance/users/${id}`);
  },

  // --- Operators ---
  getOperatorCompanies: async (): Promise<OperatorCompanyDTO[]> => {
    const response = await apiClient.get('/organization/operators/companies');
    return response.data;
  },
  getOperatorTeams: async (companyId: number): Promise<OperatorTeamDTO[]> => {
    const response = await apiClient.get(`/organization/operators/companies/${companyId}/teams`);
    return response.data;
  },
  getOperatorsByTeam: async (teamId: number): Promise<OperatorDTO[]> => {
    const response = await apiClient.get(`/organization/operators/teams/${teamId}/operators`);
    return response.data;
  }
};

export default CustomerCompany;
