import axios from 'axios';

/**
 * ITSM v5 Premium API Client
 * - 테넌트 ID 자동 주입 인터셉터 포함
 * - 전역 에러 핸들링 및 세션 만료 UX 대응
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request 인터셉터: 테넌트 ID 주입
apiClient.interceptors.request.use(
  (config) => {
    // 로컬 스토리지나 Zustand 스토어에서 테넌트 ID를 가져옴
    const tenantId = localStorage.getItem('X-Tenant-ID') || 'T001';
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }
    
    // Auth 토큰 주입 (향구 구현 예정)
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response 인터셉터: 전역 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    
    if (status === 401) {
      // 세션 만료 시 로그인 페이지로 이동하거나 토스트 메시지 표시
      console.error('Session expired. Redirecting to login...');
    } else if (status === 403) {
      console.error('Access denied.');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
