import { lazy } from 'react';

/**
 * 인시던트 관리 피처 엔트리 가이드
 * - Lazy Loading을 통한 MFE 독립적 배포 지원
 */
export const IncidentList = lazy(() => import('./IncidentList'));

// 향후 여기에 상세 페이지 등을 추가합니다.
// export const IncidentDetail = lazy(() => import('./IncidentDetail'));
