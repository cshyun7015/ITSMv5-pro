import { http, HttpResponse, delay } from 'msw';
import { Operator, OperatorCompany, OperatorTeam } from '../../features/operator/types/operatorType';

const BASE_URL = '/api/v1/operator';

// Mock Data
const mockCompanies: OperatorCompany[] = [
  { id: 1, operatorCompanyId: 'MSP', name: 'MSP (Mock)', status: 'ACTIVE' },
  { id: 2, operatorCompanyId: 'CORY-OP', name: 'Cory Operations', status: 'ACTIVE' },
];

const mockTeams: Record<number, OperatorTeam[]> = {
  1: [
    { id: 101, operatorCompanyId: 1, name: 'MSP Core Team', status: 'ACTIVE' },
    { id: 102, operatorCompanyId: 1, name: 'MSP Support', status: 'ACTIVE' },
  ],
  2: [
    { id: 201, operatorCompanyId: 2, name: 'Level 1 Support', status: 'ACTIVE' },
  ],
};

const mockOperators: Record<number, Operator[]> = {
  101: [
    { id: 1001, userId: 'msp_admin', name: 'MSP Admin', role: 'ROLE_ADMIN', isActive: true, operatorTeamId: 101, isDeleted: 0 },
  ],
  102: [
    { id: 1002, userId: 'msp_helper', name: 'MSP Helper', role: 'ROLE_OPER', isActive: true, operatorTeamId: 102, isDeleted: 0 },
  ],
  201: [
    { id: 2001, userId: 'cory_oper', name: 'Cory Operator', role: 'ROLE_OPER', isActive: true, operatorTeamId: 201, isDeleted: 0 },
  ],
};

export const operatorHandlers = [
  // Fetch Companies
  http.get(`${BASE_URL}/companies`, async () => {
    await delay(500);
    return HttpResponse.json({ 
      status: 'success',
      data: mockCompanies 
    });
  }),

  // Fetch Teams by Company
  http.get(`${BASE_URL}/companies/:companyId/teams`, async ({ params }) => {
    const companyId = Number(params.companyId);
    await delay(300);
    return HttpResponse.json({ 
      status: 'success',
      data: mockTeams[companyId] || [] 
    });
  }),

  // Fetch Operators by Team
  http.get(`${BASE_URL}/teams/:teamId/operators`, async ({ params }) => {
    const teamId = Number(params.teamId);
    await delay(300);
    return HttpResponse.json({ data: mockOperators[teamId] || [] });
  }),

  // Fetch Operator Detail
  http.get(`${BASE_URL}/operators/:id`, async ({ params }) => {
    const id = Number(params.id);
    const operator = Object.values(mockOperators).flat().find(o => o.id === id);
    if (!operator) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ data: operator });
  }),

  // Create Operator
  http.post(`${BASE_URL}/teams/:teamId/operators`, async ({ request }) => {
    const data = await request.json() as any;
    if (!data.userId || !data.password) {
      return new HttpResponse(JSON.stringify({ message: 'Validation failed' }), { status: 400 });
    }
    return HttpResponse.json({ data: { ...data, id: Math.floor(Math.random() * 10000) } }, { status: 201 });
  }),

  // Delete Operator
  http.delete(`${BASE_URL}/operators/:id`, async ({ params, request }) => {
    const url = new URL(request.url);
    const hardDelete = url.searchParams.get('hardDelete') === 'true';
    console.log(`[MSW] Deleting operator ${params.id}, hardDelete: ${hardDelete}`);
    return new HttpResponse(null, { status: 204 });
  }),
];
