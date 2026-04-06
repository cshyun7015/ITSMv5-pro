import type { RequestDTO } from '../features/request/api/requestApi';

export const generateMockRequests = (count: number): RequestDTO[] => {
  const statuses = ['NEW', 'IN_PROGRESS', 'IN_PROGRESS', 'NEW', 'PENDING'];
  const baseDate = new Date('2026-04-05T00:00:00Z').getTime();
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    reqNumber: `REQ-${String(i + 1).padStart(4, '0')}`,
    title: `[Scenario] Service Request ${i + 1}`,
    description: `This is a generated description for mock request ${i + 1}.`,
    companyId: 'CUST_A',
    status: statuses[i % statuses.length],
    priority: i % 4 === 0 ? 'P1' : 'P3',
    srTypeCode: 'SERVICE_REQUEST',
    srCategoryCode: 'CAT_01',
    srImpactCode: 'MEDIUM',
    srUrgencyCode: 'MEDIUM',
    requesterId: 'user_a1',
    createdAt: new Date(baseDate - i * 3600000).toISOString(),
    updatedAt: new Date(baseDate).toISOString()
  }));
};

export const defaultMockData = generateMockRequests(10);
export const hugeMockData = generateMockRequests(200);

export const generateMockIncidents = (count: number): any[] => {
  const statuses = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED'];
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    incidentId: `INC-20260405-${String(i + 1).padStart(4, '0')}`,
    title: `[Mock] System Outage ${i + 1}`,
    description: `Detailed description for incident ${i + 1}`,
    tenantId: i % 2 === 0 ? 'CUSTOMER_A' : 'CUSTOMER_B',
    mspId: i % 3 === 0 ? 'MSP_X' : 'MSP_Y',
    status: statuses[i % statuses.length],
    priority: i % 5 === 0 ? 'P1' : 'P3',
    impact: 'HIGH',
    urgency: 'MEDIUM',
    isMajorIncident: i % 10 === 0,
    createdAt: new Date().toISOString(),
    slaDueDate: new Date(Date.now() + 86400000).toISOString()
  }));
};

export const defaultIncidents = generateMockIncidents(10);
export const hugeIncidents = generateMockIncidents(300);
