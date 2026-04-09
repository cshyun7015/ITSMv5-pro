# ITSM Project Architecture & Domain Knowledge

## 1. Core Domain (ITSM)
본 프로젝트는 여러 고객사(Tenant)가 동시에 사용하는 IT 서비스 관리(ITSM) 플랫폼입니다.
- **주요 모듈:** Common Code(공통 코드 관리), Customer Management(고객 조직 관리), Operator Management(운영 조직 관리), Dashboard(대시보드-사용자관점, 운영자관점), Event Management(이벤트 관리), Incidnet Management(인시던트 관리), Service Request Management(서비스 요청 관리) 

## 2. Multi-Tenancy Architecture (중요)
모든 백엔드 로직과 데이터베이스 쿼리는 테넌트 간 완벽한 격리를 보장해야 합니다.
- **식별 방식:** 클라이언트 HTTP 요청의 Header에 포함된 `X-Tenant-ID`를 사용합니다.
- **컨텍스트 관리:** Spring Boot의 `Interceptor` 또는 `Filter`에서 추출하여 `TenantContextHolder` (ThreadLocal 기반)에 저장하여 사용합니다.
- **데이터베이스 격리 (MariaDB):** 물리적인 DB 분리가 아닌, 논리적 분리(Column-based Isolation)를 사용합니다. 모든 주요 테이블에는 `tenant_id` 컬럼이 존재하며, Hibernate 쿼리 작성 시 예외 없이 조건에 포함되어야 합니다.
- **멀티 운영사:** 여러 운영 조직이 여러 고객사 자원을 운영합니다. 운영사별 격리도 보장해야 합니다. 다만 MSP 라는 운영 조직에 속한 운영자는 특수해서 모든 고객사, 모든 운영사의 정보를 볼 수 있어야 합니다. 

## 3. API Design Standard
- **RESTful 원칙:** URI에 행위(동사)를 포함하지 않고 자원(명사)만 사용합니다.
- **응답 공통 포맷:** 성공/실패 여부와 무관하게 `ApiResponse<T>` 객체로 감싸서 반환합니다.
- **인증/인가:** JWT(JSON Web Token) 기반의 Spring Security를 사용하며, 테넌트 관리자(Admin)와 일반 사용자(User) 권한을 엄격히 구분합니다. 운영사 관리자(Admin)와 일반 운영자(User)도 권한을 구분합니다.  MSP 라는 운영 조직에 속한 운영자는 SuperUser 입니다.

## 4. Database Schema (MariaDB 10.11)
- **삭제 정책:** 물리적 삭제(DELETE) 대신 `is_deleted` 컬럼을 활용한 논리적 삭제(Soft Delete)를 기본으로 합니다. 물리적 삭제는 MSP 라는 운영 조직에 속한 운영자만 할 수 있습니다.
- **기본 규칙:** 소문자 스네이크 케이스(Snake Case) 및 단수형 명사 사용
- **테이블 명명:** `[모듈_접두사]_[엔티티명]` (DB 예약어 충돌 방지 및 모듈별 정렬 목적)
  - Common Code: `sys_*` (예: `sys_common_code`)
  - Customer Mgmt: `cust_*` (예: `cust_organization`)
  - Operator Mgmt: `opr_*` (예: `opr_user`)
  - Dashboard: `dash_*` (예: `dash_layout`)
  - Event Mgmt: `evt_*` (예: `evt_event`)
  - Incident Mgmt: `inc_*` (예: `inc_incident`)
  - Service Request: `sr_*` (예: `sr_request`)
- **필수 공통 컬럼:** - 멀티테넌시: `tenant_id`
  - 감사(Audit): `created_by`, `created_at`, `updated_by`, `updated_at`
  - 상태 제어: `is_deleted` (논리적 삭제)
