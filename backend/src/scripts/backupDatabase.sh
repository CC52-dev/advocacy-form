#!/bin/bash

# Database Backup Script for Linux/Mac
# Creates a full MySQL database backup using mysqldump

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Validate required variables
if [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
    echo "❌ Error: Missing required environment variables"
    echo "   Please ensure DB_USER, DB_PASSWORD, and DB_NAME are set in .env"
    exit 1
fi

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}

# Create backups directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUPS_DIR="$SCRIPT_DIR/../../backups"
mkdir -p "$BACKUPS_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILENAME="${DB_NAME}_backup_${TIMESTAMP}.sql"
BACKUP_PATH="$BACKUPS_DIR/$BACKUP_FILENAME"

echo "📦 Starting database backup..."
echo "   Database: $DB_NAME"
echo "   Host: $DB_HOST:$DB_PORT"
echo "   Output: $BACKUP_PATH"
echo ""

# Run mysqldump
mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_PATH"

# Check if backup was successful
if [ $? -eq 0 ] && [ -f "$BACKUP_PATH" ] && [ -s "$BACKUP_PATH" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
    echo "✅ Database backup completed successfully!"
    echo ""
    echo "📁 Backup saved to: $BACKUP_PATH"
    echo "📊 Backup size: $BACKUP_SIZE"
    echo ""
    echo "💡 To restore this backup, use:"
    echo "   mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME < \"$BACKUP_PATH\""
    
    # Create latest backup symlink
    LATEST_BACKUP="$BACKUPS_DIR/${DB_NAME}_latest.sql"
    cp "$BACKUP_PATH" "$LATEST_BACKUP"
    echo ""
    echo "🔗 Latest backup also saved as: $LATEST_BACKUP"
else
    echo "❌ Backup failed!"
    exit 1
fi
