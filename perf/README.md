# ITSM E2E Performance Testing (k6)

이 디렉토리는 ITSMv5 시스템의 요청 관리(Request Management) 라이프 사이클에 대한 성능 테스트 환경을 제공합니다.

## 디렉토리 구조
*   `scripts/`: k6 테스트 시나리오
    *   `common/auth.js`: 인증 및 세션 관리 모듈
    *   `request-lifecycle.js`: CRUD 시나리오 (Login -> Create -> List -> Update -> Delete)
*   `data/`: 테스트용 페이로드 데이터 (`request-payload.json`)
*   `docker-compose.perf.yml`: 컨테이너 기반 실행 설정

## 실행 방법

### 1. 전제 조건
*   ITSM 인프라(DB, API Gateway, Backend Services)가 Docker로 실행 중이어야 합니다.
*   테스트 계정 (`user1`, `operator1`)이 데이터베이스에 등록되어 있어야 합니다.

### 2. 테스트 실행 (Docker)
전체 라이프 사이클 시나리오를 실행하려면 다음 명령어를 사용하세요:

```bash
docker-compose -f perf/docker-compose.perf.yml run --rm k6
```

### 3. 환경 변수 커스터마이징
타겟 URL이나 다른 설정을 변경하려면 `-e` 옵션을 사용합니다:

```bash
docker-compose -f perf/docker-compose.perf.yml run --rm -e BASE_URL=http://api-gateway:80 k6
```

## 테스트 시나리오 단계
1.  **Login**: `user1` 계정으로 로그인하여 `ITSMSession` 쿠키 획득
2.  **Create**: 새로운 요청 등록 (Payload: `data/request-payload.json`)
3.  **List**: 요청 목록 조회
4.  **Update**: 생성된 요청의 상태를 `IN_PROGRESS`로 변경
5.  **Delete**: 테스트 완료 후 생성된 요청 삭제 (데이터 정체 방지)

## 실시간 모니터링 (Grafana)

성능 테스트 중 실시간으로 지표를 확인하려면 Grafana를 활용하세요.

### 1. Grafana 접속
*   **URL**: `http://localhost:3001`
*   **데이터 소스**: 이미 `Prometheus`가 데이터 소스로 등록되어 있습니다.

### 2. k6 전용 대시보드 추가 (권장)
k6 지표를 시각화하기 위해 다음 대시보드를 임포트하는 것을 권장합니다:
1.  Grafana 왼쪽 메뉴에서 **Dashboards** > **New** > **Import**를 클릭합니다.
2.  **Import via grafana.com** 항목에 `19665` (k6 공식 대시보드 ID)를 입력하고 **Load**를 클릭합니다.
3.  데이터 소스로 `Prometheus`를 선택하고 **Import**를 완료합니다.

### 3. 주요 모니터링 포인트
*   **VUs (Virtual Users)**: 현재 실행 중인 가상 사용자 수
*   **Request Rate (TPS)**: 초당 처리되는 요청 수
*   **HTTP Error Rate**: 실패한 요청의 비율 (Threshold: 1%)
*   **Response Time (P95)**: 95%의 요청이 처리되는 시간 (Threshold: 500ms)

### 4. 백엔드 연계 모니터링
백엔드 서비스(`request-service`, `system-service`)의 JVM 및 DB 커넥션 풀 지표와 함께 모니터링하여 임계 작업 시의 병목 구간을 파악할 수 있습니다.
