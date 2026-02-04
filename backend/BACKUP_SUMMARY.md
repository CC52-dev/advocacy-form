# Database Backup Summary

This document summarizes all backup mechanisms available in the project.

## ✅ Backup Scripts Available

### 1. Full Database Backup (Recommended Before Migrations)

**Script:** `backend/src/scripts/backupDatabase.ts`

**Usage:**
```bash
cd backend
npm run db:backup
```

**What it does:**
- Creates a complete database dump using `mysqldump`
- Saves to `backend/backups/{dbname}_backup_{timestamp}.sql`
- Also creates `{dbname}_latest.sql` for easy access
- Works cross-platform (Windows, Linux, Mac)

**When to use:**
- Before running any migration
- Before making significant database changes
- Regular scheduled backups

### 2. Table-Level Backup (Automatic in Migrations)

**Script:** `backend/src/scripts/migrateToSimplifiedRoles.sql`

**What it does:**
- Automatically creates `user_roles_backup` table before migration
- Creates `user_roles_old` table as additional backup
- Preserves original `roles` table until manually dropped

**When it runs:**
- Automatically when running `npm run db:migrate:simplify`

**Backup tables created:**
- `user_roles_backup` - Full copy of original user_roles table
- `user_roles_old` - Renamed original table (kept for safety)
- `roles` - Original roles table (preserved until verified)

## 📋 Backup Checklist Before Migrations

- [ ] Run full database backup: `npm run db:backup`
- [ ] Verify backup file was created in `backend/backups/`
- [ ] Check backup file size (should not be 0 bytes)
- [ ] Note the backup filename for potential restore
- [ ] Run migration script
- [ ] Verify migration completed successfully
- [ ] Test application functionality
- [ ] Only after verification, consider cleaning up old backup tables

## 🔄 Restore Procedures

### Restore Full Database Backup

```bash
mysql -h {DB_HOST} -P {DB_PORT} -u {DB_USER} -p {DB_NAME} < "backups/{backup_file}.sql"
```

### Restore from Table Backup

If you need to restore just the `user_roles` table:

```sql
-- Drop current table
DROP TABLE IF EXISTS `user_roles`;

-- Restore from backup
CREATE TABLE `user_roles` AS SELECT * FROM `user_roles_backup`;

-- Or restore from old table
CREATE TABLE `user_roles` AS SELECT * FROM `user_roles_old`;
```

## 📁 Backup Storage

- **Location:** `backend/backups/`
- **Git Status:** Excluded from version control (see `.gitignore`)
- **Retention:** Manual cleanup recommended for old backups

## ⚠️ Important Notes

1. **Always backup before migrations** - The migration scripts warn you, but it's your responsibility
2. **Verify backups** - Check that backup files are created and have content
3. **Test restores** - Periodically test restoring from backups to ensure they work
4. **Clean up old backups** - Regularly remove old backup files to save disk space
5. **Secure backups** - Backup files contain sensitive data - keep them secure

## 🛠️ Troubleshooting

See `backend/src/scripts/BACKUP_README.md` for detailed troubleshooting information.

## 📝 Migration Scripts with Built-in Backups

The following migration scripts include automatic table-level backups:

1. **`migrateToSimplifiedRoles.sql`** - Creates `user_roles_backup` and `user_roles_old`
2. **Other migrations** - May create backup tables as needed

Always run a full database backup before any migration, even if the migration script creates its own backups.
