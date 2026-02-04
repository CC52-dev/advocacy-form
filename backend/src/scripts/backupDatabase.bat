@echo off
REM Database Backup Script for Windows
REM Creates a full MySQL database backup using mysqldump

REM Load environment variables from .env file
if exist .env (
    for /f "tokens=1,2 delims==" %%a in (.env) do (
        if not "%%a"=="" if not "%%a"=="#" (
            set "%%a=%%b"
        )
    )
)

REM Validate required variables
if "%DB_USER%"=="" (
    echo ❌ Error: DB_USER not set in .env
    exit /b 1
)
if "%DB_PASSWORD%"=="" (
    echo ❌ Error: DB_PASSWORD not set in .env
    exit /b 1
)
if "%DB_NAME%"=="" (
    echo ❌ Error: DB_NAME not set in .env
    exit /b 1
)

if "%DB_HOST%"=="" set DB_HOST=localhost
if "%DB_PORT%"=="" set DB_PORT=3306

REM Create backups directory
set SCRIPT_DIR=%~dp0
set BACKUPS_DIR=%SCRIPT_DIR%..\..\backups
if not exist "%BACKUPS_DIR%" mkdir "%BACKUPS_DIR%"

REM Generate backup filename with timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%-%datetime:~10,2%-%datetime:~12,2%
set BACKUP_FILENAME=%DB_NAME%_backup_%TIMESTAMP%.sql
set BACKUP_PATH=%BACKUPS_DIR%\%BACKUP_FILENAME%

echo 📦 Starting database backup...
echo    Database: %DB_NAME%
echo    Host: %DB_HOST%:%DB_PORT%
echo    Output: %BACKUP_PATH%
echo.

REM Run mysqldump
mysqldump -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% > "%BACKUP_PATH%"

REM Check if backup was successful
if %ERRORLEVEL% EQU 0 (
    if exist "%BACKUP_PATH%" (
        echo ✅ Database backup completed successfully!
        echo.
        echo 📁 Backup saved to: %BACKUP_PATH%
        echo.
        echo 💡 To restore this backup, use:
        echo    mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% ^< "%BACKUP_PATH%"
        
        REM Create latest backup copy
        set LATEST_BACKUP=%BACKUPS_DIR%\%DB_NAME%_latest.sql
        copy "%BACKUP_PATH%" "%LATEST_BACKUP%" >nul
        echo.
        echo 🔗 Latest backup also saved as: %LATEST_BACKUP%
    ) else (
        echo ❌ Backup file was not created!
        exit /b 1
    )
) else (
    echo ❌ Backup failed! Error code: %ERRORLEVEL%
    echo.
    echo Make sure mysqldump is in your PATH or provide full path to mysqldump.exe
    echo Usually located in: C:\Program Files\MySQL\MySQL Server X.X\bin\mysqldump.exe
    exit /b 1
)
