import mysql from 'mysql2/promise';

/**
 * DB Cleaner for ITSM v5 E2E Tests
 * Only removes data created during E2E tests, preserving essential seed data.
 */
async function cleanDatabase() {
  const connectionConfig = {
    host: process.env.DB_HOST || 'itsm-db',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'itsmpass',
  };

  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log('Connected to MariaDB for selective cleanup...');

    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // 1. Request Management Cleanup (Dynamic data usually safe to delete)
    await connection.query('USE request_mgmt');
    await connection.query('DELETE FROM request_comments WHERE content LIKE "%E2E%"');
    await connection.query('DELETE FROM attachments WHERE file_name LIKE "%E2E%"');
    await connection.query('DELETE FROM requests WHERE title LIKE "%E2E%" OR req_number LIKE "REQ-E2E%"');

    // 2. Event Management Cleanup
    await connection.query('USE event_mgmt');
    await connection.query('DELETE FROM events WHERE event_number LIKE "E2E%" OR message LIKE "%E2E%"');

    // 3. Incident Management Cleanup
    await connection.query('USE incident_mgmt');
    await connection.query('DELETE FROM incident_histories WHERE changed_by LIKE "E2E%"');
    await connection.query('DELETE FROM incidents WHERE incident_id LIKE "INC-E2E%" OR title LIKE "%E2E%"');

    // 4. System Administration Selective Cleanup
    await connection.query('USE system_mgmt');
    
    // a. Cleanup Mappings first (FK constraints)
    await connection.query(`
        DELETE FROM operator_team_members 
        WHERE operator_id IN (SELECT id FROM operators WHERE user_id LIKE 'oper_%' OR user_id LIKE 'E2E%')
        OR operator_team_id IN (SELECT id FROM operator_teams WHERE name LIKE 'E2E%')
    `);
    
    await connection.query(`
        DELETE FROM team_customer_map 
        WHERE operator_team_id IN (SELECT id FROM operator_teams WHERE name LIKE 'E2E%')
        OR customer_company_id IN (SELECT id FROM customer_companies WHERE customer_id LIKE 'CUS-E2E-%')
    `);

    await connection.query(`
        DELETE FROM msp_customer_contracts 
        WHERE operator_company_id IN (SELECT id FROM operator_companies WHERE operator_company_id LIKE 'MSP-E2E-%')
        OR customer_company_id IN (SELECT id FROM customer_companies WHERE customer_id LIKE 'CUS-E2E-%')
    `);

    // b. Cleanup Users/Operators (Preserving admin, operator1, operator2, user1, user2)
    await connection.query(`
        DELETE FROM customer_users 
        WHERE user_id LIKE 'user_%' AND user_id NOT IN ('user1', 'user2', 'admin')
    `);
    
    await connection.query(`
        DELETE FROM operators 
        WHERE (user_id LIKE 'oper_%' OR user_id LIKE 'E2E%') 
        AND user_id NOT IN ('operator1', 'operator2', 'admin')
    `);

    await connection.query(`
        DELETE FROM users 
        WHERE (user_id LIKE 'user_%' OR user_id LIKE 'oper_%' OR user_id LIKE 'E2E%')
        AND user_id NOT IN ('admin', 'operator1', 'operator2', 'user1', 'user2')
    `);

    // c. Cleanup Teams
    await connection.query("DELETE FROM customer_teams WHERE name LIKE 'E2E%'");
    await connection.query("DELETE FROM operator_teams WHERE name LIKE 'E2E%'");

    // d. Cleanup Companies
    await connection.query("DELETE FROM customer_companies WHERE customer_id LIKE 'CUS-E2E-%'");
    await connection.query("DELETE FROM operator_companies WHERE operator_company_id LIKE 'MSP-E2E-%'");
    
    // e. Cleanup Common Codes
    await connection.query("DELETE FROM common_codes WHERE code_id LIKE 'CODE_E2E%' OR code_name LIKE 'E2E%'");
    await connection.query("DELETE FROM code_groups WHERE group_id LIKE 'GRP_E2E%' OR name LIKE 'E2E%'");

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Selective database cleanup completed successfully.');
  } catch (error) {
    console.error('Selective database cleanup failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  cleanDatabase();
}

export { cleanDatabase };
