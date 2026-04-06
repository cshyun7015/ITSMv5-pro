-- Incident Management Seeding Script
-- Location: infra/mariadb/seed_incidents.sql

CREATE DATABASE IF NOT EXISTS incident_mgmt;
GRANT ALL PRIVILEGES ON incident_mgmt.* TO 'root'@'%';
USE incident_mgmt;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS incidents;
SET FOREIGN_KEY_CHECKS = 1;

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

-- Cleanup old test data to avoid duplicates if re-run
DELETE FROM incidents WHERE incident_id LIKE 'INC-20260404%';

INSERT INTO incidents (incident_id, title, description, tenant_id, category_id, impact, urgency, priority, status, requester_id, sla_due_date) VALUES 
('INC-20260404-001', 'Critical: Global Payment Gateway Unresponsive', 'All credit card transactions are failing globally. Error 503 from upstream provider.', 'SYSTEM', 'NETWORK', 'HIGH', 'HIGH', 'P1', 'NEW', 'admin', DATE_ADD(NOW(), INTERVAL 4 HOUR)),
('INC-20260404-002', 'High: Database Replication Lag in Asia-East Region', 'Replication lag increased to 300s. Potential stale data being read by users.', 'SYSTEM', 'DATABASE', 'HIGH', 'MEDIUM', 'P2', 'IN_PROGRESS', 'system', DATE_ADD(NOW(), INTERVAL 8 HOUR)),
('INC-20260404-003', 'Medium: Intermittent Failures in Email Notification Service', 'Some users report not receiving welcome emails or password reset links.', 'SYSTEM', 'SOFTWARE', 'MEDIUM', 'MEDIUM', 'P3', 'NEW', 'user1', DATE_ADD(NOW(), INTERVAL 24 HOUR)),
('INC-20260404-004', 'Low: UI Typo in Dashboard Performance Tab', 'Misspelling discovered in the analytics header: "Trnasactions" -> "Transactions".', 'SYSTEM', 'UI_UX', 'LOW', 'LOW', 'P4', 'NEW', 'user2', DATE_ADD(NOW(), INTERVAL 48 HOUR)),
('INC-20260404-005', 'Medium: Automated Report Generation Slowdown', 'Daily financial reports taking 10 minutes instead of the usual 45 seconds.', 'SYSTEM', 'SOFTWARE', 'MEDIUM', 'MEDIUM', 'P3', 'IN_PROGRESS', 'admin', DATE_ADD(NOW(), INTERVAL 24 HOUR));
