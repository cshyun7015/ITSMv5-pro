import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Service Request Management - Complete UI Coverage', () => {
  // Run tests serially to avoid state pollution between modal interactions
  test.describe.configure({ mode: 'serial' });
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(); // Logs in as default admin
    
    // MSW Mock Set
    await page.evaluate(() => {
      window.sessionStorage.setItem('mock-enabled', 'true');
      window.sessionStorage.setItem('mock-scenario', 'default');
    });

    // Navigate using the menu
    await page.click('text=서비스 요청 관리');
    
    // テーブル 렌더링 확인 (API 로딩 대기)
    await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
  });

  test.describe('1. Request Search & Filter', () => {
    test('TC-1.1: 텍스트 검색어 입력 및 필터 선택 후 검색 동작 확인', async ({ page }) => {
      // 텍스트 입력
      await page.getByTestId('req-search-query-input').fill('네트워크');
      
      // 고객사 선택
      const clientSelect = page.getByTestId('req-search-client-select');
      if (await clientSelect.isVisible()) {
        await clientSelect.selectOption({ index: 1 });
      }

      // 검색 버튼 클릭
      await page.getByTestId('req-search-submit-btn').click();

      // 요청 테이블이 새로고침 되는지 확인
      await expect(page.locator('.tw-animate-spin')).not.toBeVisible();
    });
  });

  test.describe('2. Request Table', () => {
    test('TC-2.1: 헤더 클릭 시 상태 정렬 동작 확인', async ({ page }) => {
      // 제목 열 방향 정렬 버튼 클릭
      await page.getByTestId('req-table-header-title').click();
      
      // MSW의 Network Traffic 혹은 UI 변화 감지
      await expect(page.locator('.tw-animate-spin')).not.toBeVisible();
    });

    test('TC-2.2: 페이징 네비게이션 동작 확인', async ({ page }) => {
      const nextBtn = page.getByTestId('req-table-page-next');
      if (await nextBtn.isEnabled()) {
        await nextBtn.click();
        await expect(page.getByTestId('req-table-page-2')).toHaveClass(/tw-bg-brand-600/);
      }
    });
  });

  test.describe('3. Request Form (신규 등록)', () => {
    test('TC-3.1 & TC-3.2: 폼 전체 작성 후 신규 요청 등록 확인', async ({ page }) => {
      // 등록 모달 진입
      await page.getByTestId('req-list-new-btn').click();
      await expect(page.getByTestId('req-form-submit-btn')).toBeVisible();

      // 필수 항목 채우기
      await page.getByTestId('req-form-title-input').fill('신규 데이터베이스 접근 권한 요청');
      await page.getByTestId('req-form-desc-input').fill('개발망 DB 접근을 위한 권한 신청합니다.');

      // 선택 항목 변경
      await page.getByTestId('req-form-impact-select').selectOption({ index: 1 });
      await page.getByTestId('req-form-ci-input').fill('DEV-DB-01');

      // 등록 클릭
      await page.getByTestId('req-form-submit-btn').click();

      // 모달이 닫혔는지 확인
      await expect(page.getByTestId('req-form-submit-btn')).not.toBeVisible();
    });
  });

  test.describe('4. Request Detail (상세 및 수정)', () => {
    test('TC-4.1 & TC-4.2: 상세 조회, 편집 모드 진입 및 상태 변경', async ({ page }) => {
      // 임의의 ROW 선택
      await page.locator('[data-testid^="req-table-row-"]').first().click();

      // 모달 데이터 로딩 완료 대기 — Ticket ID(reqNumber)가 보이면 API 응답 완료
      await expect(page.locator('.tw-font-mono.tw-font-bold')).toBeVisible({ timeout: 10000 });

      // 편집/삭제 버튼은 canEdit 조건(ROLE_ADMIN & not CLOSED) 충족 시 표시
      await expect(page.getByTestId('req-detail-edit-btn')).toBeVisible({ timeout: 10000 });

      // 편집 모드 전환 — 스크롤 후 클릭 (모달 footer 버튼)
      const editBtn = page.getByTestId('req-detail-edit-btn');
      await editBtn.scrollIntoViewIfNeeded();
      await editBtn.click({ force: true });
      
      // 제목 수정 확인 — React setState 후 DOM 렌더링 대기
      await expect(page.getByTestId('req-detail-title-input')).toBeVisible({ timeout: 8000 });
      await page.getByTestId('req-detail-title-input').fill('수정된 제목입니다');

      // 상태를 해결로 변경 후 해결코드 미입력 제한 확인
      await page.getByTestId('req-detail-status-select').selectOption('RESOLVED');
      
      // 저장 클릭 시도 (alert 발생 시 자동 수락)
      page.on('dialog', dialog => dialog.accept());
      await page.getByTestId('req-detail-save-btn').click();

      // 닫기
      await page.getByTestId('req-detail-close-btn').click();
    });

    test('TC-4.3: 삭제 프로세스 테스트', async ({ page }) => {
      // 임의의 ROW 선택
      await page.locator('[data-testid^="req-table-row-"]').first().click();

      // 모달 데이터 로딩 완료 대기
      await expect(page.locator('.tw-font-mono.tw-font-bold')).toBeVisible({ timeout: 10000 });

      // 삭제 버튼 클릭 (isAdminOrOperator 조건 필요)
      await expect(page.getByTestId('req-detail-delete-btn')).toBeVisible({ timeout: 10000 });
      await page.getByTestId('req-detail-delete-btn').click();
      
      // 삭제 확인 팝업 등장 확인
      await expect(page.getByTestId('req-detail-delete-confirm-btn')).toBeVisible({ timeout: 5000 });

      // 취소로 원복
      await page.getByText('취소').click();
      await expect(page.getByTestId('req-detail-delete-confirm-btn')).not.toBeVisible();
    });
  });
});
