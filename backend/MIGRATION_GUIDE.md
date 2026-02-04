# Database Migration Guide

This guide provides an overview of all available migration scripts and when to use them.

## ⚠️ Important: Always Backup First!

**Before running ANY migration, always create a full database backup:**

```bash
cd backend
npm run db:backup
```

This creates a timestamped backup in `backend/backups/` that you can restore if needed.

## Available Migration Scripts

### 1. Initial Roles Migration (`db:migrate:manual`)

**Purpose:** Creates the initial `roles` and `user_roles` tables for the role-based permission system.

**When to use:**
- Setting up a new database
- Adding role-based permissions to an existing system

**Command:**
```bash
npm run db:migrate:manual
```

**What it does:**
- Creates `roles` table
- Creates `user_roles` table
- Seeds default roles (Admin, Admin Viewer, Applicant, Disabled)

**Backup:** ⚠️ Creates backup warning

---

### 2. User Type to Role Migration (`db:migrate:users`)

**Purpose:** Migrates existing user types to the new role system.

**When to use:**
- Converting legacy user type system to roles
- One-time migration for existing databases

**Command:**
```bash
npm run db:migrate:users
```

**What it does:**
- Converts user types to role assignments
- Preserves existing user permissions

**Backup:** ⚠️ Creates backup warning

---

### 3. Simplified Roles Migration (`db:migrate:simplify`)

**Purpose:** Simplifies the roles structure by removing the separate `roles` table and consolidating into `user_roles`.

**When to use:**
- After initial roles migration
- To simplify the database schema
- One-time migration

**Command:**
```bash
npm run db:migrate:simplify
```

**What it does:**
- Creates `user_roles_backup` table (automatic backup)
- Creates new simplified `user_roles` table
- Migrates data from old structure
- Renames old table to `user_roles_old`
- Preserves original `roles` table

**Backup:** ⚠️ Creates backup warning + automatic table-level backup

**After migration:**
- Verify the migration worked correctly
- Test application functionality
- Only then consider dropping old tables:
  ```bash
  npm run db:drop:roles
  ```

---

### 4. Application RBAC Migration (`db:migrate:rbac`)

**Purpose:** Creates tables for application-level RBAC (Role-Based Access Control).

**When to use:**
- Setting up multi-application support
- Adding application-specific permissions
- One-time setup

**Command:**
```bash
npm run db:migrate:rbac
```

**What it does:**
- Creates `applications` table (if not exists)
- Adds `roles_definition` column to applications
- Creates `application_user_roles` table
- Creates `application_sessions` table
- Creates necessary indexes

**Backup:** ⚠️ Creates backup warning

---

### 5. Fix Permissions Format (`db:fix:permissions`)

**Purpose:** Fixes permissions format in existing role data.

**When to use:**
- If permissions are stored in incorrect format
- Data cleanup/migration

**Command:**
```bash
npm run db:fix:permissions
```

**What it does:**
- Updates permissions JSON format
- Fixes any format inconsistencies

**Backup:** ⚠️ Creates backup warning

---

### 6. Add User Session ID Column (`addUserSessionIdColumn.ts`)

**Purpose:** Adds `user_session_id` column to `application_sessions` table.

**When to use:**
- Adding session tracking functionality
- One-time schema update

**Command:**
```bash
npx ts-node --esm src/scripts/addUserSessionIdColumn.ts
```

**What it does:**
- Adds `user_session_id VARCHAR(255)` column
- Safe to run multiple times (skips if column exists)

**Backup:** ⚠️ Creates backup warning

---

## Seeding Scripts

### Seed Default Roles (`db:seed`)

**Purpose:** Seeds default roles for the old role system.

**Command:**
```bash
npm run db:seed
```

**When to use:** After initial roles migration

---

### Seed Simplified Roles (`db:seed:simplified`)

**Purpose:** Seeds default roles for the simplified role system.

**Command:**
```bash
npm run db:seed:simplified
```

**When to use:** After simplified roles migration

---

## Utility Scripts

### Drop Roles Table (`db:drop:roles`)

**Purpose:** Safely drops the old `roles` table after migration verification.

**Command:**
```bash
npm run db:drop:roles
```

**When to use:**
- **ONLY** after verifying simplified migration worked correctly
- Removes foreign key constraints first
- Then drops the table

**⚠️ Warning:** This is irreversible! Only run after thorough testing.

---

## Migration Workflow

### For New Database Setup:

1. **Backup** (if database has data):
   ```bash
   npm run db:backup
   ```

2. **Run initial migration:**
   ```bash
   npm run db:migrate:manual
   ```

3. **Seed default roles:**
   ```bash
   npm run db:seed
   ```

4. **Run simplified migration (optional but recommended):**
   ```bash
   npm run db:migrate:simplify
   ```

5. **Seed simplified roles:**
   ```bash
   npm run db:seed:simplified
   ```

6. **Set up Application RBAC (if needed):**
   ```bash
   npm run db:migrate:rbac
   ```

### For Existing Database:

1. **Backup:**
   ```bash
   npm run db:backup
   ```

2. **Migrate user types to roles:**
   ```bash
   npm run db:migrate:users
   ```

3. **Run simplified migration:**
   ```bash
   npm run db:migrate:simplify
   ```

4. **Verify and test**

5. **Clean up old tables (after verification):**
   ```bash
   npm run db:drop:roles
   ```

## Error Handling

All migration scripts:
- ✅ Handle duplicate/already exists errors gracefully
- ✅ Can be run multiple times safely (idempotent)
- ✅ Provide clear error messages
- ✅ Exit with proper status codes

## Restoring from Backup

If a migration fails or causes issues:

```bash
mysql -h {DB_HOST} -P {DB_PORT} -u {DB_USER} -p {DB_NAME} < "backups/{backup_file}.sql"
```

## Troubleshooting

### Migration fails with "table already exists"
- This is normal - the script skips creating existing tables
- Check the output for "skipped" messages

### Migration fails with foreign key errors
- Ensure all referenced tables exist
- Check that foreign key constraints are correct
- Some migrations create tables in a specific order

### Need to rollback
- Use your backup to restore the database
- Table-level backups (like `user_roles_backup`) can also be used for partial rollback

## Best Practices

1. ✅ **Always backup before migrations**
2. ✅ **Test migrations on a development database first**
3. ✅ **Verify migrations worked correctly before dropping old tables**
4. ✅ **Keep backups until you're confident the migration is stable**
5. ✅ **Document any custom changes you make to migrations**

## Migration Scripts Summary

| Script | Command | Backup Warning | Auto-Backup | Idempotent |
|--------|---------|----------------|-------------|------------|
| Initial Roles | `db:migrate:manual` | ✅ | ❌ | ✅ |
| User Types | `db:migrate:users` | ✅ | ❌ | ✅ |
| Simplified Roles | `db:migrate:simplify` | ✅ | ✅ | ✅ |
| Application RBAC | `db:migrate:rbac` | ✅ | ❌ | ✅ |
| Fix Permissions | `db:fix:permissions` | ✅ | ❌ | ✅ |
| Add Session Column | `addUserSessionIdColumn.ts` | ✅ | ❌ | ✅ |

**Legend:**
- ✅ = Yes
- ❌ = No
- **Idempotent** = Safe to run multiple times
