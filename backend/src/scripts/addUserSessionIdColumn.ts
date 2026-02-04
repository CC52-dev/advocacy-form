import db from "../db/db.js";
import { sql } from "drizzle-orm";

async function migrate() {
  try {
    console.log("⚠️  WARNING: This will modify your database structure!");
    console.log("⚠️  Make sure you have a database backup before proceeding.\n");
    console.log("Adding user_session_id column to application_sessions table...");
    
    // Add userSessionId column to application_sessions table
    await db.execute(sql`
      ALTER TABLE application_sessions 
      ADD COLUMN user_session_id VARCHAR(255) NULL
    `);
    
    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error: any) {
    // Check if column already exists
    if (error.message?.includes("Duplicate column name")) {
      console.log("Column already exists, skipping...");
      process.exit(0);
    }
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
