-- 데이터 마이그레이션 스크립트 (Corrected)

-- 1. 고객사 데이터 이관 ('MSP'가 아닌 모든 회사)
INSERT INTO customer_companies (customer_id, name, business_number, representative_name, phone, email, address, status, created_at)
SELECT company_id, name, business_number, representative_name, phone, email, address, status, created_at
FROM companies
WHERE company_id <> 'MSP';

-- 2. 운영사 데이터 이관 ('MSP' 회사)
INSERT INTO operator_companies (operator_company_id, name, business_number, status, created_at)
SELECT company_id, name, business_number, status, created_at
FROM companies
WHERE company_id = 'MSP';

-- 3. 기본 팀(Team) 생성
-- 고객사별 '기본팀'
INSERT INTO customer_teams (customer_company_id, name, description)
SELECT id, '기본팀', '마이그레이션 자동 생성'
FROM customer_companies;

-- 운영사별 '운영본부'
INSERT INTO operator_teams (operator_company_id, name, description)
SELECT id, '운영본부', '마이그레이션 자동 생성'
FROM operator_companies;

-- 4. 사용자 데이터 이관
-- 고객 사용자 (ROLE_USER)
INSERT INTO customer_users (customer_team_id, user_id, password, name, email, role, is_active, created_at)
SELECT 
  (SELECT ct.id FROM customer_teams ct JOIN customer_companies cc ON ct.customer_company_id = cc.id WHERE cc.customer_id = u.company_id LIMIT 1),
  u.user_id, u.password, u.name, u.email, u.role, u.is_active, u.created_at
FROM users u
WHERE u.role = 'ROLE_USER';

-- 운영자 (ROLE_OPER, ROLE_ADMIN)
INSERT INTO operators (user_id, password, name, email, role, is_active, created_at)
SELECT u.user_id, u.password, u.name, u.email, u.role, u.is_active, u.created_at
FROM users u
WHERE u.role IN ('ROLE_OPER', 'ROLE_ADMIN');

-- 5. 관계 매핑 초기화
-- 5-1. 운영자 다중 팀 소속 초기화 (모든 운영자를 자신의 운영본부에 소속)
INSERT INTO operator_team_members (operator_id, operator_team_id)
SELECT 
  o.id, 
  (SELECT ot.id FROM operator_teams ot JOIN operator_companies oc ON ot.operator_company_id = oc.id JOIN users u ON u.company_id = oc.operator_company_id WHERE u.user_id = o.user_id LIMIT 1)
FROM operators o;

-- 5-2. 운영팀 - 고객사 매핑 (초기 전체 개방)
INSERT INTO team_customer_map (operator_team_id, customer_company_id)
SELECT ot.id, cc.id
FROM operator_teams ot
CROSS JOIN customer_companies cc;

-- 5-3. MSP - 고객사 계약 관계 초기화
INSERT INTO msp_customer_contracts (operator_company_id, customer_company_id, contract_date)
SELECT oc.id, cc.id, CURRENT_DATE
FROM operator_companies oc
CROSS JOIN customer_companies cc;
