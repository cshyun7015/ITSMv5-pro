import { lazy } from 'react';

/**
 * 고객 조직 관리 피처 엔트리 가이드 (MFE Module)
 * - 고객사, 팀, 사용자 중심의 계층형 관리 대시보드
 */
export const CustomerPage = lazy(() => import('./components/CustomerPage'));
