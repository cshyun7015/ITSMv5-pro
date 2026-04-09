# Antigravity Global Rules

## 1. Project Context
- **Domain:** ITSM (IT Service Management) 플랫폼
- **Key Architecture:** Multi-tenancy (테넌트별 데이터 및 UI 완벽 격리)
- **Local Environment:** Mac (Apple Silicon, M4)

## 2. Tech Stack & Tools
- **Backend:** Java (Spring Boot), Gradle (빌드 도구), MariaDB
- **Frontend / QA:** node.js (Vite, React, TypeScript), Playwright (UI E2E 테스트), MSW (API 모킹)
- **Infrastructure:** Docker

## 3. Global Constraints (절대 준수)
- **명령어 실행:** 파괴적인 명령어(예: `DROP TABLE`, )나 파일 삭제 전에는 반드시 사용자에게 먼저 계획을 설명하고 승인을 받을 것.
- **의존성 추가:** 새로운 라이브러리나 패키지를 `build.gradle` 또는 `package.json`에 추가할 때는 항상 최신 안정화(Stable) 버전을 확인할 것.
- **언어:** 사용자와의 채팅 및 코드 내 주석(Comments)과 커밋 메시지는 특별한 지시가 없는 한 **한국어**로 작성할 것.
- **멀티테넌시 고려:** 백엔드 API 설계나 프론트엔드 UI 컴포넌트 수정 시, 항상 테넌트(Tenant) 컨텍스트가 안전하게 격리되어 있는지 검증하는 단계를 포함할 것.
- **아키텍처 참조:** 프로젝트의 핵심 도메인, 데이터베이스 스키마 및 멀티테넌시 구조는 루트 디렉토리의 ARCHITECTURE.md 파일을 반드시 참조할 것.
