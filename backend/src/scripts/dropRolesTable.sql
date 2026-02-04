-- Script to safely drop the roles table
-- This removes the foreign key constraint first, then drops the table

-- Step 1: Find the foreign key constraint name (if it exists)
-- Run this query first to see what foreign keys reference the roles table:
-- SELECT CONSTRAINT_NAME 
-- FROM information_schema.KEY_COLUMN_USAGE 
-- WHERE TABLE_SCHEMA = DATABASE() 
--   AND TABLE_NAME = 'user_roles' 
--   AND REFERENCED_TABLE_NAME = 'roles';

-- Step 2: Drop the foreign key constraint (replace CONSTRAINT_NAME with actual name from Step 1)
-- ALTER TABLE `user_roles` DROP FOREIGN KEY `CONSTRAINT_NAME`;

-- Step 3: Drop the roles table
DROP TABLE IF EXISTS `roles`;
