-- =============================================================================
-- Database Schema Initialization for ITSM v5 (Unified Version)
-- Location: infra/mariadb/init.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Database & Privilege Setup
-- -----------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS itsm_common;
GRANT ALL PRIVILEGES ON itsm_common.* TO 'root'@'%';

CREATE DATABASE IF NOT EXISTS request_mgmt;
GRANT ALL PRIVILEGES ON request_mgmt.* TO 'root'@'%';

CREATE DATABASE IF NOT EXISTS incident_mgmt;
GRANT ALL PRIVILEGES ON incident_mgmt.* TO 'root'@'%';

CREATE DATABASE IF NOT EXISTS event_mgmt;
GRANT ALL PRIVILEGES ON event_mgmt.* TO 'root'@'%';

CREATE DATABASE IF NOT EXISTS system_mgmt;
GRANT ALL PRIVILEGES ON system_mgmt.* TO 'root'@'%';

FLUSH PRIVILEGES;

-- -----------------------------------------------------------------------------
-- 2. Request Management Schema
-- -----------------------------------------------------------------------------
USE request_mgmt;

CREATE TABLE IF NOT EXISTS requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    req_number VARCHAR(50) NOT NULL UNIQUE,
    company_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'OPEN',
    priority VARCHAR(50) DEFAULT 'P3',
    sr_type_code VARCHAR(50),
    sr_category_code VARCHAR(50),
    sr_impact_code VARCHAR(50),
    sr_urgency_code VARCHAR(50),
    sr_resolution_code VARCHAR(50),
    sr_source_code VARCHAR(50),
    resolution_text TEXT,
    requester_id VARCHAR(50) NOT NULL,
    assignee_id VARCHAR(50),
    service_id VARCHAR(50),
    ci_id VARCHAR(100),
    sla_target_at TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    reopen_count INT DEFAULT 0,
    expected_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_req_company (company_id),
    INDEX idx_req_status (status)
);

CREATE TABLE IF NOT EXISTS request_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL,
    author_id VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_request FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    file_data LONGBLOB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attachment_request FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 3. Incident Management Schema
-- -----------------------------------------------------------------------------
USE incident_mgmt;

CREATE TABLE IF NOT EXISTS incidents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    incident_id VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    tenant_id VARCHAR(50) NOT NULL,
    category_id VARCHAR(50),
    impact VARCHAR(20),
    urgency VARCHAR(20),
    priority VARCHAR(10),
    status VARCHAR(20) DEFAULT 'NEW',
    requester_id VARCHAR(50),
    assignee_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    sla_due_date TIMESTAMP NULL,
    is_sla_breached BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE IF NOT EXISTS incident_histories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    incident_id BIGINT NOT NULL,
    changed_by VARCHAR(100) NOT NULL,
    change_subject VARCHAR(200) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_reason TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 4. Event Management Schema
-- -----------------------------------------------------------------------------
USE event_mgmt;

CREATE TABLE IF NOT EXISTS events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_number VARCHAR(50) NOT NULL UNIQUE,
    company_id VARCHAR(50) NOT NULL,
    source_code VARCHAR(50) NOT NULL,
    category_code VARCHAR(50),
    node VARCHAR(200),
    severity_code VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    event_details LONGTEXT,
    status_code VARCHAR(50) DEFAULT 'NEW',
    fingerprint VARCHAR(100),
    occurrence_count INT DEFAULT 1,
    first_occurred_at TIMESTAMP NULL,
    last_occurred_at TIMESTAMP NULL,
    assignee_id VARCHAR(50),
    acknowledged_at TIMESTAMP NULL,
    related_request_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_evt_company (company_id),
    INDEX idx_evt_status (status_code),
    INDEX idx_evt_fingerprint (fingerprint)
);

-- -----------------------------------------------------------------------------
-- 5. System Administration Schema
-- -----------------------------------------------------------------------------
USE system_mgmt;

