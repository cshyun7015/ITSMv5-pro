import { test, expect } from '@playwright/test';

/**
 * 표준 코드 관리(Common Code) E2E 테스트
 * - [표준화] frontend_test_standards.md 준수
 * - [시나리오] 한글 UI, Master-Detail 연동, 프리미엄 다이얼로그 확인
 */
test.describe('표준 코드 관리 (Renewal UI)', () => {
  
  test.beforeEach(async ({ page }) => {
    // 공통 코드 페이지 진입
    await page.goto('/common-code');
    // 페이지 로딩 대기
    await page.waitForSelector('h2:has-text("표준 코드 관리")');
  });

  test('초기 진입 시 한글 표준 UI 요소가 정상적으로 노출되어야 한다', async ({ page }) => {
    // 1. 헤더 타이틀 확인
    await expect(page.getByRole('heading', { name: '표준 코드 관리', exact: true })).toBeVisible();
    
    // 2. 주요 액션 버튼 확인
    await expect(page.getByRole('button', { name: '새 코드 그룹 추가' })).toBeVisible();
    
    // 3. 레프트 마스터 목록 확인 (그룹 목록)
    await expect(page.getByText('이벤트 유형')).toBeVisible();
    await expect(page.getByText('이벤트 심각도')).toBeVisible();
  });

  test('코드 그룹 선택 시 상세 내역이 활성화되어야 한다 (Master-Detail)', async ({ page }) => {
    // 1. 특정 그룹 클릭 (정확한 텍스트 매칭을 위해 locator 사용)
    await page.getByText('이벤트 유형').first().click();

    // 2. 상세 내역 타이틀(h3) 및 '아이템 추가' 버튼 노출 확인
    await expect(page.getByRole('heading', { name: '상세 코드 아이템' })).toBeVisible();
    await expect(page.getByRole('button', { name: '아이템 추가' })).toBeVisible();

    // 데이터 로드 확인 (NETWORK 코드 아이템)
    // 테이블 본문 내에서 텍스트 확인
    const tableBody = page.locator('tbody');
    await expect(tableBody.getByText('NETWORK').first()).toBeVisible();
  });

  test('아이템 삭제 시 표준 컨펌 다이얼로그가 작동해야 한다', async ({ page }) => {
    // 1. 데이터 로드
    await page.getByText('이벤트 유형').first().click();
    
    // 2. 특정 행(NETWORK) 찾기
    const networkRow = page.locator('tr').filter({ hasText: 'NETWORK' });
    await expect(networkRow).toBeVisible();
    
    // 3. 호버하여 삭제 아이콘 노출 및 클릭 (getByTitle 활용)
    await networkRow.hover();
    await networkRow.getByTitle('아이템 삭제').click();

    // 4. 표준 Confirm 다이얼로그(Portal) 노출 확인
    const modal = page.locator('.modal-content');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: '상세 코드 삭제' })).toBeVisible();
    await expect(modal.getByRole('button', { name: '확인' })).toBeVisible();
    
    // 5. 취소 버튼 클릭 시 다이얼로그가 닫혀야 함
    await modal.getByRole('button', { name: '취소' }).click();
    await expect(modal).not.toBeVisible();
  });

});
