import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runUserMigration() {
  let pool: mysql.Pool | null = null;
  let db: ReturnType<typeof drizzle> | null = null;
  
  try {
    // Create database connection
    console.log("Connecting to database...");
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    db = drizzle(pool);
    console.log("✓ Connected to database\n");
    
    console.log("⚠️  WARNING: This will modify user data!");
    console.log("⚠️  Make sure you have a database backup before proceeding.\n");
    
    console.log("Reading user migration file...");
    const migrationPath = path.join(__dirname, "migrateUserTypesToRoles.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");
    
    // Split by semicolons and execute each statement
    // Remove comments first, then split by semicolons
    const cleanedSQL = migrationSQL
      .split('\n')
      .map(line => {
        // Remove inline comments
        const commentIndex = line.indexOf('--');
        if (commentIndex >= 0) {
          return line.substring(0, commentIndex).trim();
        }
        return line.trim();
      })
      .filter(line => line.length > 0)
      .join(' ');
    
    const statements = cleanedSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`Found ${statements.length} statements to execute\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        try {
          await db.execute(sql.raw(statement + ";"));
          // Try to get affected rows (MySQL specific)
          try {
            const result = await db.execute(sql`SELECT ROW_COUNT() as count`);
            const affectedRows = (result as any)[0]?.count || 0;
            if (affectedRows > 0) {
              console.log(`✓ Statement ${i + 1} executed successfully (affected rows)\n`);
            } else {
              console.log(`✓ Statement ${i + 1} executed successfully\n`);
            }
          } catch {
            console.log(`✓ Statement ${i + 1} executed successfully\n`);
          }
        } catch (error: any) {
          const errorCode = error.code || '';
          const errorMessage = error.message || error.sqlMessage || '';
          
          if (
            errorCode === "ER_TABLE_EXISTS_ERROR" ||
            errorCode === "ER_DUP_KEYNAME" ||
            errorCode === "ER_DUP_FIELDNAME" ||
            errorCode === "ER_DUP_ENTRY" ||
            errorCode === "ER_DUP_CONSTRAINT_NAME" ||
            errorCode === "ER_CANT_CREATE_TABLE" ||
            errorCode.startsWith("ER_DUP_") ||
            errorMessage.includes("Duplicate") ||
            errorMessage.includes("already exists") ||
            errorMessage.includes("Duplicate key") ||
            errorMessage.includes("Duplicate entry") ||
            errorMessage.includes("constraint already exists")
          ) {
            console.log(`⚠ Statement ${i + 1} skipped (${errorCode || 'already exists'})\n`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, errorCode, errorMessage);
            throw error;
          }
        }
      }
    }
    
    console.log("✅ User type to role migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

runUserMigration();
