import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
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
    
    console.log("⚠️  WARNING: This will modify your database structure!");
    console.log("⚠️  Make sure you have a database backup before proceeding.\n");
    
    console.log("Reading migration file...");
    const migrationPath = path.join(__dirname, "../../drizzle/0002_roles_migration.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");
    
    // Split by statement breakpoints and execute each statement
    const statements = migrationSQL
      .split("--> statement-breakpoint")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"));
    
    console.log(`Found ${statements.length} statements to execute\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        try {
          await db.execute(sql.raw(statement));
          console.log(`✓ Statement ${i + 1} executed successfully\n`);
        } catch (error: any) {
          // Ignore errors for IF NOT EXISTS or duplicate constraint errors
          const errorCode = error.code || '';
          const errorMessage = error.message || error.sqlMessage || '';
          
          if (
            errorCode === "ER_TABLE_EXISTS_ERROR" ||
            errorCode === "ER_DUP_KEYNAME" ||
            errorCode === "ER_DUP_FIELDNAME" ||
            errorCode === "ER_DUP_ENTRY" ||
            errorCode === "ER_DUP_CONSTRAINT_NAME" ||
            errorCode === "ER_CANT_CREATE_TABLE" || // Sometimes FK constraints return this if they exist
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
    
    console.log("✅ Migration completed successfully!");
    
    // Also run seed if migration was successful
    console.log("\nSeeding default roles...");
    const seedPath = path.join(__dirname, "seedRoles.sql");
    if (fs.existsSync(seedPath)) {
      const seedSQL = fs.readFileSync(seedPath, "utf-8");
      const seedStatements = seedSQL
        .split(";")
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith("--"));
      
      for (let i = 0; i < seedStatements.length; i++) {
        const statement = seedStatements[i];
        if (statement.trim()) {
          try {
            await db.execute(sql.raw(statement + ";"));
            console.log(`✓ Seeded role ${i + 1}/${seedStatements.length}`);
          } catch (error: any) {
            console.log(`⚠ Seed statement ${i + 1} skipped (${error.code || 'already exists'})`);
          }
        }
      }
      console.log("✅ Roles seeded successfully!");
    }
    
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

runMigration();
