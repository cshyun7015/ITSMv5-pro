import { http, HttpResponse, delay } from 'msw';

const BASE_URL = '/api/v1/auth';

export const authHandlers = [
  // Login
  http.post(`${BASE_URL}/login`, async ({ request }) => {
    const data = await request.json() as any;
    await delay(800);

    if (data.password === 'fail') {
      return new HttpResponse(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 });
    }

    // Mock response based on userId for persona testing
    if (data.userId === 'msp_admin') {
      return HttpResponse.json({
        userId: 'msp_admin',
        name: 'MSP 관리자',
        role: 'ROLE_ADMIN',
        companyId: 'MSP',
        companyName: 'MSP Organization',
        isSuperCompany: true
      });
    } else if (data.userId === 'cory_oper') {
      return HttpResponse.json({
        userId: 'cory_oper',
        name: '코리 운영자',
        role: 'ROLE_OPER',
        companyId: 'CORY-OP',
        companyName: 'Cory Operations',
        isSuperCompany: false
      });
    } else if (data.userId === 'client_user') {
      return HttpResponse.json({
        userId: 'client_user',
        name: '고객사 담당자',
        role: 'ROLE_USER',
        companyId: 'CLIENT-A',
        companyName: 'Customer Alpha',
        isSuperCompany: false
      });
    }

    // Default success
    return HttpResponse.json({
      userId: data.userId,
      name: 'Standard User',
      role: 'ROLE_USER',
      companyId: 'UNKNOWN',
      companyName: 'Unknown Company',
      isSuperCompany: false
    });
  }),

  // Signup
  http.post(`${BASE_URL}/signup`, async ({ request }) => {
    const data = await request.json() as any;
    await delay(1000);
    return HttpResponse.json({
      userId: data.userId,
      name: data.name,
      role: data.role || 'ROLE_USER',
      companyId: data.companyId,
      companyName: 'New Company',
      isSuperCompany: false
    });
  }),

  // Logout
  http.post(`${BASE_URL}/logout`, async () => {
    await delay(300);
    return new HttpResponse(null, { status: 200 });
  }),

  // Me
  http.get(`${BASE_URL}/me`, async () => {
    // Check for cookie simulation (simplified)
    return HttpResponse.json({
      userId: 'msp_admin',
      name: 'MSP 관리자 (Auto)',
      role: 'ROLE_ADMIN',
      companyId: 'MSP',
      companyName: 'MSP Organization',
      isSuperCompany: true
    });
  }),
];