-- 5-1. Governance Codes
CREATE TABLE IF NOT EXISTS code_groups (
    group_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS common_codes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id VARCHAR(50) NOT NULL,
    code_id VARCHAR(50) NOT NULL,
    code_name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    UNIQUE KEY uk_group_code (group_id, code_id),
    CONSTRAINT fk_common_code_group FOREIGN KEY (group_id) REFERENCES code_groups(group_id) ON DELETE CASCADE
);

-- 5-3. Advanced Organizational Schema (Refactored)
CREATE TABLE IF NOT EXISTS customer_companies (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  business_number VARCHAR(50),
  representative_name VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(100),
  address TEXT,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  tenant_id VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
  is_deleted TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  updated_by VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS customer_teams (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_company_id BIGINT,
  parent_team_id BIGINT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  tenant_id VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
  is_deleted TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME(6),
  cost_center VARCHAR(50),
  service_hours VARCHAR(100),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_by VARCHAR(50),
  updated_by VARCHAR(50),
  FOREIGN KEY (customer_company_id) REFERENCES customer_companies(id),
  FOREIGN KEY (parent_team_id) REFERENCES customer_teams(id)
);

CREATE TABLE IF NOT EXISTS customer_users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_team_id BIGINT,
  user_id VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  role VARCHAR(50) DEFAULT 'ROLE_USER',
  is_active TINYINT(1) DEFAULT 1,
  tenant_id VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
  is_deleted TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  position VARCHAR(50),
  is_vip TINYINT(1) DEFAULT 0,
  location_id BIGINT,
  is_approver TINYINT(1) DEFAULT 0,
  user_criticality VARCHAR(20),
  created_by VARCHAR(50),
  updated_by VARCHAR(50),
  FOREIGN KEY (customer_team_id) REFERENCES customer_teams(id)
);

