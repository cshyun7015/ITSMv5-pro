import apiClient from './apiClient';

export interface DashboardSummary {
  companyCount: number;
  userCount: number;
  totalRequests: number;
  openRequests: number;
  inProgressRequests: number;
  createdToday: number;
  closedToday: number;
  statusDistribution: Record<string, number>;
}

export const apiDashboard = {
  getSummary: () => apiClient.get<DashboardSummary>('/dashboard/summary'),
};
