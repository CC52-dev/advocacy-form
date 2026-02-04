# Database Backup Scripts

This directory contains scripts to backup your MySQL database before running migrations or making significant changes.

## Available Backup Methods

### 1. TypeScript Script (Cross-platform, Recommended)

**Usage:**
```bash
cd backend
npm run db:backup
```

This script:
- Reads database credentials from `.env` file
- Creates a timestamped backup file in `backend/backups/` directory
- Also creates a `{dbname}_latest.sql` file for easy access to the most recent backup
- Works on Windows, Linux, and Mac

**Requirements:**
- `mysqldump` must be in your system PATH
- MySQL client tools installed

### 2. Shell Script (Linux/Mac)

**Usage:**
```bash
cd backend/src/scripts
chmod +x backupDatabase.sh
./backupDatabase.sh
```

### 3. Batch Script (Windows)

**Usage:**
```cmd
cd backend\src\scripts
backupDatabase.bat
```

## Backup Location

All backups are saved to: `backend/backups/`

**Note:** The `backups/` directory is ignored by git (see `.gitignore`)

## Backup File Naming

Backups are named with the following format:
```
{database_name}_backup_{timestamp}.sql
```

Example: `advocacy_db_backup_2024-01-15_14-30-45.sql`

## Restoring a Backup

To restore a backup, use:

```bash
mysql -h {DB_HOST} -P {DB_PORT} -u {DB_USER} -p{DB_PASSWORD} {DB_NAME} < "backups/{backup_file}.sql"
```

Or using the MySQL command line interactively:
```bash
mysql -h {DB_HOST} -P {DB_PORT} -u {DB_USER} -p {DB_NAME}
```
Then:
```sql
source backups/{backup_file}.sql
```

## Before Running Migrations

**Always backup your database before running migrations!**

Recommended workflow:
1. **Backup the database:**
   ```bash
   npm run db:backup
   ```

2. **Verify the backup was created:**
   ```bash
   ls -lh backend/backups/
   ```

3. **Run your migration:**
   ```bash
   npm run db:migrate:simplify  # or other migration command
   ```

4. **Verify the migration worked correctly**

5. **If something went wrong, restore from backup:**
   ```bash
   mysql -h {DB_HOST} -P {DB_PORT} -u {DB_USER} -p{DB_PASSWORD} {DB_NAME} < "backups/{backup_file}.sql"
   ```

## Troubleshooting

### "mysqldump command not found"

**Windows:**
- Make sure MySQL client tools are installed
- Add MySQL bin directory to PATH: `C:\Program Files\MySQL\MySQL Server X.X\bin`
- Or use the full path: `"C:\Program Files\MySQL\MySQL Server X.X\bin\mysqldump.exe"`

**Linux/Mac:**
- Install MySQL client: `sudo apt-get install mysql-client` (Ubuntu/Debian)
- Or: `brew install mysql-client` (Mac)

### "Access denied" errors

- Verify your database credentials in `.env` file
- Ensure the database user has backup privileges
- Check that the database exists and is accessible

### Backup file is empty

- Check database connection settings
- Verify the database name is correct
- Ensure the database user has SELECT privileges on all tables

## Security Notes

- Backup files contain sensitive data - keep them secure
- The `backups/` directory is excluded from git
- Consider encrypting backups if storing them long-term
- Regularly clean up old backups to save disk space
