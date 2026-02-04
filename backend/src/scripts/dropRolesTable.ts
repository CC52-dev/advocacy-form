import db from "../db/db.js";
import { sql } from "drizzle-orm";

/**
 * Script to safely drop the roles table
 * This removes the foreign key constraint first, then drops the table
 */
async function dropRolesTable() {
  try {
    console.log("⚠️  WARNING: This will PERMANENTLY DELETE the roles table!");
    console.log("⚠️  This action is IRREVERSIBLE!");
    console.log("⚠️  Make sure you have verified the simplified migration worked correctly.");
    console.log("⚠️  Make sure you have a database backup before proceeding.\n");
    console.log("Starting to drop roles table...");

    // Step 1: Check what foreign keys exist on user_roles table
    console.log("Checking foreign keys on user_roles table...");
    const foreignKeys = await db.execute(
      sql`SELECT CONSTRAINT_NAME 
          FROM information_schema.KEY_COLUMN_USAGE 
          WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'user_roles' 
            AND REFERENCED_TABLE_NAME = 'roles'`
    ) as any[];

    if (Array.isArray(foreignKeys) && foreignKeys.length > 0) {
      // Get the actual constraint name
      const constraintName = foreignKeys[0]?.CONSTRAINT_NAME;
      
      if (constraintName) {
        console.log(`Found foreign key constraint: ${constraintName}`);
        console.log("Dropping foreign key constraint...");
        try {
          await db.execute(
            sql.raw(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`${constraintName}\``)
          );
          console.log("✅ Foreign key constraint dropped successfully");
        } catch (error: any) {
          console.error("⚠️  Error dropping foreign key:", error.message);
          // Continue anyway - might already be dropped
        }
      }
    } else {
      console.log("ℹ️  No foreign key constraint found referencing roles table");
    }

    // Step 2: Drop the roles table
    console.log("Dropping roles table...");
    await db.execute(sql`DROP TABLE IF EXISTS \`roles\``);
    console.log("✅ Roles table dropped successfully!");

    console.log("\n✅ All done! The roles table has been removed.");
  } catch (error) {
    console.error("❌ Error dropping roles table:", error);
    throw error;
  }
}

// Run the script
dropRolesTable()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
