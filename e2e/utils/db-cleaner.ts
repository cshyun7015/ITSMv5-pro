import mysql from 'mysql2/promise';

/**
 * DB Cleaner for ITSM v5 E2E Tests
 * Resets dynamic data tables to ensure clean state for repetitive testing.
 */
async function cleanDatabase() {
  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'itsmpass',
  };

  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log('Connected to MariaDB for cleanup...');

    // 1. Request Management Cleanup
    await connection.query('USE request_mgmt');
    console.log('Cleaning request_mgmt dynamic tables...');
    // Order matters due to foreign keys (ON DELETE CASCADE is set in schema, 
    // but explicit truncate in correct order is safer)
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE request_comments');
    await connection.query('TRUNCATE TABLE attachments');
    await connection.query('TRUNCATE TABLE requests');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 2. Event Management Cleanup
    await connection.query('USE event_mgmt');
    console.log('Cleaning event_mgmt dynamic tables...');
    await connection.query('TRUNCATE TABLE events');

    console.log('Database cleanup completed successfully.');
  } catch (error) {
    console.error('Database cleanup failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  cleanDatabase();
}

export { cleanDatabase };
