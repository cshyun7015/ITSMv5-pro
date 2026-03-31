import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { login } from './common/auth.js';

// Load test data
const payloadTemplate = JSON.parse(open('../data/request-payload.json'));

export const options = {
  stages: [
    { duration: '30s', target: 5 }, // Warm up
    { duration: '1m', target: 10 }, // Load
    { duration: '30s', target: 0 }, // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% failure rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://api-gateway:80';

export default function () {
  let sessionId;
  let userInfo;

  // 1. LOGIN
  group('01_Login', function () {
    const auth = login(BASE_URL, 'user1', 'password123');
    if (auth) {
      sessionId = auth.cookie;
      userInfo = auth.user;
    }
  });

  if (!sessionId) {
    console.error('Session failed. Skipping lifecycle.');
    return;
  }

  const jar = http.cookieJar();
  jar.set(BASE_URL, 'ITSMSession', sessionId);

  let requestId;

  // 2. CREATE REQUEST
  group('02_Create_Request', function () {
    const url = `${BASE_URL}/api/v1/request`;
    const payload = JSON.stringify({
      ...payloadTemplate,
      title: `k6perf_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      companyId: userInfo.companyId,
      requesterId: userInfo.userId,
    });

    const res = http.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    const success = check(res, {
      'create success (201)': (r) => r.status === 201,
      'has id': (r) => r.json().id !== undefined,
    });

    if (success) {
      requestId = res.json().id;
    }
  });

  if (!requestId) return;

  sleep(1);

  // 3. INQUIRY (LIST)
  group('03_List_Requests', function () {
    const url = `${BASE_URL}/api/v1/request?size=10&page=0`;
    const res = http.get(url);

    check(res, {
      'list success (200)': (r) => r.status === 200,
    });
  });

  sleep(1);

  // 4. UPDATE (PROCESS)
  group('04_Update_Request', function () {
    const url = `${BASE_URL}/api/v1/request/${requestId}`;
    const updatePayload = JSON.stringify({
      ...payloadTemplate,
      status: 'IN_PROGRESS',
      description: 'Updated by k6 performance test processing phase.',
      companyId: userInfo.companyId,
      requesterId: userInfo.userId,
    });

    const res = http.put(url, updatePayload, {
      headers: { 'Content-Type': 'application/json' },
    });

    check(res, {
      'update success (200)': (r) => r.status === 200,
    });
  });

  sleep(1);

  // 5. DELETE
  group('05_Delete_Request', function () {
    const url = `${BASE_URL}/api/v1/request/${requestId}`;
    const res = http.del(url);

    check(res, {
      'delete success (204)': (r) => r.status === 204,
    });
  });

  sleep(1);
}
