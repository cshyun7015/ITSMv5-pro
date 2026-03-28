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
    priority VARCHAR(50) DEFAULT 'MEDIUM',
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
INSERT INTO companies (company_id, name, status) 
VALUES ('MSP', 'MSP(삭제불가)', 'ACTIVE'),
('TEST-COMP-1', 'TEST-COMP-1', 'ACTIVE'),
('TEST-COMP-2', 'TEST-COMP-2', 'ACTIVE');

INSERT INTO users (user_id, password, name, email, role, company_id)
VALUES 
('admin', '$2a$10$h8Dz0Jxxjv2hxT.oN/41tukeALShSKcQjCdwiJFQm6ogvOMsTKPm2', 'System Administrator', 'admin@msp.com', 'ROLE_ADMIN', 'MSP'),
('operator1', '$2a$10$9wEuO9flJ2.1D7ik6Cfsp.dwf7e1mOZEGN/wDCKXgE2PLcK8FCYKi', '운영자1', 'op1@msp.com', 'ROLE_OPERATOR', 'MSP'),
('operator2', '$2a$10$9wEuO9flJ2.1D7ik6Cfsp.dwf7e1mOZEGN/wDCKXgE2PLcK8FCYKi', '운영자2', 'op2@msp.com', 'ROLE_OPERATOR', 'MSP'),
('user1', '$2a$10$9wEuO9flJ2.1D7ik6Cfsp.dwf7e1mOZEGN/wDCKXgE2PLcK8FCYKi', '사용자1', 'user1@comp1.com', 'ROLE_USER', 'TEST-COMP-1'),
('user2', '$2a$10$9wEuO9flJ2.1D7ik6Cfsp.dwf7e1mOZEGN/wDCKXgE2PLcK8FCYKi', '사용자2', 'user2@comp1.com', 'ROLE_USER', 'TEST-COMP-2');

-- Seed Data: Common Code Groups
INSERT INTO code_groups (group_id, name, description, is_system) VALUES 
('SR_STATUS', 'Service Request Status', 'Status lifecycle for service requests', 1),
('SR_PRIORITY', 'Service Request Priority', 'Priority levels for classification', 1),
('SR_TYPE', 'Service Request Type', 'Nature of the request', 1),
('SR_SOURCE', 'Request Source', 'Channel through which request was received', 1);

-- Seed Data: Common Codes
INSERT INTO common_codes (group_id, code_id, code_name, sort_order, is_active) VALUES 
-- Status
('SR_STATUS', 'OPEN', 'Open', 10, 1),
('SR_STATUS', 'ASSIGNED', 'Assigned', 20, 1),
('SR_STATUS', 'IN_PROGRESS', 'In Progress', 30, 1),
('SR_STATUS', 'PENDING', 'Pending', 40, 1),
('SR_STATUS', 'RESOLVED', 'Resolved', 50, 1),
('SR_STATUS', 'CLOSED', 'Closed', 60, 1),
('SR_STATUS', 'CANCELLED', 'Cancelled', 70, 1),

-- Priority
('SR_PRIORITY', 'P1', 'Critical', 10, 1),
('SR_PRIORITY', 'P2', 'High', 20, 1),
('SR_PRIORITY', 'P3', 'Medium', 30, 1),
('SR_PRIORITY', 'P4', 'Low', 40, 1),

-- Type
('SR_TYPE', 'ACCESS', 'Access Request', 10, 1),
('SR_TYPE', 'HARDWARE', 'Hardware Request', 20, 1),
('SR_TYPE', 'SOFTWARE', 'Software Request', 30, 1),
('SR_TYPE', 'GENERAL', 'General Inquiry', 40, 1),

-- Source
('SR_SOURCE', 'PORTAL', 'Self-Service Portal', 10, 1),
('SR_SOURCE', 'EMAIL', 'Email', 20, 1),
('SR_SOURCE', 'PHONE', 'Phone', 30, 1),
('SR_SOURCE', 'DIRECT', 'Direct Walk-in', 40, 1);
