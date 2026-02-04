import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MigrationStep {
  name: string;
  description: string;
  run: () => Promise<void>;
  optional?: boolean;
}

/**
 * Master Migration Script
 * Runs all migrations in the correct order with automatic backups
 */
async function runAllMigrations() {
  let pool: mysql.Pool | null = null;
  let db: ReturnType<typeof drizzle> | null = null;
  
  try {
    // Validate environment variables
    const dbHost = process.env.DB_HOST || "localhost";
    const dbPort = parseInt(process.env.DB_PORT || "3306");
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const dbName = process.env.DB_NAME;

    if (!dbUser || !dbPassword || !dbName) {
      console.error("❌ Missing required environment variables:");
      if (!dbUser) console.error("  - DB_USER");
      if (!dbPassword) console.error("  - DB_PASSWORD");
      if (!dbName) console.error("  - DB_NAME");
      process.exit(1);
    }

    console.log("🚀 Starting Complete Database Migration");
    console.log("=" .repeat(60));
    console.log(`Database: ${dbName}`);
    console.log(`Host: ${dbHost}:${dbPort}`);
    console.log("=" .repeat(60));
    console.log("");

    // Step 1: Create database backup
    console.log("📦 Step 1: Creating database backup...");
    try {
      const backupsDir = path.join(__dirname, "../../backups");
      if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
      const backupFilename = `${dbName}_backup_${timestamp}.sql`;
      const backupPath = path.join(backupsDir, backupFilename);

      const env = { ...process.env, MYSQL_PWD: dbPassword };
      const mysqldumpCmd = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} ${dbName}`;
      
      const { stdout } = await execAsync(mysqldumpCmd, { 
        env,
        maxBuffer: 10 * 1024 * 1024
      });
      
      fs.writeFileSync(backupPath, stdout);
      const stats = fs.statSync(backupPath);
      
      if (stats.size === 0) {
        console.log("⚠️  Backup file is empty (database might be empty)");
      } else {
        console.log(`✅ Backup created: ${backupPath}`);
        console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB\n`);
      }
    } catch (error: any) {
      if (error.message.includes("mysqldump") || error.code === "ENOENT") {
        console.log("⚠️  Warning: mysqldump not found - skipping backup");
        console.log("   Please create a manual backup before proceeding!\n");
      } else {
        console.log("⚠️  Warning: Backup failed - continuing anyway");
        console.log(`   Error: ${error.message}\n`);
      }
    }

    // Create database connection
    console.log("🔌 Connecting to database...");
    pool = mysql.createPool({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    db = drizzle(pool);
    console.log("✅ Connected to database\n");

    // Check what tables exist
    const [tables] = await db.execute(sql`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `) as any[];

    const existingTables = new Set((tables || []).map((t: any) => t.TABLE_NAME));
    console.log(`📊 Found ${existingTables.size} existing tables\n`);

    // Define migration steps
    const steps: MigrationStep[] = [];

    // Step 2: Initial roles migration (if needed)
    if (!existingTables.has('roles') || !existingTables.has('user_roles')) {
      steps.push({
        name: "Initial Roles Migration",
        description: "Creating roles and user_roles tables",
        run: async () => {
          const migrationPath = path.join(__dirname, "../../drizzle/0002_roles_migration.sql");
          if (fs.existsSync(migrationPath)) {
            const migrationSQL = fs.readFileSync(migrationPath, "utf-8");
            const statements = migrationSQL
              .split("--> statement-breakpoint")
              .map(s => s.trim())
              .filter(s => s.length > 0 && !s.startsWith("--"));
            
            for (const statement of statements) {
              if (statement.trim()) {
                try {
                  await db.execute(sql.raw(statement));
                } catch (error: any) {
                  const errorCode = error.code || '';
                  if (!errorCode.startsWith("ER_DUP_") && !error.message.includes("already exists")) {
                    throw error;
                  }
                }
              }
            }
          }
        }
      });
    }

    // Step 3: Application RBAC migration (if needed)
    if (!existingTables.has('applications') || !existingTables.has('application_user_roles')) {
      steps.push({
        name: "Application RBAC Migration",
        description: "Creating applications and RBAC tables",
        run: async () => {
          // Check if applications table exists
          const [appTables] = await db.execute(sql`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'applications'
          `) as any[];

          if (appTables.length === 0) {
            await db.execute(sql.raw(`
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
            `));
          } else {
            // Check if roles_definition column exists
            const [columns] = await db.execute(sql`
              SELECT COLUMN_NAME 
              FROM INFORMATION_SCHEMA.COLUMNS 
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'applications' AND COLUMN_NAME = 'roles_definition'
            `) as any[];

            if (columns.length === 0) {
              await db.execute(sql.raw(`
                ALTER TABLE \`applications\` 
                ADD COLUMN \`roles_definition\` json NOT NULL DEFAULT (JSON_OBJECT('roles', JSON_ARRAY()))
              `));
            }
          }

          // Create application_user_roles table
          const [aurTables] = await db.execute(sql`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'application_user_roles'
          `) as any[];

          if (aurTables.length === 0) {
            await db.execute(sql.raw(`
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
            `));

            await db.execute(sql.raw(`CREATE INDEX \`idx_app_user_roles_user\` ON \`application_user_roles\` (\`user_id\`)`));
            await db.execute(sql.raw(`CREATE INDEX \`idx_app_user_roles_app\` ON \`application_user_roles\` (\`application_id\`)`));
          }

          // Create application_sessions table
          const [asTables] = await db.execute(sql`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'application_sessions'
          `) as any[];

          if (asTables.length === 0) {
            await db.execute(sql.raw(`
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
            `));

            await db.execute(sql.raw(`CREATE INDEX \`idx_app_sessions_token\` ON \`application_sessions\` (\`token\`)`));
            await db.execute(sql.raw(`CREATE INDEX \`idx_app_sessions_user\` ON \`application_sessions\` (\`user_id\`)`));
            await db.execute(sql.raw(`CREATE INDEX \`idx_app_sessions_expires\` ON \`application_sessions\` (\`expires_at\`)`));
          }

          // Add user_session_id column if it doesn't exist
          const [usidColumns] = await db.execute(sql`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'application_sessions' AND COLUMN_NAME = 'user_session_id'
          `) as any[];

          if (usidColumns.length === 0) {
            await db.execute(sql.raw(`
              ALTER TABLE application_sessions 
              ADD COLUMN user_session_id VARCHAR(255) NULL
            `));
          }
        }
      });
    }

    // Step 4: Simplified roles migration (if old structure exists)
    if (existingTables.has('roles') && existingTables.has('user_roles')) {
      // Check if it's the old structure (has role_id foreign key)
      const [fkCheck] = await db.execute(sql`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'user_roles' 
          AND REFERENCED_TABLE_NAME = 'roles'
        LIMIT 1
      `) as any[];

      if (fkCheck.length > 0) {
        steps.push({
          name: "Simplified Roles Migration",
          description: "Migrating from old roles structure to simplified structure",
          run: async () => {
            const migrationPath = path.join(__dirname, "migrateToSimplifiedRoles.sql");
            const migrationSQL = fs.readFileSync(migrationPath, "utf-8");
            
            const cleanedSQL = migrationSQL
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
            
            for (const statement of statements) {
              if (statement.trim()) {
                try {
                  await db.execute(sql.raw(statement + ";"));
                } catch (error: any) {
                  const errorCode = error.code || '';
                  const errorMessage = error.message || error.sqlMessage || '';
                  
                  if (
                    errorCode === "ER_TABLE_EXISTS_ERROR" ||
                    errorCode.startsWith("ER_DUP_") ||
                    errorMessage.includes("Duplicate") ||
                    errorMessage.includes("already exists")
                  ) {
                    // Skip - already exists
                  } else {
                    throw error;
                  }
                }
              }
            }
          }
        });
      }
    }

    // Step 5: Migrate user types to roles (if users table has type column and user_roles exists)
    // This should run after simplified migration to ensure we're using the new structure
    if (existingTables.has('users') && existingTables.has('user_roles')) {
      // Check if users table has type column
      const [typeColumn] = await db.execute(sql`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'users' 
          AND COLUMN_NAME = 'type'
      `) as any[];

      if (typeColumn.length > 0) {
        // Check if user_roles table has the simplified structure (role_title column)
        const [roleTitleColumn] = await db.execute(sql`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'user_roles' 
            AND COLUMN_NAME = 'role_title'
        `) as any[];

        if (roleTitleColumn.length > 0) {
          // Always add this step - it will check and assign roles based on type
          steps.push({
            name: "Migrate User Types to Roles",
            description: "Assigning roles to users based on their type field",
            run: async () => {
              // First check if there are any users with types
              const [usersWithTypes] = await db.execute(sql`
                SELECT COUNT(*) as count
                FROM users u
                WHERE u.type IN ('admin', 'adminviewer', 'applicant', 'disabled')
              `) as any[];

              const totalUsersWithTypes = usersWithTypes[0]?.count || 0;
              
              if (totalUsersWithTypes === 0) {
                console.log("   ℹ️  No users with types found - skipping");
                return;
              }

              console.log(`   Found ${totalUsersWithTypes} user(s) with types - assigning roles...`);
              
              // Assign Admin role to users with type='admin'
              const [adminResult] = await db.execute(sql.raw(`
                INSERT INTO \`user_roles\` (\`user_id\`, \`role_title\`, \`permissions\`)
                SELECT u.id, 'Admin', JSON_ARRAY('admin')
                FROM \`users\` u
                WHERE u.type = 'admin'
                  AND NOT EXISTS (
                    SELECT 1 FROM \`user_roles\` ur 
                    WHERE ur.user_id = u.id AND ur.role_title = 'Admin'
                  )
              `)) as any[];
              const adminAssigned = adminResult?.affectedRows || 0;

              // Assign Admin Viewer role to users with type='adminviewer'
              const [adminViewerResult] = await db.execute(sql.raw(`
                INSERT INTO \`user_roles\` (\`user_id\`, \`role_title\`, \`permissions\`)
                SELECT u.id, 'Admin Viewer', JSON_ARRAY('applicants.read', 'users.read')
                FROM \`users\` u
                WHERE u.type = 'adminviewer'
                  AND NOT EXISTS (
                    SELECT 1 FROM \`user_roles\` ur 
                    WHERE ur.user_id = u.id AND ur.role_title = 'Admin Viewer'
                  )
              `)) as any[];
              const adminViewerAssigned = adminViewerResult?.affectedRows || 0;

              // Assign Applicant role to users with type='applicant' (exclusive)
              // First remove any existing roles for applicants
              await db.execute(sql.raw(`
                DELETE ur FROM \`user_roles\` ur
                INNER JOIN \`users\` u ON ur.user_id = u.id
                WHERE u.type = 'applicant' AND ur.role_title != 'Applicant'
              `));

              const [applicantResult] = await db.execute(sql.raw(`
                INSERT INTO \`user_roles\` (\`user_id\`, \`role_title\`, \`permissions\`)
                SELECT u.id, 'Applicant', JSON_ARRAY('applicant')
                FROM \`users\` u
                WHERE u.type = 'applicant'
                  AND NOT EXISTS (
                    SELECT 1 FROM \`user_roles\` ur 
                    WHERE ur.user_id = u.id AND ur.role_title = 'Applicant'
                  )
              `)) as any[];
              const applicantAssigned = applicantResult?.affectedRows || 0;

              // Assign Disabled role to users with type='disabled' (exclusive)
              // First remove any existing roles for disabled users
              await db.execute(sql.raw(`
                DELETE ur FROM \`user_roles\` ur
                INNER JOIN \`users\` u ON ur.user_id = u.id
                WHERE u.type = 'disabled' AND ur.role_title != 'Disabled'
              `));

              const [disabledResult] = await db.execute(sql.raw(`
                INSERT INTO \`user_roles\` (\`user_id\`, \`role_title\`, \`permissions\`)
                SELECT u.id, 'Disabled', JSON_ARRAY('disabled')
                FROM \`users\` u
                WHERE u.type = 'disabled'
                  AND NOT EXISTS (
                    SELECT 1 FROM \`user_roles\` ur 
                    WHERE ur.user_id = u.id AND ur.role_title = 'Disabled'
                  )
              `)) as any[];
              const disabledAssigned = disabledResult?.affectedRows || 0;

              const totalAssigned = adminAssigned + adminViewerAssigned + applicantAssigned + disabledAssigned;
              console.log(`   ✅ Assigned roles: ${adminAssigned} admins, ${adminViewerAssigned} admin viewers, ${applicantAssigned} applicants, ${disabledAssigned} disabled users`);
              
              if (totalAssigned === 0) {
                console.log("   ℹ️  All users with types already have roles assigned");
              }
            }
          });
        } else {
          console.log("   ⚠️  Old user_roles structure detected - simplified migration should run first");
        }
      } else {
        console.log("   ℹ️  Users table doesn't have 'type' column - skipping user type migration");
      }
    }

    // Step 6: Seed default roles (if user_roles table exists)
    // This ensures all users with types have roles, even if step 5 didn't run
    if (existingTables.has('user_roles')) {
      // Check if user_roles has simplified structure
      const [roleTitleColumn] = await db.execute(sql`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'user_roles' 
          AND COLUMN_NAME = 'role_title'
      `) as any[];

      if (roleTitleColumn.length > 0) {
        // Check if users table has type column
        const [typeColumn] = await db.execute(sql`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME = 'type'
        `) as any[];

        if (typeColumn.length > 0) {
          // Check if there are users with types that need roles
          const [usersNeedingRoles] = await db.execute(sql`
            SELECT COUNT(*) as count
            FROM users u
            WHERE u.type IN ('admin', 'adminviewer', 'applicant', 'disabled')
              AND NOT EXISTS (
                SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id
              )
          `) as any[];

          const needsRoles = usersNeedingRoles[0]?.count > 0;

          if (needsRoles) {
            steps.push({
              name: "Ensure User Types Have Roles",
              description: "Assigning roles to any users with types that don't have roles yet",
              run: async () => {
                console.log(`   Found ${usersNeedingRoles[0]?.count || 0} user(s) with types that need roles`);
                
                // Use the seed script which checks user types
                const seedPath = path.join(__dirname, "seedSimplifiedRoles.sql");
                if (fs.existsSync(seedPath)) {
                  const seedSQL = fs.readFileSync(seedPath, "utf-8");
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
                  
                  let totalAssigned = 0;
                  for (const statement of statements) {
                    if (statement.trim()) {
                      try {
                        const result = await db.execute(sql.raw(statement + ";")) as any;
                        const affectedRows = result?.affectedRows || 0;
                        if (affectedRows > 0) {
                          totalAssigned += affectedRows;
                        }
                      } catch (error: any) {
                        const errorCode = error.code || '';
                        if (
                          errorCode === "ER_DUP_ENTRY" ||
                          errorCode.startsWith("ER_DUP_") ||
                          error.message.includes("Duplicate") ||
                          error.message.includes("already exists")
                        ) {
                          // Skip - already exists
                        } else {
                          throw error;
                        }
                      }
                    }
                  }
                  
                  if (totalAssigned > 0) {
                    console.log(`   ✅ Assigned roles to ${totalAssigned} user(s) based on their type`);
                  } else {
                    console.log(`   ℹ️  All users with types already have roles assigned`);
                  }
                }
              }
            });
          }
        }
      }
    }

    // Run all migration steps
    console.log(`📋 Found ${steps.length} migration step(s) to execute\n`);
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log(`🔄 Step ${i + 2}/${steps.length + 1}: ${step.name}`);
      console.log(`   ${step.description}`);
      
      try {
        await step.run();
        console.log(`✅ ${step.name} completed successfully\n`);
      } catch (error: any) {
        if (step.optional) {
          console.log(`⚠️  ${step.name} skipped (optional step failed: ${error.message})\n`);
        } else {
          console.error(`❌ ${step.name} failed:`, error.message);
          throw error;
        }
      }
    }

    // Final verification: Check user_roles table
    console.log("\n📊 Verifying migration results...");
    try {
      const [userRolesCount] = await db.execute(sql`
        SELECT COUNT(*) as count FROM user_roles
      `) as any[];
      const [usersWithTypes] = await db.execute(sql`
        SELECT COUNT(*) as count FROM users WHERE type IN ('admin', 'adminviewer', 'applicant', 'disabled')
      `) as any[];
      
      const rolesCount = userRolesCount[0]?.count || 0;
      const typesCount = usersWithTypes[0]?.count || 0;
      
      console.log(`   Users with types: ${typesCount}`);
      console.log(`   Roles assigned: ${rolesCount}`);
      
      if (typesCount > 0 && rolesCount === 0) {
        console.log("\n⚠️  WARNING: Users with types exist but no roles were assigned!");
        console.log("   This might indicate the user type migration step didn't run.");
        console.log("   You may need to manually run the user type migration.");
      } else if (typesCount > 0 && rolesCount < typesCount) {
        console.log(`\n⚠️  WARNING: Some users with types don't have roles assigned (${typesCount} users, ${rolesCount} roles)`);
      } else if (typesCount > 0 && rolesCount >= typesCount) {
        console.log("   ✅ All users with types have roles assigned");
      }
    } catch (error: any) {
      console.log("   ⚠️  Could not verify migration results:", error.message);
    }

    // Final summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ All migrations completed successfully!");
    console.log("=".repeat(60));
    console.log("\n📊 Final database state:");
    
    const [finalTables] = await db.execute(sql`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `) as any[];

    console.log(`   Tables: ${finalTables.length}`);
    finalTables.forEach((table: any) => {
      console.log(`   - ${table.TABLE_NAME}`);
    });
    
    console.log("\n💡 Next steps:");
    console.log("   1. Verify the migration worked correctly");
    console.log("   2. Test your application");
    console.log("   3. If everything works, you can optionally clean up old tables:");
    console.log("      npm run db:drop:roles");
    console.log("\n⚠️  Remember: Keep your backup until you're confident everything works!");
    
    process.exit(0);
  } catch (error: any) {
    console.error("\n" + "=" .repeat(60));
    console.error("❌ Migration failed!");
    console.error("=" .repeat(60));
    console.error("Error:", error.message);
    console.error("\n💡 You can restore from backup if needed:");
    console.error("   Check the backups/ directory for your backup file");
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run the migration
runAllMigrations();
