import { http, HttpResponse, delay, passthrough } from 'msw';
import { defaultMockData, hugeMockData } from './data';

const API_BASE = '/api/v1/request';

export const handlers = [
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

  // Get Single Request
  http.get(`${API_BASE}/:id`, async ({ params }) => {
    const { id } = params;
    const scenario = sessionStorage.getItem('mock-scenario') || 'default';

    if (scenario === 'error') {
        return new HttpResponse(null, { status: 500 });
    }

    const request = [...defaultMockData, ...hugeMockData].find(r => r.id === Number(id));
    
    if (!request) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(request);
  }),

  // Get Comments
  http.get(`${API_BASE}/:id/comments`, async () => {
    return HttpResponse.json([]);
  }),

  // Add Comment
  http.post(`${API_BASE}/:id/comments`, async ({ request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({ ...data, id: Date.now() }, { status: 201 });
  }),

  // Update Request (Status change, etc.)
  http.put(`${API_BASE}/:id`, async ({ params, request }) => {
    const { id } = params;
    const data = await request.json() as any;
    return HttpResponse.json({ ...data, id: Number(id), updatedAt: new Date().toISOString() });
  }),
];
