import 'dotenv/config';
import mysql from "mysql2/promise";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Database Backup Script
 * Creates a full MySQL database backup using mysqldump
 */
async function backupDatabase() {
  let pool: mysql.Pool | null = null;
  
  try {
    const dbHost = process.env.DB_HOST || "localhost";
    const dbPort = process.env.DB_PORT || "3306";
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const dbName = process.env.DB_NAME;

    // Validate required environment variables
    if (!dbUser || !dbPassword || !dbName) {
      console.error("❌ Missing required environment variables:");
      if (!dbUser) console.error("  - DB_USER");
      if (!dbPassword) console.error("  - DB_PASSWORD");
      if (!dbName) console.error("  - DB_NAME");
      process.exit(1);
    }

    console.log("📦 Starting database backup...");
    console.log(`   Database: ${dbName}`);
    console.log(`   Host: ${dbHost}:${dbPort}\n`);

    // Create backups directory if it doesn't exist
    const backupsDir = path.join(__dirname, "../../backups");
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
      console.log(`✓ Created backups directory: ${backupsDir}\n`);
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const backupFilename = `${dbName}_backup_${timestamp}.sql`;
    const backupPath = path.join(backupsDir, backupFilename);

    // Build mysqldump command
    // Note: mysqldump must be in PATH or provide full path
    // Using environment variable for password to avoid exposing it in process list
    const env = { ...process.env, MYSQL_PWD: dbPassword };
    const mysqldumpCmd = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} ${dbName}`;

    console.log("🔄 Running mysqldump...");
    console.log(`   Output: ${backupPath}\n`);

    try {
      // Execute mysqldump with password in environment variable
      const { stdout } = await execAsync(mysqldumpCmd, { 
        env,
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large databases
      });
      
      // Write output to file
      fs.writeFileSync(backupPath, stdout);
      
      // Check if backup file was created and has content
      if (!fs.existsSync(backupPath)) {
        throw new Error("Backup file was not created");
      }

      const stats = fs.statSync(backupPath);
      if (stats.size === 0) {
        throw new Error("Backup file is empty");
      }

      console.log("✅ Database backup completed successfully!");
      console.log(`\n📁 Backup saved to: ${backupPath}`);
      console.log(`📊 Backup size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`\n💡 To restore this backup, use:`);
      console.log(`   mysql -h ${dbHost} -P ${dbPort} -u ${dbUser} -p ${dbName} < "${backupPath}"`);
      console.log(`   (You will be prompted for the password)`);
      
      // Also create a latest symlink/copy for easy access
      const latestBackupPath = path.join(backupsDir, `${dbName}_latest.sql`);
      fs.copyFileSync(backupPath, latestBackupPath);
      console.log(`\n🔗 Latest backup also saved as: ${latestBackupPath}`);
      
      process.exit(0);
    } catch (error: any) {
      // Check if mysqldump is available
      if (error.message.includes("mysqldump") || error.code === "ENOENT") {
        console.error("❌ Error: mysqldump command not found!");
        console.error("   Please ensure MySQL client tools are installed and in your PATH.");
        console.error("   On Windows, this is usually included with MySQL Server installation.");
        console.error("   On Linux/Mac, install with: sudo apt-get install mysql-client (or brew install mysql-client)");
        console.error("\n   Alternative: Use MySQL Workbench or phpMyAdmin to create a manual backup.");
        process.exit(1);
      }
      throw error;
    }
  } catch (error: any) {
    console.error("❌ Backup failed:", error.message);
    if (error.stderr) {
      console.error("   Error details:", error.stderr);
    }
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run the backup
backupDatabase();
