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
  console.log('\nRunning Events migration...\n');

  try {
    // Check if events table exists
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'events'
    `, [process.env.DB_NAME]);

    if ((tables as any[]).length > 0) {
      console.log('✅ events table already exists');
    } else {
      console.log('Creating events table...');
      await connection.query(`
        CREATE TABLE \`events\` (
          \`id\` char(36) NOT NULL DEFAULT (UUID()),
          \`title\` varchar(255) NOT NULL,
          \`description\` text,
          \`location\` varchar(500),
          \`event_date\` timestamp NOT NULL,
          \`created_by\` char(36) NOT NULL,
          \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT \`events_id\` PRIMARY KEY(\`id\`),
          CONSTRAINT \`events_created_by_fk\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
        )
      `);
      console.log('✅ events table created');
    }

    // Check if event_rsvps table exists
    const [rsvpTables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'event_rsvps'
    `, [process.env.DB_NAME]);

    if ((rsvpTables as any[]).length > 0) {
      console.log('✅ event_rsvps table already exists');
    } else {
      console.log('Creating event_rsvps table...');
      await connection.query(`
        CREATE TABLE \`event_rsvps\` (
          \`id\` char(36) NOT NULL DEFAULT (UUID()),
          \`event_id\` char(36) NOT NULL,
          \`user_id\` char(36) NOT NULL,
          \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT \`event_rsvps_id\` PRIMARY KEY(\`id\`),
          CONSTRAINT \`event_rsvps_event_user_unique\` UNIQUE(\`event_id\`, \`user_id\`),
          CONSTRAINT \`event_rsvps_event_id_fk\` FOREIGN KEY (\`event_id\`) REFERENCES \`events\`(\`id\`) ON DELETE CASCADE,
          CONSTRAINT \`event_rsvps_user_id_fk\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
        )
      `);
      console.log('✅ event_rsvps table created');
    }

    // Create indexes if they don't exist
    const [idxEvents] = await connection.query(`
      SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'events' AND INDEX_NAME = 'idx_events_event_date'
    `, [process.env.DB_NAME]);

    if ((idxEvents as any[]).length === 0) {
      await connection.query(`CREATE INDEX \`idx_events_event_date\` ON \`events\` (\`event_date\`)`);
      console.log('✅ idx_events_event_date index created');
    }

    const [idxRsvpEvent] = await connection.query(`
      SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'event_rsvps' AND INDEX_NAME = 'idx_event_rsvps_event'
    `, [process.env.DB_NAME]);

    if ((idxRsvpEvent as any[]).length === 0) {
      await connection.query(`CREATE INDEX \`idx_event_rsvps_event\` ON \`event_rsvps\` (\`event_id\`)`);
      console.log('✅ idx_event_rsvps_event index created');
    }

    const [idxRsvpUser] = await connection.query(`
      SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'event_rsvps' AND INDEX_NAME = 'idx_event_rsvps_user'
    `, [process.env.DB_NAME]);

    if ((idxRsvpUser as any[]).length === 0) {
      await connection.query(`CREATE INDEX \`idx_event_rsvps_user\` ON \`event_rsvps\` (\`user_id\`)`);
      console.log('✅ idx_event_rsvps_user index created');
    }

    // Add start_date, end_date, status columns if they don't exist
    const [cols] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'events' AND COLUMN_NAME = 'start_date'
    `, [process.env.DB_NAME]);
    if ((cols as any[]).length === 0) {
      await connection.query(`
        ALTER TABLE \`events\` 
        ADD COLUMN \`start_date\` timestamp NULL AFTER \`event_date\`,
        ADD COLUMN \`end_date\` timestamp NULL AFTER \`start_date\`,
        ADD COLUMN \`status\` enum('active','disabled') DEFAULT 'active' AFTER \`end_date\`
      `);
      await connection.query(`UPDATE \`events\` SET start_date = event_date, end_date = event_date WHERE start_date IS NULL`);
      console.log('✅ start_date, end_date, status columns added to events');
    }

    console.log('\n✅ Events migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigration().catch((err) => {
  console.error(err);
  process.exit(1);
});