CREATE TABLE IF NOT EXISTS operator_companies (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  operator_company_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  business_number VARCHAR(50),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  representative_name VARCHAR(100),
  description TEXT,
  is_deleted TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  updated_by VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS operator_teams (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  operator_company_id BIGINT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  is_deleted TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  updated_by VARCHAR(50),
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
  is_deleted TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  updated_by VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS operator_team_members (
  operator_id BIGINT,
  operator_team_id BIGINT,
  PRIMARY KEY (operator_id, operator_team_id),
  FOREIGN KEY (operator_id) REFERENCES operators(id),
  FOREIGN KEY (operator_team_id) REFERENCES operator_teams(id)
);

CREATE TABLE IF NOT EXISTS team_customer_map (
  operator_team_id BIGINT,
  customer_company_id BIGINT,
  PRIMARY KEY (operator_team_id, customer_company_id),
  FOREIGN KEY (operator_team_id) REFERENCES operator_teams(id),
  FOREIGN KEY (customer_company_id) REFERENCES customer_companies(id)
);

CREATE TABLE IF NOT EXISTS msp_customer_contracts (
  operator_company_id BIGINT,
  customer_company_id BIGINT,
  contract_date DATE,
  is_active TINYINT(1) DEFAULT 1,
  PRIMARY KEY (operator_company_id, customer_company_id),
  FOREIGN KEY (operator_company_id) REFERENCES operator_companies(id),
  FOREIGN KEY (customer_company_id) REFERENCES customer_companies(id)
);

-- -----------------------------------------------------------------------------
-- 6. Seed Data (Master & Metadata)
-- -----------------------------------------------------------------------------
USE system_mgmt;

-- 6-1. Code Groups
INSERT IGNORE INTO code_groups (group_id, name, description, is_system) VALUES 
('SR_STATUS', '요청 상태', '서비스 요청 처리 상태', 1),
('SR_PRIORITY', '우선순위', '우선순위 등급 (P1~P4)', 1),
('SR_TYPE', '요청 유형', '요청의 성격 (장애, 서비스요청 등)', 1),
('SR_CATEGORY', '서비스 카테고리', '기술 분류 (H/W, S/W 등)', 1),
('SR_IMPACT', '영향도', '비즈니스 영향 범위', 1),
('SR_URGENCY', '긴급도', '처리 시급성', 1),
('SR_RESOLUTION', '해결 구분', '해결 처리 코드', 1),
('SR_SOURCE', '접수 경로', '요청 유입 경로', 1),
('EV_STATUS', '이벤트 상태', '이벤트 처리 상태', 1),
('EV_SOURCE', '이벤트 발생처', '이벤트 발생 시스템', 1),
('EV_SEVERITY', '이벤트 심각도', '이벤트 심각도', 1),
('EV_CATEGORY', '이벤트 유형', '이벤트 분류 유형 (ITIL)', 1),
('IN_STATUS', '인시던트 상태', '인시던트 처리 상태', 1),
('IN_PRIORITY', '인시던트 우선순위', '인시던트 우선순위 등급 (P1~P4)', 1),
('IN_IMPACT', '인시던트 영향도', '인시던트 비즈니스 영향 범위', 1),
('IN_URGENCY', '인시던트 긴급도', '인시던트 처리 시급성', 1),
('IN_CHANNEL', '인시던트 접수 채널', '인시던트 유입 경로', 1),
('OPE_ROLE', '운영자 역할', 'ITSM 운영 인력의 전문 분야 및 권한 등급', 1),
('CUS_ROLE', '고객 사용자 역할', '고객 포털 사용자 권한 체계 관리', 1);

-- 6-2. Common Codes
INSERT IGNORE INTO common_codes (group_id, code_id, code_name, sort_order, is_active) VALUES 
('SR_STATUS', 'OPEN', 'Open', 10, 1),
('SR_STATUS', 'ASSIGNED', 'Assigned', 20, 1),
('SR_STATUS', 'IN_PROGRESS', 'In-progress', 30, 1),
('SR_STATUS', 'PENDING', '보류됨', 40, 1),
('SR_STATUS', 'RESOLVED', 'Resolved', 50, 1),
('SR_STATUS', 'CLOSED', 'Closed', 60, 1),
('SR_STATUS', 'CANCELLED', 'Cancelled', 70, 1),
('SR_PRIORITY', 'P1', 'Critical (P1)', 10, 1),
('SR_PRIORITY', 'P2', 'High (P2)', 20, 1),
('SR_PRIORITY', 'P3', 'Medium (P3)', 30, 1),
('SR_PRIORITY', 'P4', 'Low (P4)', 40, 1),
('SR_TYPE', 'INCIDENT', '장애', 10, 1),
('SR_TYPE', 'SERVICE_REQUEST', '서비스 요청', 20, 1),
('SR_TYPE', 'CHANGE', '변경 요청', 30, 1),
('SR_TYPE', 'INQUIRY', '단순 문의', 40, 1),
('SR_CATEGORY', 'NETWORK', '네트워크', 10, 1),
('SR_CATEGORY', 'HARDWARE', '하드웨어', 20, 1),
('SR_CATEGORY', 'SOFTWARE', '소프트웨어', 30, 1),
('SR_CATEGORY', 'ACCOUNT', '계정/권한', 40, 1),
('SR_IMPACT', 'HIGH', '높음', 10, 1),
('SR_IMPACT', 'MEDIUM', '보통', 20, 1),
('SR_IMPACT', 'LOW', '낮음', 30, 1),
('SR_URGENCY', 'URGENT', '긴급', 10, 1),
('SR_URGENCY', 'NORMAL', '보통', 20, 1),
('SR_URGENCY', 'LOW', '낮음', 30, 1),
('SR_SOURCE', 'PORTAL', '포털', 10, 1),
('SR_SOURCE', 'EMAIL', '이메일', 20, 1),
('SR_SOURCE', 'PHONE', '전화', 30, 1),
('SR_SOURCE', 'SYSTEM', '시스템 자동', 40, 1),
('SR_RESOLUTION', 'FIXED', '해결 완료', 10, 1),
('SR_RESOLUTION', 'WORKAROUND', '임시 조치', 20, 1),
('SR_RESOLUTION', 'NO_ACTION', '조치 불필요', 30, 1),
('SR_RESOLUTION', 'WITHDRAWN', '사용자 철회', 40, 1),
('EV_STATUS', 'NEW', '신규', 10, 1),
('EV_STATUS', 'ACKNOWLEDGED', '인지함', 20, 1),
('EV_STATUS', 'RESOLVED', '해결됨', 30, 1),
('EV_STATUS', 'PROMOTED', '장애 전환', 40, 1),
('EV_STATUS', 'CANCELLED', '취소됨', 50, 1),
('EV_SEVERITY', 'CRITICAL', 'Critical', 10, 1),
('EV_SEVERITY', 'WARNING', 'Warning', 20, 1),
('EV_SEVERITY', 'INFO', 'Info', 30, 1),
('IN_STATUS', 'NEW', 'New', 10, 1),
('IN_STATUS', 'ASSIGNED', 'Assigned', 20, 1),
('IN_STATUS', 'IN_PROGRESS', 'In-progress', 30, 1),
('IN_STATUS', 'ON_HOLD', 'Hold', 40, 1),
('IN_STATUS', 'RESOLVED', 'Resolved', 50, 1),
('IN_STATUS', 'CLOSED', 'Closed', 60, 1),
('IN_PRIORITY', 'P1', 'Critical (P1)', 10, 1),
('IN_PRIORITY', 'P2', 'High (P2)', 20, 1),
('IN_PRIORITY', 'P3', 'Medium (P3)', 30, 1),
('IN_PRIORITY', 'P4', 'Low (P4)', 40, 1),
('IN_IMPACT', 'HIGH', 'High', 10, 1),
('IN_IMPACT', 'MEDIUM', 'Medium', 20, 1),
('IN_IMPACT', 'LOW', 'Low', 30, 1),
('IN_URGENCY', 'HIGH', 'High', 10, 1),
('IN_URGENCY', 'MEDIUM', 'Medium', 20, 1),
('IN_URGENCY', 'LOW', 'Low', 30, 1),
('IN_CHANNEL', 'PHONE', 'Phone', 10, 1),
('IN_CHANNEL', 'EMAIL', 'Email', 20, 1),
('IN_CHANNEL', 'SELF_SERVICE', 'Self Service', 30, 1),
('IN_CHANNEL', 'MONITORING', 'Monitoring', 40, 1),
('IN_CHANNEL', 'CHAT', 'Chat', 50, 1),
('IN_CHANNEL', 'OTHER', 'Other', 60, 1),
('OPE_ROLE', 'ROLE_ADMIN', '시스템 관리자', 10, 1),
('OPE_ROLE', 'ROLE_OPER', '일반 운영자', 40, 1),
('CUS_ROLE', 'ROLE_CUS_ADMIN', '고객사 관리자', 10, 1),
('CUS_ROLE', 'ROLE_CUS_USER', '일반 사용자', 30, 1);

-- 6-3. Legacy Bootstrap Data
-- INSERT IGNORE INTO companies (company_id, name, business_number, representative_name, status)
-- VALUES ('MSP', 'MSP(삭제불가)', '000-00-00000', '운영관리자', 'ACTIVE'),
-- ('126-81-03725', '하이닉스', '031-5185-4114', '곽노정', 'ACTIVE'),
-- ('124-81-00998', '삼성전자', '02-2255-0114', '한종희', 'ACTIVE');

-- INSERT IGNORE INTO users (user_id, password, name, email, role, company_id)
-- VALUES 
-- ('admin', '$2a$10$h8Dz0Jxxjv2hxT.oN/41tukeALShSKcQjCdwiJFQm6ogvOMsTKPm2', 'System Administrator', 'admin@msp.com', 'ROLE_ADMIN', 'MSP'),
-- ('operator1', '$2a$10$9wEuO9flJ2.1D7ik6Cfsp.dwf7e1mOZEGN/wDCKXgE2PLcK8FCYKi', '운영자1', 'op1@msp.com', 'ROLE_OPER', 'MSP'),
-- ('operator2', '$2a$10$9wEuO9flJ2.1D7ik6Cfsp.dwf7e1mOZEGN/wDCKXgE2PLcK8FCYKi', '운영자2', 'op2@msp.com', 'ROLE_OPER', 'MSP'),
-- ('user1', '$2a$10$9wEuO9flJ2.1D7ik6Cfsp.dwf7e1mOZEGN/wDCKXgE2PLcK8FCYKi', '사용자1', 'user1@comp1.com', 'ROLE_USER', '126-81-03725');

-- 6-4. Refactored Organization Data (Latest Sync)
INSERT IGNORE INTO customer_companies (id, tenant_id, customer_id, name, business_number, representative_name, phone, email, address, status, is_deleted, created_at, updated_at, created_by, updated_by) VALUES
(1, '126-81-03725', '126-81-03725', '하이닉스', '031-5185-4114', '곽노정', NULL, NULL, NULL, 'ACTIVE', 0, '2026-04-05 06:53:15', NOW(), NULL, NULL),
(2, '124-81-00998', '124-81-00998', '삼성전자', '02-2255-0114', '한종희', NULL, NULL, NULL, 'ACTIVE', 0, '2026-04-05 06:53:15', NOW(), NULL, NULL),
(4, 'MSP', 'MSP', 'MSP(삭제불가)', '000-00-00000', '운영관리자', NULL, NULL, NULL, 'ACTIVE', 0, '2026-04-05 07:08:42', NOW(), NULL, NULL),
(246, 'google', 'google', 'google', '123-45-67890', 'google', '012-3456-7890', 'google@google.com', 'Google Atlanta\n1105 W Peachtree St NW, Atlanta, GA 30309', 'ACTIVE', 0, '2026-04-10 07:56:45', NOW(), 'SYSTEM', 'SYSTEM');

INSERT IGNORE INTO customer_teams (id, tenant_id, customer_company_id, parent_team_id, name, description, is_deleted, created_at, cost_center, service_hours, created_by, updated_at, updated_by, status) VALUES
(1, '124-81-00998', 2, NULL, '휴대폰팀', '마이그레이션 자동 생성', 0, '2026-04-05 06:53:15', NULL, NULL, NULL, NOW(), 'SYSTEM', 'ACTIVE'),
(2, '126-81-03725', 1, NULL, '정보기획팀', '마이그레이션 자동 생성', 0, '2026-04-05 06:53:15', NULL, NULL, NULL, NOW(), 'SYSTEM', 'ACTIVE'),
(4, 'MSP', 4, NULL, 'AWS팀', '마이그레이션 자동 생성', 0, '2026-04-05 07:08:49', NULL, NULL, NULL, NOW(), 'SYSTEM', 'ACTIVE'),
(6, '124-81-00998', 2, NULL, '냉장고팀', '마이그레이션 자동 생성', 0, '2026-04-05 09:53:36', NULL, NULL, NULL, NOW(), 'SYSTEM', 'ACTIVE'),
(7, '126-81-03725', 1, NULL, '거버넌스팀', '마이그레이션 자동 생성', 0, '2026-04-05 09:53:36', NULL, NULL, NULL, NOW(), 'SYSTEM', 'ACTIVE'),
(8, 'MSP', 4, NULL, 'Azure팀', '마이그레이션 자동 생성', 0, '2026-04-05 09:53:36', NULL, NULL, NULL, NOW(), 'SYSTEM', 'ACTIVE'),
(154, 'google', 246, NULL, 'T1', '모든 것은 다 처리한다.', 0, '2026-04-10 07:58:30', 'T1', '24x7', 'SYSTEM', NOW(), 'SYSTEM', 'ACTIVE');

INSERT IGNORE INTO customer_users (id, tenant_id, customer_team_id, user_id, password, name, email, role, is_active, created_at, updated_at, position, is_vip, location_id, is_approver, user_criticality, is_deleted, created_by, updated_by) VALUES
(1, '126-81-03725', 2, 'user1', '$2a$10$9wEuO9flJ2.1D7ik6Cfsp.dwf7e1mOZEGN/wDCKXgE2PLcK8FCYKi', '사용자1', 'user1@comp1.com', 'ROLE_USER', 1, '2026-04-05 06:53:15', NOW(), NULL, 0, NULL, 0, NULL, 0, NULL, NULL),
(75, 'MSP', 4, 'admin', '$2a$10$4U89Asoi5p2R7a2NssCXiOF9makPV4eXnp9ZBcxO9lSKLk72FEPzC', '관리자', 'admin@msp.com', 'ROLE_USER', 1, '2026-04-10 09:46:47', NOW(), 'Manager', 1, NULL, 1, 'HIGH', 0, 'SYSTEM', 'SYSTEM');

-- Operators and Teams (MSP)
INSERT IGNORE INTO operator_companies (operator_company_id, name, business_number, status, representative_name) VALUES
('MSP', 'MSP(삭제불가)', '000-00-00000', 'ACTIVE', '운영관리자');

INSERT IGNORE INTO operator_teams (operator_company_id, name, description) VALUES
(1, '운영본부', '기본 운영 조직');

INSERT IGNORE INTO operators (user_id, password, name, email, role, is_active) VALUES
('admin', '$2a$10$h8Dz0Jxxjv2hxT.oN/41tukeALShSKcQjCdwiJFQm6ogvOMsTKPm2', 'System Administrator', 'admin@msp.com', 'ROLE_ADMIN', 1),
('operator1', '$2a$10$9wEuO9flJ2.1D7ik6Cfsp.dwf7e1mOZEGN/wDCKXgE2PLcK8FCYKi', '운영자1', 'op1@msp.com', 'ROLE_OPER', 1),
('operator2', '$2a$10$9wEuO9flJ2.1D7ik6Cfsp.dwf7e1mOZEGN/wDCKXgE2PLcK8FCYKi', '운영자2', 'op2@msp.com', 'ROLE_OPER', 1);

INSERT IGNORE INTO operator_team_members (operator_id, operator_team_id) VALUES
(1, 1), (2, 1), (3, 1);

-- -----------------------------------------------------------------------------
-- 7. Service Specific Seed Data
-- -----------------------------------------------------------------------------

-- 7-1. Event Management
USE event_mgmt;
INSERT IGNORE INTO events (event_number, company_id, source_code, category_code, node, severity_code, message, status_code) VALUES 
('EVT-2026-0001', 'MSP', 'DATADOG', 'EXCP', 'order-service-01', 'CRITICAL', 'JVM Garbage Collection duration exceeded 5s', 'NEW'),
('EVT-2026-0002', 'MSP', 'ZABBIX', 'WARN', 'payment-api-02', 'WARNING', 'API endpoint /v1/pay responding with 500ms latency', 'NEW');

-- 7-2. Incident Management
USE incident_mgmt;
INSERT IGNORE INTO incidents (incident_id, title, description, tenant_id, category_id, impact, urgency, priority, status, requester_id, sla_due_date) VALUES 
('INC-20260405-001', 'Network Connectivity Issue', 'Users report slow connection in Building A', '124-81-00998', 1, 'MEDIUM', 'HIGH', 'HIGH', 'IN_PROGRESS', 'samsung_admin', DATE_ADD(NOW(), INTERVAL 4 HOUR)),
('INC-20260405-002', 'Login Failure', 'Unable to login to ERP system', '126-81-03725', 2, 'HIGH', 'HIGH', 'CRITICAL', 'OPEN', 'hynix_user', DATE_ADD(NOW(), INTERVAL 2 HOUR)),
('INC-20260408-001', 'Test Incident for Deletion', 'Testing soft and hard delete', 'CUST-ORG-1775643412753', 1, 'LOW', 'LOW', 'LOW', 'RESOLVED', 'system', NOW());
