-- Database Schema Initialization for ITSM v5 (Unified MariaDB)
-- Each service has its own logical schema (database) for isolation.

-- Common / Shared Schema
CREATE DATABASE IF NOT EXISTS itsm_common;
GRANT ALL PRIVILEGES ON itsm_common.* TO 'root'@'%';

-- Request Management Service Schema
CREATE DATABASE IF NOT EXISTS request_mgmt;
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
    resolution_text TEXT,
    requester_id VARCHAR(50) NOT NULL,
    assignee_id VARCHAR(50),
    service_id VARCHAR(50),
    sla_target_at TIMESTAMP NULL,
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

-- System Administration Service Schema
CREATE DATABASE IF NOT EXISTS system_mgmt;
USE system_mgmt;

FLUSH PRIVILEGES;

-- Code Groups (Header)
CREATE TABLE IF NOT EXISTS code_groups (
    group_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE, -- Protect from deletion
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Common Codes (Lines)
CREATE TABLE IF NOT EXISTS common_codes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id VARCHAR(50) NOT NULL,
    code_id VARCHAR(50) NOT NULL,
    code_name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_group_code (group_id, code_id),
    CONSTRAINT fk_common_code_group FOREIGN KEY (group_id) REFERENCES code_groups(group_id) ON DELETE CASCADE
);

-- Companies Table (Customer Management)
CREATE TABLE IF NOT EXISTS companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id VARCHAR(50) NOT NULL UNIQUE,
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

-- Users Table (System Management with Spring Security compatibility)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,  -- Login ID
    password VARCHAR(255) NOT NULL,        -- Hashed Password
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(50) DEFAULT 'ROLE_USER',
    company_id VARCHAR(50) NOT NULL,      -- Isolation ID
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_company FOREIGN KEY (company_id) REFERENCES companies(company_id)
);

-- Seed Data: MSP Company & Default Users
INSERT INTO companies (company_id, name, business_number, representative_name, phone, email, address, status)
VALUES ('MSP', 'MSP(삭제불가)', NULL, NULL, NULL, NULL, NULL, 'ACTIVE'),
('126-81-03725', '하이닉스', '031-5185-4114', '곽노정', '031-5185-4114', 'www@skhynix.com', '경기도 이천시 부발읍 경충대로 2091', 'ACTIVE'),
('124-81-00998', '삼성전자', '02-2255-0114', '한종희', '02-2255-0114', 'www@samsung.com', '경기도 수원시 영통구 삼성로 129 (매탄동)', 'ACTIVE');

INSERT INTO users (user_id, password, name, email, role, company_id)
VALUES 
('admin', '$2a$10$h8Dz0Jxxjv2hxT.oN/41tukeALShSKcQjCdwiJFQm6ogvOMsTKPm2', 'System Administrator', 'admin@msp.com', 'ROLE_ADMIN', 'MSP'),
('operator1', '$2a$10$9wEuO9flJ2.1D7ik6Cfsp.dwf7e1mOZEGN/wDCKXgE2PLcK8FCYKi', '운영자1', 'op1@msp.com', 'ROLE_OPERATOR', 'MSP'),
('operator2', '$2a$10$9wEuO9flJ2.1D7ik6Cfsp.dwf7e1mOZEGN/wDCKXgE2PLcK8FCYKi', '운영자2', 'op2@msp.com', 'ROLE_OPERATOR', 'MSP'),
('user1', '$2a$10$9wEuO9flJ2.1D7ik6Cfsp.dwf7e1mOZEGN/wDCKXgE2PLcK8FCYKi', '사용자1', 'user1@comp1.com', 'ROLE_USER', '126-81-03725'),
('user2', '$2a$10$9wEuO9flJ2.1D7ik6Cfsp.dwf7e1mOZEGN/wDCKXgE2PLcK8FCYKi', '사용자2', 'user2@comp1.com', 'ROLE_USER', '124-81-00998');

