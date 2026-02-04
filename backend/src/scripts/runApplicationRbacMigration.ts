import 'dotenv/config';
import mysql from 'mysql2/promise';

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  console.log('Connected to database.');
  console.log('\n⚠️  WARNING: This will modify your database structure!');
  console.log('⚠️  Make sure you have a database backup before proceeding.\n');
  console.log('Running Application RBAC migration...\n');

  try {
    // Check if applications table exists first
    const [appTables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'applications'
    `, [process.env.DB_NAME]);

    if ((appTables as any[]).length === 0) {
      console.log('Creating applications table...');
      await connection.query(`
        CREATE TABLE \`applications\` (
          \`id\` char(36) NOT NULL DEFAULT (UUID()),
          \`name\` varchar(255) NOT NULL,
          \`description\` text,
          \`url\` varchar(500),
          \`api_key\` varchar(255),
          \`status\` enum('active','inactive','pending') DEFAULT 'pending',
          \`roles_definition\` json NOT NULL DEFAULT (JSON_OBJECT('roles', JSON_ARRAY())),
          \`created_by\` char(36) NOT NULL,
          \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT \`applications_id\` PRIMARY KEY(\`id\`),
          CONSTRAINT \`applications_created_by_users_id_fk\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`)
        )
      `);
      console.log('✅ applications table created (with roles_definition)');
    } else {
      // Check if roles_definition column exists
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'applications' AND COLUMN_NAME = 'roles_definition'
      `, [process.env.DB_NAME]);

      if ((columns as any[]).length === 0) {
        console.log('Adding roles_definition column to applications table...');
        await connection.query(`
          ALTER TABLE \`applications\` 
          ADD COLUMN \`roles_definition\` json NOT NULL DEFAULT (JSON_OBJECT('roles', JSON_ARRAY()))
        `);
        console.log('✅ roles_definition column added');
      } else {
        console.log('✅ applications table and roles_definition column already exist');
      }
    }

    // Check if application_user_roles table exists
    const [tables1] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'application_user_roles'
    `, [process.env.DB_NAME]);

    if ((tables1 as any[]).length === 0) {
      console.log('Creating application_user_roles table...');
      await connection.query(`
        CREATE TABLE \`application_user_roles\` (
          \`id\` char(36) NOT NULL DEFAULT (UUID()),
          \`user_id\` char(36) NOT NULL,
          \`application_id\` char(36) NOT NULL,
          \`role_code\` varchar(100) NOT NULL,
          \`title\` varchar(255),
          \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT \`application_user_roles_id\` PRIMARY KEY(\`id\`),
          CONSTRAINT \`application_user_roles_user_app_role_unique\` UNIQUE(\`user_id\`, \`application_id\`, \`role_code\`),
          CONSTRAINT \`application_user_roles_user_id_fk\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
          CONSTRAINT \`application_user_roles_application_id_fk\` FOREIGN KEY (\`application_id\`) REFERENCES \`applications\`(\`id\`) ON DELETE CASCADE
        )
      `);
      console.log('✅ application_user_roles table created');

      // Create indexes
      await connection.query(`CREATE INDEX \`idx_app_user_roles_user\` ON \`application_user_roles\` (\`user_id\`)`);
      await connection.query(`CREATE INDEX \`idx_app_user_roles_app\` ON \`application_user_roles\` (\`application_id\`)`);
      console.log('✅ Indexes created for application_user_roles');
    } else {
      console.log('✅ application_user_roles table already exists');
    }

    // Check if application_sessions table exists
    const [tables2] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'application_sessions'
    `, [process.env.DB_NAME]);

    if ((tables2 as any[]).length === 0) {
      console.log('Creating application_sessions table...');
      await connection.query(`
        CREATE TABLE \`application_sessions\` (
          \`id\` char(36) NOT NULL DEFAULT (UUID()),
          \`token\` varchar(255) NOT NULL,
          \`user_id\` char(36) NOT NULL,
          \`application_id\` char(36) NOT NULL,
          \`expires_at\` timestamp NOT NULL,
          \`used\` boolean DEFAULT false,
          \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT \`application_sessions_id\` PRIMARY KEY(\`id\`),
          CONSTRAINT \`application_sessions_token_unique\` UNIQUE(\`token\`),
          CONSTRAINT \`application_sessions_user_id_fk\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
          CONSTRAINT \`application_sessions_application_id_fk\` FOREIGN KEY (\`application_id\`) REFERENCES \`applications\`(\`id\`) ON DELETE CASCADE
        )
      `);
      console.log('✅ application_sessions table created');

      // Create indexes
      await connection.query(`CREATE INDEX \`idx_app_sessions_token\` ON \`application_sessions\` (\`token\`)`);
      await connection.query(`CREATE INDEX \`idx_app_sessions_user\` ON \`application_sessions\` (\`user_id\`)`);
      await connection.query(`CREATE INDEX \`idx_app_sessions_expires\` ON \`application_sessions\` (\`expires_at\`)`);
      console.log('✅ Indexes created for application_sessions');
    } else {
      console.log('✅ application_sessions table already exists');
    }

    console.log('\n🎉 Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigration().catch(console.error);
