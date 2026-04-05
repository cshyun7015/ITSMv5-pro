import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { IncidentPage } from '../pages/IncidentPage';

test.describe('인시던트 관리 라이프사이클 E2E', () => {
    
    test('인시던트 생성 및 상태 전이 (신규 -> 배정 -> 처리중 -> 조치완료 -> 해결종료) 테스트', async ({ page }) => {
        test.setTimeout(120000); // 2 minutes

        const loginPage = new LoginPage(page);
        const incidentPage = new IncidentPage(page);

        // 1. 로그인 (운영자 계정으로 로그인)
        await loginPage.goto();
        await loginPage.login('operator1', 'password123');
        
        // 2. 인시던트 관리 메뉴로 이동
        await incidentPage.navigateToIncidentList();
        
        const incidentTitle = `E2E 테스트 네트워크 장애 ${Date.now()}`;
        console.log(`인시던트 생성 중: ${incidentTitle}`);
        await incidentPage.openCreateModal();
        await incidentPage.fillIncidentForm(
            incidentTitle, 
            'Playwright 자동화 테스트를 통한 네트워크 단절 상황 재현 및 워크플로우 검증'
        );
        
        // 4. 리스트에서 생성 확인 및 상세 열기
        await incidentPage.selectFirstIncident(incidentTitle);
        
        // 5. 상태 전이: 신규 -> 배정됨
        console.log('상태 변경: 배정됨');
        await incidentPage.changeStatus('운영자 배정 및 승인', '배정 (담당자 지정됨)');
        
        // 6. 상태 전이: 배정됨 -> 처리 중
        console.log('상태 변경: 처리 중');
        await incidentPage.changeStatus('조치 시작', '처리 중 (작업 진행)');
        
        // 7. 상태 전이: 처리 중 -> 조치 완료 (해결 정보 입력 포함)
        console.log('상태 변경: 조치 완료');
        await incidentPage.changeStatus('조치 완료 및 해결', '조치 완료 (복구됨)');
        
        // 해결 정보 입력을 위해 수정 모달 열기
        await incidentPage.fillResolutionInfo('영구 해결 (Fixed)', '임시 조치로 네트워크 서비스 복구 완료');
        
        // 8. 상태 전이: 조치 완료 -> 해결 종료
        console.log('상태 변경: 해결 종료');
        await incidentPage.changeStatus('최종 종료 처리');
        
        // 최종 확인
        await incidentPage.verifyStatusInList(incidentTitle, '최종 종료 (아카이브됨)');
        
        console.log('인시던트 라이프사이클 E2E 테스트 성공!');
    });

    test('인시던트 보류 및 복귀 테스트', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const incidentPage = new IncidentPage(page);

        await loginPage.goto();
        await loginPage.login('operator1', 'password123');
        await incidentPage.navigateToIncidentList();
        
        // 인시던트 생성
        const incidentTitle = `보류 테스트용 ${Date.now()}`;
        await incidentPage.openCreateModal();
        await incidentPage.fillIncidentForm(incidentTitle, '고객 확인 대기 상황을 시뮬레이션합니다.');
        
        await incidentPage.selectFirstIncident(incidentTitle);
        
        // 신규 -> 배정됨 -> 처리 중
        await incidentPage.changeStatus('운영자 배정 및 승인', '배정 (담당자 지정됨)');
        await incidentPage.changeStatus('조치 시작', '처리 중 (작업 진행)');
        
        // 처리 중 -> 보류됨
        console.log('상태 변경: 보류됨');
        await incidentPage.changeStatus('일시 중단 (Hold)', '보류 (외부 대기 중)');
        await incidentPage.verifyStatusInList(incidentTitle, '보류 (외부 대기 중)');
        
        // 보류됨 -> 처리 중 (복귀)
        console.log('상태 변경: 처리 중 (복귀)');
        await incidentPage.changeStatus('조치 시작', '처리 중 (작업 진행)');
        await incidentPage.verifyStatusInList(incidentTitle, '처리 중 (작업 진행)');
        
        console.log('인시던트 보류/복귀 E2E 테스트 성공!');
    });
});
