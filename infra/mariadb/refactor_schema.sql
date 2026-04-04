-- 조직 및 사용자 체계 고도화 (MSP 환경 대응) - 실제 스키마 반영 수정본

DROP TABLE IF EXISTS msp_customer_contracts;
DROP TABLE IF EXISTS team_customer_map;
DROP TABLE IF EXISTS operator_team_members;
DROP TABLE IF EXISTS operators;
DROP TABLE IF EXISTS operator_teams;
DROP TABLE IF EXISTS operator_companies;
DROP TABLE IF EXISTS customer_users;
DROP TABLE IF EXISTS customer_teams;
DROP TABLE IF EXISTS customer_companies;

-- 1. 고객사 영역 (Customer Side)
CREATE TABLE IF NOT EXISTS customer_companies (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id VARCHAR(50) UNIQUE NOT NULL, -- 기존 companies.company_id 에서 이관
  name VARCHAR(200) NOT NULL,
  business_number VARCHAR(50),
  representative_name VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(100),
  address TEXT,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_teams (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_company_id BIGINT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_company_id) REFERENCES customer_companies(id)
);

CREATE TABLE IF NOT EXISTS customer_users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_team_id BIGINT,
  user_id VARCHAR(50) UNIQUE NOT NULL, -- 기존 users.user_id
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  role VARCHAR(50) DEFAULT 'ROLE_USER',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_team_id) REFERENCES customer_teams(id)
);

-- 2. 운영사 영역 (Operator/MSP Side)
CREATE TABLE IF NOT EXISTS operator_companies (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  operator_company_id VARCHAR(50) UNIQUE NOT NULL, -- 기존 'MSP' 등
  name VARCHAR(200) NOT NULL,
  business_number VARCHAR(50),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS operator_teams (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  operator_company_id BIGINT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (operator_company_id) REFERENCES operator_companies(id)
);

CREATE TABLE IF NOT EXISTS operators (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  role VARCHAR(50) DEFAULT 'ROLE_OPER',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 관계 매핑 테이블 (N:M Support)

-- 운영자 다중 팀 소속
CREATE TABLE IF NOT EXISTS operator_team_members (
  operator_id BIGINT,
  operator_team_id BIGINT,
  PRIMARY KEY (operator_id, operator_team_id),
  FOREIGN KEY (operator_id) REFERENCES operators(id),
  FOREIGN KEY (operator_team_id) REFERENCES operator_teams(id)
);

-- 운영팀 기반 고객사 매핑 (Assignment Group 권한 관리)
CREATE TABLE IF NOT EXISTS team_customer_map (
  operator_team_id BIGINT,
  customer_company_id BIGINT,
  PRIMARY KEY (operator_team_id, customer_company_id),
  FOREIGN KEY (operator_team_id) REFERENCES operator_teams(id),
  FOREIGN KEY (customer_company_id) REFERENCES customer_companies(id)
);

-- 운영사-고객사 상위 계약 관계 (MSP Contract)
CREATE TABLE IF NOT EXISTS msp_customer_contracts (
  operator_company_id BIGINT,
  customer_company_id BIGINT,
  contract_date DATE,
  is_active TINYINT(1) DEFAULT 1,
  PRIMARY KEY (operator_company_id, customer_company_id),
  FOREIGN KEY (operator_company_id) REFERENCES operator_companies(id),
  FOREIGN KEY (customer_company_id) REFERENCES customer_companies(id)
);
