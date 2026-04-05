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
  isMajorIncident?: boolean;
  channel?: 'PHONE' | 'EMAIL' | 'SELF_SERVICE' | 'MONITORING' | 'CHAT' | 'OTHER';
  
  requesterId: string;
  affectedUserId?: string;
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

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const apiIncident = {
  create: (data: IncidentDTO) => axios.post<IncidentDTO>(API_BASE_URL, data),
  list: (tenantId: string, status?: string[], page: number = 0, size: number = 10) => {
    const params = new URLSearchParams();
    params.append('tenantId', tenantId);
    if (status && status.length > 0) {
      status.forEach(s => params.append('status', s));
    }
    params.append('page', page.toString());
    params.append('size', size.toString());
    return axios.get<PaginatedResponse<IncidentDTO>>(`${API_BASE_URL}?${params.toString()}`);
  },
  get: (id: number) => axios.get<IncidentDTO>(`${API_BASE_URL}/${id}`),
  update: (id: number, data: Partial<IncidentDTO>, userId: string) => 
    axios.put<IncidentDTO>(`${API_BASE_URL}/${id}?userId=${userId}`, data),
  delete: (id: number) => axios.delete(`${API_BASE_URL}/${id}`),
  getTransitions: () => axios.get<Record<string, string[]>>(`${API_BASE_URL}/transitions`),
};
