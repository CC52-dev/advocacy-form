import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runFixPermissions() {
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
    
    console.log("⚠️  WARNING: This will modify permissions data!");
    console.log("⚠️  Make sure you have a database backup before proceeding.\n");
    
    console.log("Reading fix permissions SQL file...");
    const sqlPath = path.join(__dirname, "fixPermissionsFormat.sql");
    const sqlContent = fs.readFileSync(sqlPath, "utf-8");
    
    // Split by semicolons and execute each statement
    const cleanedSQL = sqlContent
      .split('\n')
      .map(line => {
        // Remove inline comments
        const commentIndex = line.indexOf('--');
        if (commentIndex >= 0) {
          return line.substring(0, commentIndex).trim();
        }
        return line.trim();
      })
      .filter(line => line.length > 0 && !line.startsWith('--'))
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
          console.log(`✓ Statement ${i + 1} executed successfully\n`);
        } catch (error: any) {
          const errorCode = error.code || '';
          const errorMessage = error.message || error.sqlMessage || '';
          
          // Some errors are expected (e.g., if no rows match the condition)
          if (
            errorCode === "ER_BAD_FIELD_ERROR" ||
            errorMessage.includes("Unknown column") ||
            errorMessage.includes("doesn't exist")
          ) {
            console.log(`⚠ Statement ${i + 1} skipped (${errorCode || 'no matching rows'})\n`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, errorCode, errorMessage);
            throw error;
          }
        }
      }
    }
    
    console.log("✅ Permissions format fix completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Fix failed:", error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

runFixPermissions();
