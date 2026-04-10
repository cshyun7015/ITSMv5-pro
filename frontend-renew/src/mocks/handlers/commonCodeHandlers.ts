import { http, HttpResponse, delay } from 'msw';
import { CodeGroup, CommonCode } from '../../features/common-code/types/CommonCodeTypes';

const BASE_URL = '/api/v1/system/codes';

// --- Mock Data ---
const mockGroups: CodeGroup[] = [
  { groupId: 'SR_STATUS', name: '요청 상태', description: '서비스 요청 처리 상태', isSystem: true, createdAt: new Date().toISOString() },
  { groupId: 'SR_PRIORITY', name: '우선순위', description: '요청 긴급 및 영향도에 따른 우선순위', isSystem: true, createdAt: new Date().toISOString() },
  { groupId: 'SR_TYPE', name: '요청 유형', description: '서비스 데스크 요청 분류', isSystem: true, createdAt: new Date().toISOString() },
  { groupId: 'OPE_ROLE', name: '운영자 역할', description: '운영 인력 권한 등급', isSystem: true, createdAt: new Date().toISOString() },
];

const mockItems: Record<string, CommonCode[]> = {
  'SR_STATUS': [
    { id: 1, groupId: 'SR_STATUS', codeId: 'OPEN', codeName: '신규', sortOrder: 10, isActive: true },
    { id: 2, groupId: 'SR_STATUS', codeId: 'IN_PROGRESS', codeName: '처리중', sortOrder: 20, isActive: true },
    { id: 3, groupId: 'SR_STATUS', codeId: 'RESOLVED', codeName: '해결됨', sortOrder: 30, isActive: true },
    { id: 4, groupId: 'SR_STATUS', codeId: 'CLOSED', codeName: '종료', sortOrder: 40, isActive: true },
  ],
  'SR_PRIORITY': [
    { id: 11, groupId: 'SR_PRIORITY', codeId: 'P1', codeName: 'Critical (P1)', sortOrder: 10, isActive: true },
    { id: 12, groupId: 'SR_PRIORITY', codeId: 'P2', codeName: 'High (P2)', sortOrder: 20, isActive: true },
    { id: 13, groupId: 'SR_PRIORITY', codeId: 'P3', codeName: 'Medium (P3)', sortOrder: 30, isActive: true },
    { id: 14, groupId: 'SR_PRIORITY', codeId: 'P4', codeName: 'Low (P4)', sortOrder: 40, isActive: true },
  ],
  'SR_TYPE': [
    { id: 21, groupId: 'SR_TYPE', codeId: 'INCIDENT', codeName: '장애', sortOrder: 10, isActive: true },
    { id: 22, groupId: 'SR_TYPE', codeId: 'SERVICE_REQUEST', codeName: '서비스 요청', sortOrder: 20, isActive: true },
    { id: 23, groupId: 'SR_TYPE', codeId: 'INQUIRY', codeName: '기술 문의', sortOrder: 30, isActive: true },
  ],
  'OPE_ROLE': [
    { id: 31, groupId: 'OPE_ROLE', codeId: 'ROLE_ADMIN', codeName: '관리자', sortOrder: 10, isActive: true },
    { id: 32, groupId: 'OPE_ROLE', codeId: 'ROLE_OPER', codeName: '운영자', sortOrder: 20, isActive: true },
  ]
};

export const commonCodeHandlers = [
  // Fetch Groups
  http.get(`${BASE_URL}/groups`, async () => {
    await delay(500);
    return HttpResponse.json({
      status: 'success',
      data: mockGroups
    });
  }),

  // Fetch Items by Group
  http.get(`${BASE_URL}/groups/:groupId/items`, async ({ params }) => {
    const { groupId } = params;
    await delay(300);
    return HttpResponse.json({
      status: 'success',
      data: mockItems[groupId as string] || []
    });
  }),

  // Create/Update Placeholders
  http.post(`${BASE_URL}/groups`, async ({ request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({ status: 'success', data: { ...data, createdAt: new Date().toISOString() } });
  }),

  http.post(`${BASE_URL}/items`, async ({ request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({ status: 'success', data: { ...data, id: Math.floor(Math.random() * 1000) } });
  })
];
