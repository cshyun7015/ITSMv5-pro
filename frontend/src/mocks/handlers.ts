import { http, HttpResponse, delay, passthrough } from 'msw';
import { defaultMockData, hugeMockData } from './data';

const API_BASE = '/api/v1/request';

// Static mock users for E2E test login bypass
const MOCK_USERS: Record<string, { userId: string; name: string; role: string; companyId: string; companyName: string }> = {
  'admin':     { userId: 'admin',     name: 'System Admin',  role: 'ROLE_ADMIN', companyId: 'MSP', companyName: 'MSP Co.' },
  'operator1': { userId: 'operator1', name: 'Operator One',  role: 'ROLE_OPER',  companyId: 'MSP', companyName: 'MSP Co.' },
  'user1':     { userId: 'user1',     name: 'Customer User', role: 'ROLE_USER',   companyId: 'CUS-001', companyName: 'Client Corp.' },
};

export const handlers = [
  // ── Auth Endpoints ──────────────────────────────────────────────────────────
  // POST /api/v1/auth/login — always succeeds if userId is in MOCK_USERS
  http.post('/api/v1/auth/login', async ({ request }) => {
    const scenario = sessionStorage.getItem('mock-scenario') || 'default';
    if (scenario === 'real') return passthrough();

    const body = await request.json() as any;
    const user = MOCK_USERS[body?.userId];
    if (user) {
      return HttpResponse.json(user, { status: 200 });
    }
    return new HttpResponse(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 });
  }),

  // POST /api/v1/auth/logout
  http.post('/api/v1/auth/logout', () => new HttpResponse(null, { status: 204 })),

  // ── Request Endpoints ────────────────────────────────────────────────────────
  // List Requests
  http.get(API_BASE, async () => {
    const scenario = sessionStorage.getItem('mock-scenario') || 'default';
    
    // REAL scenario
    if (scenario === 'real') {
        return passthrough();
    }
    // DELAY scenario
    if (scenario === 'delay') {
      await delay(3000);
    }

    // ERROR scenario
    if (scenario === 'error') {
      return new HttpResponse(null, { status: 500 });
    }

    // EMPTY scenario
    if (scenario === 'empty') {
      return HttpResponse.json({ content: [], totalPages: 0 });
    }

    // HUGE scenario
    if (scenario === 'huge') {
      return HttpResponse.json({ content: hugeMockData, totalPages: 20 });
    }

    // DEFAULT scenario
    return HttpResponse.json({ content: defaultMockData, totalPages: 1 });
  }),

  // ── Sub-resource handlers (MUST be registered before /:id wildcard) ─────────

  // Get History — returns a realistic audit trail
  http.get(`${API_BASE}/:id/history`, async ({ params }) => {
    const scenario = sessionStorage.getItem('mock-scenario') || 'default';
    if (scenario === 'real') return passthrough();
    if (scenario === 'error') return new HttpResponse(null, { status: 500 });

    const { id } = params;
    const now = new Date();
    const mockHistory = [
      {
        id: 1,
        requestId: Number(id),
        changedBy: 'admin',
        fieldName: 'status',
        oldValue: null,
        newValue: 'NEW',
        changedAt: new Date(now.getTime() - 3600000 * 3).toISOString(),
        remark: '요청 최초 등록'
      },
      {
        id: 2,
        requestId: Number(id),
        changedBy: 'operator1',
        fieldName: 'status',
        oldValue: 'NEW',
        newValue: 'IN_PROGRESS',
        changedAt: new Date(now.getTime() - 3600000 * 2).toISOString(),
        remark: '처리 시작'
      },
      {
        id: 3,
        requestId: Number(id),
        changedBy: 'operator1',
        fieldName: 'assigneeId',
        oldValue: null,
        newValue: 'operator1',
        changedAt: new Date(now.getTime() - 3600000).toISOString(),
        remark: '담당자 배정'
      },
    ];
    return HttpResponse.json(mockHistory);
  }),

  // Get Comments
  http.get(`${API_BASE}/:id/comments`, async () => {
    return HttpResponse.json([]);
  }),

  // Get Attachments
  http.get(`${API_BASE}/:id/attachments`, async () => {
    return HttpResponse.json([]);
  }),

  // Add Comment
  http.post(`${API_BASE}/:id/comments`, async ({ request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({ ...data, id: Date.now() }, { status: 201 });
  }),

  // ── Single Request (MUST be after sub-resource handlers) ─────────────────────

  // Get Single Request
  http.get(`${API_BASE}/:id`, async ({ params }) => {
    const { id } = params;
    const scenario = sessionStorage.getItem('mock-scenario') || 'default';

    if (scenario === 'error') {
        return new HttpResponse(null, { status: 500 });
    }
    if (scenario === 'real') return passthrough();

    const req = [...defaultMockData, ...hugeMockData].find(r => r.id === Number(id));
    
    if (!req) {
      // Return first mock item as fallback to avoid display errors
      return HttpResponse.json({ ...defaultMockData[0], id: Number(id) });
    }

    return HttpResponse.json(req);
  }),

  // Update Request (Status change, etc.)
  http.put(`${API_BASE}/:id`, async ({ params, request }) => {
    const { id } = params;
    const data = await request.json() as any;
    return HttpResponse.json({ ...data, id: Number(id), updatedAt: new Date().toISOString() });
  }),

  // Delete Request
  http.delete(`${API_BASE}/:id`, async () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
