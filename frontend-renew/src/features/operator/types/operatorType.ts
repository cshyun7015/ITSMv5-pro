/**
 * Operator Management Domain Types
 */

export interface OperatorCompany {
  id: number;
  operatorCompanyId: string; // Business ID (e.g., OP-001)
  name: string;
  description?: string;
  businessNumber?: string;
  representativeName?: string;
  status: 'ACTIVE' | 'INACTIVE';
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface OperatorTeam {
  id: number;
  operatorCompanyId: number; // Foreign Key to OperatorCompany
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  tenantId?: string;
  parentTeamId?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Operator {
  id: number;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'ROLE_ADMIN' | 'ROLE_OPER' | 'ROLE_USER';
  isActive: boolean;
  tenantId?: string;
  operatorTeamId?: number;
  isDeleted: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface TeamCustomerMap {
  id: number;
  operatorTeamId: number;
  customerCompanyId: number;
  customerCompanyName?: string; // For UI display
  createdAt?: string;
}

export interface OperatorOrgTreeItem {
  id: string; // Custom ID like 'COMP-1', 'TEAM-5', 'OPER-10'
  type: 'COMPANY' | 'TEAM' | 'OPERATOR';
  name: string;
  originalId: number;
  children?: OperatorOrgTreeItem[];
}
