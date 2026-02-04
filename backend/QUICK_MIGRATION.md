# Quick Migration Guide

## 🚀 One-Command Migration

Run all migrations automatically with a single command:

```bash
cd backend
npm run db:migrate:all
```

This script will:
1. ✅ **Automatically backup** your database first
2. ✅ **Detect** what migrations are needed
3. ✅ **Run** all necessary migrations in the correct order
4. ✅ **Seed** default data where needed
5. ✅ **Report** what was done

## What It Does

The master migration script intelligently:

- **Checks existing tables** to determine what needs to be migrated
- **Runs only necessary migrations** (skips what's already done)
- **Handles errors gracefully** (idempotent - safe to run multiple times)
- **Creates automatic backups** before making changes
- **Provides clear progress** and final summary

## Migration Steps (Automatic)

The script will run these steps as needed:

1. **Database Backup** - Creates timestamped backup
2. **Initial Roles Migration** - If `roles` or `user_roles` tables don't exist
3. **Application RBAC Migration** - If `applications` or `application_user_roles` tables don't exist
4. **Simplified Roles Migration** - If old role structure exists (with foreign keys to `roles` table)
5. **Seed Default Roles** - Seeds default roles if needed

## Usage

### First Time Setup

```bash
cd backend
npm run db:migrate:all
```

### Update Existing Database

```bash
cd backend
npm run db:migrate:all
```

The script is smart enough to:
- Skip migrations that are already done
- Only run what's needed
- Handle partial migrations

### After Migration

1. **Verify** the migration worked:
   - Check the final summary output
   - Review the tables list

2. **Test** your application:
   - Make sure everything works
   - Test user login/permissions
   - Test application features

3. **Optional cleanup** (only after verification):
   ```bash
   npm run db:drop:roles
   ```

## Example Output

```
🚀 Starting Complete Database Migration
============================================================
Database: advocacy_db
Host: localhost:3306
============================================================

📦 Step 1: Creating database backup...
✅ Backup created: backend/backups/advocacy_db_backup_2024-01-15_14-30-45.sql
   Size: 2.45 MB

🔌 Connecting to database...
✅ Connected to database

📊 Found 5 existing tables

📋 Found 3 migration step(s) to execute

🔄 Step 2/4: Application RBAC Migration
   Creating applications and RBAC tables
✅ Application RBAC Migration completed successfully

🔄 Step 3/4: Simplified Roles Migration
   Migrating from old roles structure to simplified structure
✅ Simplified Roles Migration completed successfully

🔄 Step 4/4: Seed Default Roles
   Seeding default roles if needed
✅ Seed Default Roles completed successfully

============================================================
✅ All migrations completed successfully!
============================================================

📊 Final database state:
   Tables: 12
   - application_sessions
   - application_user_roles
   - applications
   - sessions
   - user_roles
   - users
   ...

💡 Next steps:
   1. Verify the migration worked correctly
   2. Test your application
   3. If everything works, you can optionally clean up old tables:
      npm run db:drop:roles

⚠️  Remember: Keep your backup until you're confident everything works!
```

## Troubleshooting

### "mysqldump not found"

The script will continue without a backup, but you should create one manually:
```bash
npm run db:backup
```

### Migration fails partway through

1. Check the error message
2. Restore from backup if needed:
   ```bash
   mysql -h {DB_HOST} -P {DB_PORT} -u {DB_USER} -p {DB_NAME} < "backups/{backup_file}.sql"
   ```
3. Fix the issue and run again (script is idempotent)

### "Table already exists" warnings

These are normal - the script skips creating tables that already exist.

## Manual Migration (Alternative)

If you prefer to run migrations step-by-step:

```bash
# 1. Backup
npm run db:backup

# 2. Run specific migrations
npm run db:migrate:manual      # Initial roles
npm run db:migrate:rbac        # Application RBAC
npm run db:migrate:simplify    # Simplified roles
npm run db:seed:simplified     # Seed data
```

## Safety Features

✅ **Automatic backups** before migrations
✅ **Idempotent** - safe to run multiple times
✅ **Error handling** - graceful failure with clear messages
✅ **Progress reporting** - see what's happening
✅ **Final summary** - review what was done

## When to Use

- ✅ **New database setup** - Run once to set everything up
- ✅ **Updating existing database** - Run to apply new migrations
- ✅ **After pulling code changes** - Run to sync database schema
- ✅ **Development environment** - Run to reset/update schema

**The script is smart - it only runs what's needed!** 🎯
