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
  mspId?: string;
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
  list: (params: {
    tenantId?: string;
    mspId?: string;
    assignmentGroupId?: string;
    startDate?: string;
    endDate?: string;
    status?: string[];
    page?: number;
    size?: number;
  }) => {
    const query = new URLSearchParams();
    if (params.tenantId) query.append('tenantId', params.tenantId);
    if (params.mspId) query.append('mspId', params.mspId);
    if (params.assignmentGroupId) query.append('assignmentGroupId', params.assignmentGroupId);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    
    if (params.status && params.status.length > 0) {
      params.status.forEach(s => query.append('status', s));
    }
    query.append('page', (params.page || 0).toString());
    query.append('size', (params.size || 10).toString());
    return axios.get<PaginatedResponse<IncidentDTO>>(`${API_BASE_URL}?${query.toString()}`);
  },
  get: (id: number) => axios.get<IncidentDTO>(`${API_BASE_URL}/${id}`),
  update: (id: number, data: Partial<IncidentDTO>, userId: string) => 
    axios.put<IncidentDTO>(`${API_BASE_URL}/${id}?userId=${userId}`, data),
  delete: (id: number) => axios.delete(`${API_BASE_URL}/${id}`),
  getTransitions: () => axios.get<Record<string, string[]>>(`${API_BASE_URL}/transitions`),
};
