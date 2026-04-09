import { test, expect } from '@playwright/test';

/**
 * 고객 관리 (Customer Management) E2E 테스트
 * - [표준화] co-location 패턴 적용 (src/features/customer/tests)
 * - [시나리오] 한글 UI, 마스터-디테일 레이아웃, 리팩토링된 경로(/customer) 검증
 */
test.describe('고객 관리 피처 리팩토링 검증', () => {

  test.beforeEach(async ({ page }) => {
    // 1. 세션 주입 (로그인 미구현 대응)
    // Zustand persist storage와 X-Tenant-ID를 직접 설정합니다.
    await page.addInitScript(() => {
      const authState = {
        state: {
          user: { id: 'admin', name: 'Mock Admin' },
          tenantId: 'SYSTEM',
          isLoggedIn: true
        },
        version: 0
      };
      window.localStorage.setItem('itsm-v5-auth-storage', JSON.stringify(authState));
      window.localStorage.setItem('X-Tenant-ID', 'SYSTEM');
      window.sessionStorage.setItem('mock-enabled', 'true');
      window.sessionStorage.setItem('mock-scenario', 'default');
    });

    // 2. 관리 페이지 직접 이동
    await page.goto('/customer');
    
    // 3. 페이지 로딩 대기 (헤더 확인)
    await page.waitForSelector('h2:has-text("고객 조직 관리")', { timeout: 15000 });
  });

  test('피처 메인 레이아웃 및 한글 레이블이 정상적으로 렌더링되어야 한다', async ({ page }) => {
    // 1. 헤더 타이틀 및 설명 확인
    await expect(page.locator('h2:has-text("고객 조직 관리")')).toBeVisible();
    await expect(page.locator('text=고객 유효 테넌트 전반의 조직 계층 구조')).toBeVisible();

    // 2. 주요 액션 버튼 확인
    await expect(page.locator('button:has-text("신규 고객사 등록")')).toBeVisible();
    await expect(page.locator('button:has-text("데이터 내보내기")')).toBeVisible();

    // 3. 400px 마스터 가변 레이아웃 (조직 트리) 영역 확인
    const treeMaster = page.locator('h3:has-text("Organization Tree")');
    await expect(treeMaster).toBeVisible();
  });

  test('조직 트리와 디테일 영역이 분할되어 표시되어야 한다 (Master-Detail)', async ({ page }) => {
    // 트리 영역 (400px 고정) 존재 확인
    const treeArea = page.locator('div.w-\\[400px\\]');
    await expect(treeArea).toBeVisible();

    // 디테일 영역 (가변) 존재 확인
    const detailArea = page.locator('div.flex-1.bg-background-secondary\\/30');
    await expect(detailArea).toBeVisible();
    
    // 초기 디테일 메시지 확인 (선택된 노드 없을 때)
    await expect(page.locator('text=조직을 선택하여 상세 정보를 확인하세요')).toBeVisible();
  });

});
