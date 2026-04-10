/**
 * Operator Management Domain Types
 */

export interface OperatorCompany {
  id: number;
  operatorCompanyId: string; // Business ID (e.g., OP-001)
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface OperatorTeam {
  id: number;
  operatorCompanyId: number; // Foreign Key to OperatorCompany
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  parentTeamId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Operator {
  id: number;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'ROLE_ADMIN' | 'ROLE_OPER' | 'ROLE_USER';
  isActive: boolean;
  operatorTeamId?: number;
  isDeleted: number;
  createdAt?: string;
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
