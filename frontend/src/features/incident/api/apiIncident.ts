import axios from 'axios';

const API_BASE_URL = '/api/v1/incident';

export interface IncidentDTO {
  id?: number;
  incidentId?: string;
  title: string;
  description: string;
  tenantId: string;
  categoryId?: string;
  subCategoryId?: string;
  serviceId?: string;
  ciId?: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  priority?: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED' | 'CLOSED';
  onHoldReason?: string;
  requesterId: string;
  assigneeId?: string;
  assignmentGroupId?: string;
  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  slaDueDate?: string;
  isSlaBreached?: boolean;
  traceId?: string;
  eventId?: string;
  resolutionCode?: string;
  workaround?: string;
}

export const apiIncident = {
  create: (data: IncidentDTO) => axios.post<IncidentDTO>(API_BASE_URL, data),
  list: (tenantId: string) => axios.get<IncidentDTO[]>(`${API_BASE_URL}?tenantId=${tenantId}`),
  get: (id: number) => axios.get<IncidentDTO>(`${API_BASE_URL}/${id}`),
  update: (id: number, data: Partial<IncidentDTO>, userId: string) => 
    axios.put<IncidentDTO>(`${API_BASE_URL}/${id}?userId=${userId}`, data),
  delete: (id: number) => axios.delete(`${API_BASE_URL}/${id}`),
};
