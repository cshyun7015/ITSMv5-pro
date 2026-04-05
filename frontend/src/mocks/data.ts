import type { RequestDTO } from '../features/request/api/requestApi';

export const generateMockRequests = (count: number): RequestDTO[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    reqNumber: `REQ-${String(i + 1).padStart(4, '0')}`,
    title: `[Scenario] Service Request ${i + 1}`,
    description: `This is a generated description for mock request ${i + 1}.`,
    companyId: 'CUST_A',
    status: i % 5 === 0 ? 'NEW' : i % 3 === 0 ? 'CANCELLED' : 'IN_PROGRESS',
    priority: i % 4 === 0 ? 'P1' : 'P3',
    srTypeCode: 'SERVICE_REQUEST',
    srCategoryCode: 'CAT_01',
    srImpactCode: 'MEDIUM',
    srUrgencyCode: 'MEDIUM',
    requesterId: 'user_a1',
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    updatedAt: new Date().toISOString()
  }));
};

export const defaultMockData = generateMockRequests(10);
export const hugeMockData = generateMockRequests(200);
