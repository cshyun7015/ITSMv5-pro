import { http, HttpResponse, delay, passthrough } from 'msw';
import { defaultMockData, hugeMockData, defaultIncidents, hugeIncidents } from './data';

const API_BASE = '/api/v1/request';

// Static mock users for E2E test login bypass
const MOCK_USERS: Record<string, { userId: string; name: string; role: string; companyId: string; companyName: string }> = {
  'admin':     { userId: 'admin',     name: 'System Admin',  role: 'ROLE_ADMIN', companyId: 'MSP', companyName: 'MSP Co.' },
  'operator1': { userId: 'operator1', name: 'Operator One',  role: 'ROLE_OPER',  companyId: 'MSP', companyName: 'MSP Co.' },
  'user1':     { userId: 'user1',     name: 'Customer User', role: 'ROLE_USER',   companyId: 'CUS-001', companyName: 'Client Corp.' },
};

// Stateful mock storage for incidents during the test session
let sessionIncidents = [...defaultIncidents];

export const handlers = [
  // ── Auth Endpoints ──────────────────────────────────────────────────────────
  http.post('/api/v1/auth/login', async ({ request }) => {
    const scenario = sessionStorage.getItem('mock-scenario') || 'default';
    if (scenario === 'real') return passthrough();
    const body = await request.json() as any;
    const user = MOCK_USERS[body?.userId];
    if (user) return HttpResponse.json(user, { status: 200 });
    return new HttpResponse(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 });
  }),

  http.post('/api/v1/auth/logout', () => new HttpResponse(null, { status: 204 })),

  // ── Dashboard & Company Endpoints ───────────────────────────────────────────
  http.get('/api/v1/dashboard/summary', () => {
    return HttpResponse.json({
      totalRequests: 120,
      createdToday: 5,
      closedToday: 3,
      companyCount: 10,
      userCount: 45,
      statusDistribution: { NEW: 40, IN_PROGRESS: 30, RESOLVED: 50 },
      priorityDistribution: { P1: 5, P2: 15, P3: 80, P4: 20 }
    });
  }),
  
  http.get('/api/v1/company', () => {
    return HttpResponse.json({
      content: [
        { id: 1, companyId: 'MSP', name: 'MSP Co.' },
        { id: 2, companyId: 'CUS-001', name: 'Client Corp.' }
      ]
    });
  }),

  http.get('/api/v1/customer-governance/companies', () => {
    return HttpResponse.json([
      { id: 1, customerId: 'CUST_A', name: 'Customer Company A', status: 'ACTIVE' },
      { id: 2, customerId: 'CUST_B', name: 'Customer Company B', status: 'ACTIVE' }
    ]);
  }),

  http.get('/api/v1/organization/operators/companies', () => {
    return HttpResponse.json([
      { id: 1, operatorCompanyId: 'MSP_X', name: 'Operator MSP X', status: 'ACTIVE' },
      { id: 2, operatorCompanyId: 'MSP_Y', name: 'Operator MSP Y', status: 'ACTIVE' }
    ]);
  }),

  // ── Request Endpoints ────────────────────────────────────────────────────────
  http.get(API_BASE, async () => {
    const scenario = sessionStorage.getItem('mock-scenario') || 'default';
    if (scenario === 'real') return passthrough();
    if (scenario === 'delay') await delay(3000);
    if (scenario === 'error') return new HttpResponse(null, { status: 500 });
    if (scenario === 'empty') return HttpResponse.json({ content: [], totalPages: 0 });
    if (scenario === 'huge') return HttpResponse.json({ content: hugeMockData, totalPages: 20 });
    return HttpResponse.json({ content: defaultMockData, totalPages: 1 });
  }),

  http.get(`${API_BASE}/:id`, async ({ params }) => {
    const { id } = params;
    const req = [...defaultMockData, ...hugeMockData].find(r => r.id === Number(id));
    if (!req) return HttpResponse.json({ ...defaultMockData[0], id: Number(id) });
    return HttpResponse.json(req);
  }),

  http.put(`${API_BASE}/:id`, async ({ params, request }) => {
    const { id } = params;
    const data = await request.json() as any;
    return HttpResponse.json({ ...data, id: Number(id), updatedAt: new Date().toISOString() });
  }),

  // ── Incident Endpoints ───────────────────────────────────────────────────────
  http.get('/api/v1/incident', async ({ request }) => {
    const url = new URL(request.url);
    const scenario = sessionStorage.getItem('mock-scenario') || 'default';
    
    if (scenario === 'real') return passthrough();
    if (scenario === 'delay') await delay(5000);
    if (scenario === 'error') return new HttpResponse(null, { status: 500 });
    if (scenario === 'empty') return HttpResponse.json({ content: [], totalElements: 0, totalPages: 0 });
    
    const size = parseInt(url.searchParams.get('size') || '10');
    const page = parseInt(url.searchParams.get('page') || '0');
    
    const dataSet = scenario === 'huge' ? hugeIncidents : sessionIncidents;
    const start = page * size;
    const end = start + size;
    const pagedData = dataSet.slice(start, end);
    
    return HttpResponse.json({ 
      content: pagedData, 
      totalElements: dataSet.length,
      totalPages: Math.ceil(dataSet.length / size)
    });
  }),

  http.post('/api/v1/incident', async ({ request }) => {
    const scenario = sessionStorage.getItem('mock-scenario') || 'default';
    if (scenario === 'real') return passthrough();
    const data = await request.json() as any;
    const newIncident = { 
      ...data, 
      id: Date.now(), 
      incidentId: `INC-${Math.floor(Math.random() * 9000) + 1000}`,
      createdAt: new Date().toISOString()
    };
    sessionIncidents = [newIncident, ...sessionIncidents];
    return HttpResponse.json(newIncident, { status: 201 });
  }),

  http.put('/api/v1/incident/:id', async ({ request, params }) => {
    const scenario = sessionStorage.getItem('mock-scenario') || 'default';
    if (scenario === 'real') return passthrough();
    const data = await request.json() as any;
    const index = sessionIncidents.findIndex(i => i.id === Number(params.id));
    if (index !== -1) {
      sessionIncidents[index] = { ...sessionIncidents[index], ...data };
    }
    return HttpResponse.json({ ...data, id: Number(params.id) });
  }),

  http.delete('/api/v1/incident/:id', async ({ params }) => {
    sessionIncidents = sessionIncidents.filter(i => i.id !== Number(params.id));
    return new HttpResponse(null, { status: 204 });
  }),
];
