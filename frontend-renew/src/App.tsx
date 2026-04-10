import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainLayout from './core/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

import { IncidentList } from './features/incident';
import { CommonCodePage } from './features/common-code';
import { CustomerPage } from './features/customer/customer';
import { OperatorPage } from './features/operator/components/OperatorPage';

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
 * - ProtectedRoute를 통한 인증 보안 강화
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
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Private Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Navigate to="/incident" replace />} />
                
                {/* 각 MFE 피처 라우팅 */}
                <Route path="incident" element={<IncidentList />} />
                <Route path="common-code" element={<CommonCodePage />} />
                <Route path="customer" element={<CustomerPage />} />
                <Route path="operator" element={<OperatorPage />} />
                
                {/* 미구현 페이지 플레이스홀더 */}
                <Route path="*" element={
                  <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                    <h2 className="text-4xl font-black text-white/10 uppercase tracking-widest">Coming Soon</h2>
                    <p className="text-sm text-text-muted italic">본 페이지는 해당 마이크로 서비스 모듈 개발 중입니다.</p>
                  </div>
                } />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
