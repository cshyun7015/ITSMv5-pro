export interface CustomerCompany {
  id: number;
  customerId: string;
  name: string;
  businessNumber?: string;
  representativeName?: string;
  phone?: string;
  email?: string;
  address?: string;
  tenantId?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerTeam {
  id: number;
  customerCompanyId: number;
  customerCompanyName?: string;
  parentTeamId?: number;
  parentTeamName?: string;
  name: string;
  description?: string;
  costCenter?: string;
  serviceHours?: string;
  status: string;
  tenantId?: string;
  createdAt?: string;
}

export interface CustomerUser {
  id: number;
  customerTeamId: number;
  customerTeamName?: string;
  userId: string;
  name: string;
  email?: string;
  position?: string;
  role: string;
  isActive: boolean;
  isVip: boolean;
  isApprover: boolean;
  userCriticality?: string;
  tenantId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
