import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainLayout from './core/layout/MainLayout';
import { IncidentList } from './features/incident';
import { CommonCodePage } from './features/common-code';

// TanStack Query 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * 인시던트 관리 MFE 쉘 (App Root)
 * - 전역 라우팅 및 독립 모듈 Lazy Loading 통합
 * - Skeleton UI를 통한 로딩 경험 최적화
 */
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={
          <div className="flex h-screen w-screen items-center justify-center bg-background-primary">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
          </div>
        }>
          <Routes>
            {/* 메인 레이아웃 적용 */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/incident" replace />} />
              
              {/* 각 MFE 피처 라우팅 */}
              <Route path="incident" element={<IncidentList />} />
              <Route path="common-code" element={<CommonCodePage />} />
              
              {/* 미구현 페이지 플레이스홀더 */}
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                  <h2 className="text-4xl font-black text-white/10 uppercase tracking-widest">Coming Soon</h2>
                  <p className="text-sm text-text-muted italic">본 페이지는 해당 마이크로 서비스 모듈 개발 중입니다.</p>
                </div>
              } />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
