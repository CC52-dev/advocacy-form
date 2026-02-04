import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeedSimplified() {
  let pool: mysql.Pool | null = null;
  let db: ReturnType<typeof drizzle> | null = null;
  
  try {
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
    
    console.log("Reading seed file...");
    const seedPath = path.join(__dirname, "seedSimplifiedRoles.sql");
    const seedSQL = fs.readFileSync(seedPath, "utf-8");
    
    // Remove comments and split by semicolons
    const cleanedSQL = seedSQL
      .split('\n')
      .map(line => {
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
          console.log(`✓ Statement ${i + 1} executed successfully\n`);
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
            errorMessage.includes("already exists")
          ) {
            console.log(`⚠ Statement ${i + 1} skipped (${errorCode || 'already exists'})\n`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, errorCode, errorMessage);
            throw error;
          }
        }
      }
    }
    
    console.log("✅ Simplified roles seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

runSeedSimplified();
