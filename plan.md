# ITIL v5 기반 ITSM 솔루션 개발 계획서 (MSP 관점)

## 1. 개요
* **목적**: ITIL v5 프랙티스를 포괄하며 다수의 고객사(MSP 형태)를 지원하는 차세대 ITSM 솔루션 구축
* **개발 패러다임**: 클린 아키텍처, 베스트 프랙티스 개발 표준 적용, 높은 확장성과 유지보수성 확보
* **주요 목표**:
  * MSP 관점의 멀티 테넌시(Multi-Tenancy) 지원
  * 공통 코드 기반의 유연한 시스템 설계
  * 모니터링 도구(Prometheus, Grafana)와의 밀접한 통합
  * 인증/인가 및 세분화된 권한 관리 체계 확립

## 2. 개발 및 테스트 환경 (풀 컨테이너 환경)
* **H/W 및 OS**: Mac Mini M4 (개발), Linux (운영 타겟 환경)
* **인프라/컨테이너**: 로컬 종속성(Node.js, JDK 등) 없이 **Docker 및 docker-compose** 기반으로 Frontend, Backend 빌드와 구동을 100% 컨테이너화하여 일관성 보장
* **Frontend**: Node.js 기반 프레임워크 (Vite + React.js / Vue.js 등) - Dockerfile(Multi-stage)을 통한 빌드 및 배포
  * **해상도**: **1280 * 1024** 해상도에 최적화, 더 큰 화면에서는 자동 확장(Auto) 지원
  * **UI/UX 디자인**: 최근 트렌드를 반영한 가독성 높고 세련된 **엣지 있는(Edgy) 다크 모드(Dark Theme)** 기본 적용
  * **스타일링**: TailwindCSS 또는 최신 UI 컴포넌트 라이브러리를 활용해 고급스럽고 직관적인 인터페이스 구축
* **Backend**: Java 17+ & Spring Boot 3.x - Dockerfile(Gradle build)을 통한 컨테이너 환경 빌드 및 실행
* **Database**: MariaDB / PostgreSQL 동시 지원
  * JPA(Hibernate) Dialect를 활용하여 DB 종속성 최소화
  * Database Migration Tool (Flyway / Liquibase) 적용
* **Monitoring**: Prometheus (메트릭 수집) + Grafana (대시보드 시각화)

## 3. 핵심 요구사항 및 기능 상세

### 3.1 공통 모듈 및 권한 관리 (인증/인가)
* **로그인 및 권한**: JWT(JSON Web Token) 및 Spring Security 기반의 로그인 구현.
* **사용자 분리**: 시스템 관리자(Admin), 내부 직원(Agent), 고객사 사용자(User) 등 RBAC(Role-Based Access Control) 적용.
* **공통 코드 관리**: 상태 값, 티켓 카테고리, 우선순위 등 시스템 내의 하드코딩을 배제하고 `공통 코드(Common Code)` 테이블에서 일괄 관리. (조회 성능 강화를 위해 내부 캐시 적용 검토)

### 3.2 MSP 다중 고객사 관리 (Multi-Tenancy)
* 여러 고객사 데이터를 한 시스템에서 관리하기 위한 아키텍처 적용.
* 테넌트 식별자(Tenant ID) 및 데이터 필터링(Row-level 분리 또는 Schema 분리) 적용.
* 고객사별 맞춤형 접근 제어 및 서비스 제공.

### 3.3 ITIL v5 핵심 프랙티스 및 액티비티

초기에는 가장 수요가 높은 `요청 관리`를 집중 개발하되, 이후 ITIL v5의 핵심 프랙티스들을 포괄하는 통합 ITSM 솔루션으로 전체 기능을 확장합니다.

**1) 대시보드 (Dashboard)**
TBD

**2) 나의 요청 항목 (My Requests)**
TBD

**3) 서비스 카탈로그 (Service Catalog)**
TBD

**4) 요청 관리 (Request Management)**
* **목표**: 사용자 요청(권한 신청, S/W 설치 등)의 최적화된 접수 및 표준 처리
* **액티비티**: 카탈로그 아이템 선택 기반의 요청 등록 -> 사용자/문서 정보에 입각한 자동 할당 및 승인 처리 -> 작업 수행 -> 완료 및 피드백 수집

**5) 이벤트 관리 (Event Management)**
TBD

**6) 장애 관리 (Incident Management)**
TBD

**7) 문제 관리 (Problem Management)**
TBD

**8) 변경 관리 (Change Management)**
TBD

**9) 릴리스 관리 (Release Management)**
TBD

**10) 서비스 수준 관리 (Service Level Management)**
TBD

**11) 자산 관리 (Asset Management)**
TBD

**12) 구성 관리 (Configuration Management)**
TBD

**13) 서비스 관리 (Service Management)**
TBD

**14) 지식 관리 (Knowledge Management)**
TBD

**15) 시스템 관리 (System Administration)**
* **목표**: 다중 고객사(MSP) 기반 시스템 운영을 위한 기초 데이터를 최적화하고 전체 권한을 통제
* **액티비티**: 고객사/조직/부서 등록 -> 사용자 및 역할(RBAC) 부여 -> 프로세스 상태 값, 분류 카테고리 등 공통 코드 집중 관리

### 3.4 모니터링 시스템 인터페이스
TBD

### 3.5 공통 파일 첨부 관리 (File Attachment Management)
TBD

## 6. 개발 표준 및 클린코드 적용 전략
1. **아키텍처**: 비즈니스 로직의 오염을 방지하기 위해 Controller - Service - Repository 계층을 명확히 분리하고, DTO를 통해 계층 간 데이터를 전달.
2. **Naming Rule 및 코드 컨벤션**: 구글 Java 스타일 가이드 등 사전 정의된 표준화된 코딩 컨벤션(Lint/Format) 적용.
3. **Database 독립성**: JPA 기반 JPQL/QueryDSL을 위주로 작성하여 MariaDB와 PostgreSQL 간 구문 충돌 제거 (Native Query 금지).
4. **리팩토링 및 테스트**: 
   - 주요 비즈니스 로직(특히 요청 관리 상태 전이 등)에 대해 JUnit5 및 Mockito 기반 단위 테스트 작성.
   - Testcontainers 등 활용하여 양쪽 DB 환경 통합 테스트(Integration Test) 진행.
   - frontend 에도 테스트 케이스 추가
5. **RESTful API**: 명확한 URI 설계 및 HTTP Method(GET, POST, PUT, DELETE) 활용, Swagger(OpenAPI 3.0)로 API 명세서 자동화.

## 7. 시스템 아키텍처 및 배포 구조
*   **API Gateway**: 모든 외부 요청은 Nginx API Gateway를 통해 라우팅됩니다.
*   **데이터 격리**: 통합 MariaDB 내에서 서비스별로 논리적 스키마를 분리하여 독립성을 보장합니다.

### 프로젝트 구조 (Container Flow)
- **사용자** --> [포탈/UI 컨테이너 (Vite/React)]
- **포탈/UI** --> [API Gateway (Nginx)] --> [요청관리 Backend (Spring Boot)] --> [통합DB (Schema: request_mgmt)]
- **포탈/UI** --> [API Gateway (Nginx)] --> [시스템관리 Backend (Spring Boot)] --> [통합DB (Schema: system_mgmt)]