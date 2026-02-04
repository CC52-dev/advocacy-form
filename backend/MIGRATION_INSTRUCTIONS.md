# Database Migration Instructions

## Role-Based System Migration

This migration adds the new `roles` and `user_roles` tables to support the dynamic role-based permission system.

### Migration File
The migration file is located at: `backend/drizzle/0002_roles_migration.sql`

### Steps to Apply Migration

**Recommended:** Use the migration runner script (handles errors gracefully):

```bash
cd backend
npm run db:migrate:manual
```

This will:
- Read the migration SQL file
- Execute each statement
- Skip any that already exist (safe to run multiple times)

**Alternative Options:**

1. **Manual SQL Execution**
   - Connect to your MySQL database using your preferred tool (MySQL Workbench, phpMyAdmin, etc.)
   - Run the SQL commands from `backend/drizzle/0002_roles_migration.sql`
   - The migration uses `CREATE TABLE IF NOT EXISTS` so it's safe to run even if tables exist
   - Foreign key constraints will fail gracefully if they already exist

2. **Using Drizzle Push** (May have compatibility issues)
   ```bash
   cd backend
   npm run db:push
   ```
   Note: This may fail with drizzle-kit compatibility errors. Use the migration runner instead.

### After Migration

1. **Seed Default Roles**
   ```bash
   cd backend
   npm run db:seed
   ```
   
   This will create the following default roles:
   - **Admin**: Has `admin` permission (all access)
   - **Admin Viewer**: Has `applicants.read`, `users.read` (read-only access)
   - **Applicant**: Exclusive role (no permissions)
   - **Disabled**: Exclusive role (no permissions, cannot log in)

2. **Migrate Existing Users to Roles**
   ```bash
   cd backend
   npm run db:migrate:users
   ```
   
   This will assign roles to all existing users based on their `type` field:
   - `admin` → **Admin** role (full access)
   - `adminviewer` → **Admin Viewer** role (read-only: applicants.read, users.read)
   - `applicant` → **Applicant** role (exclusive)
   - `disabled` → **Disabled** role (exclusive, cannot log in)
   - `user` → No default role (can be assigned manually)
   
   **Note:** This migration is idempotent and safe to run multiple times. It will skip users that already have the correct role assigned.

### Migration Contents

The migration creates:
- `roles` table: Stores role definitions with permissions, is_protected, and is_exclusive flags
- `user_roles` table: Many-to-many relationship between users and roles with unique constraint on (user_id, role_id)

### Important Notes

- The `users.type` enum field is kept for backward compatibility
- Existing users will need to be migrated to use roles (see migration script in plan)
- The migration is safe to run multiple times (it checks if tables exist)
