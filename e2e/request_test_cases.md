# Service Request Management - UI Test Cases

다음은 소스 코드를 바탕으로 정리한 실제 서비스 요청 화면의 모든 버튼 및 입력 필드와, 이를 검증하는 테스트 시나리오입니다.

## 1. Request Search (검색 필터 영역)
- **Select**: 고객사(`req-search-client-select`), 운영사(`req-search-msp-select`)
- **Input (Date)**: 조회 시작일(`req-search-from-date`), 조회 종료일(`req-search-to-date`)
- **Input (Text)**: 검색어(`req-search-query-input`)
- **Button**: 검색 버튼(`req-search-submit-btn`)

### Test Cases
- TC-1.1: 텍스트 검색어 입력 및 필터 선택 후 '검색' 클릭 시 API 파라미터 연동 확인
- TC-1.2: 날짜 변경 이벤트 동작 확인

## 2. Request Table (목록 영역)
- **Button (Header Sort)**: 테이블 헤더(`req-table-header-{field}`)
- **Link/Button**: 목록 행 선택(`req-table-row-{id}`)
- **Pagination**: 이전(`req-table-page-prev`), 다음(`req-table-page-next`), 번호(`req-table-page-{N}`)

### Test Cases
- TC-2.1: 헤더 클릭 시 오름차순/내림차순 정렬 상태 연동 확인
- TC-2.2: 페이징 네비게이션 동작 확인
- TC-2.3: 목록 클릭 시 상세 모달 오픈 확인

## 3. Request Form (신규 등록 모달)
- **Input**: 제목(`req-form-title-input`), 상세 내용(`req-form-desc-input`), 시스템CI(`req-form-ci-input`), 희망완료일(`req-form-expected-date`)
- **Select**: 유형(`req-form-type-select`), 카테고리(`req-form-category-select`), 경로(`req-form-source-select`), 영향도(`req-form-impact-select`), 긴급도(`req-form-urgency-select`)
- **Button**: 닫기(`req-form-close-btn`), 취소(`req-form-cancel-btn`), 저장(`req-form-submit-btn`)

### Test Cases
- TC-3.1: 빈 폼 제출 시 유효성 검사 차단
- TC-3.2: 폼 전체 작성 후 정상 전송 및 페이로드 확인

## 4. Request Detail (상세 및 수정 모달)
- **Button**: 편집 모드(`req-detail-edit-btn`), 저장(`req-detail-save-btn`), 삭제(`req-detail-delete-btn`), 닫기(`req-detail-close-btn`), 삭제 확인(`req-detail-delete-confirm-btn`)
- **Edit Inputs**: 제목(`req-detail-title-input`), 내용(`req-detail-desc-input`), 담당자(`req-detail-assignee-select`), 상태(`req-detail-status-select`), 우선순위(`req-detail-priority-select`), 해결코드(`req-detail-resolution-code`)

### Test Cases
- TC-4.1: 편집 모드 전환 시 인풋 활성화
- TC-4.2: 담당자 및 상태(RESOLVED) 변경 등 갱신 동작
- TC-4.3: 삭제 프로세스 (확인 모달 -> API 호출) 확인