-- Seed Data: Common Code Groups
INSERT INTO code_groups (group_id, name, description, is_system) VALUES 
('SR_STATUS', '요청 상태', '서비스 요청 처리 상태', 1),
('SR_PRIORITY', '우선순위', '우선순위 등급 (P1~P4)', 1),
('SR_TYPE', '요청 유형', '요청의 성격 (장애, 서비스요청 등)', 1),
('SR_CATEGORY', '서비스 카테고리', '기술 분류 (H/W, S/W 등)', 1),
('SR_IMPACT', '영향도', '비즈니스 영향 범위', 1),
('SR_URGENCY', '긴급도', '처리 시급성', 1),
('SR_RESOLUTION', '해결 구분', '해결 처리 코드', 1),
('SR_SOURCE', '접수 경로', '요청 유입 경로', 1);

-- Seed Data: Common Codes
INSERT INTO common_codes (group_id, code_id, code_name, sort_order, is_active) VALUES 
-- Status
('SR_STATUS', 'OPEN', '접수됨', 10, 1),
('SR_STATUS', 'ASSIGNED', '배정됨', 20, 1),
('SR_STATUS', 'IN_PROGRESS', '처리중', 30, 1),
('SR_STATUS', 'PENDING', '보류됨', 40, 1),
('SR_STATUS', 'RESOLVED', '해결됨', 50, 1),
('SR_STATUS', 'CLOSED', '완료됨', 60, 1),
('SR_STATUS', 'CANCELLED', '취소됨', 70, 1),

-- Priority
('SR_PRIORITY', 'P1', 'Critical (P1)', 10, 1),
('SR_PRIORITY', 'P2', 'High (P2)', 20, 1),
('SR_PRIORITY', 'P3', 'Medium (P3)', 30, 1),
('SR_PRIORITY', 'P4', 'Low (P4)', 40, 1),

-- Type
('SR_TYPE', 'INCIDENT', '장애', 10, 1),
('SR_TYPE', 'SERVICE_REQUEST', '서비스 요청', 20, 1),
('SR_TYPE', 'CHANGE', '변경 요청', 30, 1),
('SR_TYPE', 'INQUIRY', '단순 문의', 40, 1),

-- Category
('SR_CATEGORY', 'HARDWARE', '하드웨어', 10, 1),
('SR_CATEGORY', 'SOFTWARE', '소프트웨어', 20, 1),
('SR_CATEGORY', 'NETWORK', '네트워크/통신', 30, 1),
('SR_CATEGORY', 'ACCOUNT', '계정/권한', 40, 1),
('SR_CATEGORY', 'ADMIN', '일반 행정 지원', 50, 1),

-- Impact (3x3 Matrix basis)
('SR_IMPACT', 'HIGH', '높음', 10, 1),
('SR_IMPACT', 'MEDIUM', '중간', 20, 1),
('SR_IMPACT', 'LOW', '낮음', 30, 1),

-- Urgency (3x3 Matrix basis)
('SR_URGENCY', 'HIGH', '높음', 10, 1),
('SR_URGENCY', 'MEDIUM', '중간', 20, 1),
('SR_URGENCY', 'LOW', '낮음', 30, 1),

-- Resolution
('SR_RESOLUTION', 'FIXED', '조치 완료', 10, 1),
('SR_RESOLUTION', 'WORKAROUND', '임시 조치', 20, 1),
('SR_RESOLUTION', 'VOID', '거부/오접수', 30, 1),
('SR_RESOLUTION', 'USER_CLOSED', '사용자 취소', 40, 1),

-- Source
('SR_SOURCE', 'PORTAL', 'Self-Service Portal', 10, 1),
('SR_SOURCE', 'EMAIL', 'Email', 20, 1),
('SR_SOURCE', 'PHONE', 'Phone', 30, 1),
('SR_SOURCE', 'DIRECT', 'Direct Walk-in', 40, 1);
