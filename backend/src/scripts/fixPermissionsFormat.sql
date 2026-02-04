-- Migration to fix permissions format in user_roles table
-- Ensures all permissions are valid JSON arrays

-- Step 1: Fix permissions that are stored as plain strings (not JSON)
-- Convert single string values to JSON arrays
UPDATE `user_roles`
SET `permissions` = JSON_ARRAY(`permissions`)
WHERE JSON_TYPE(`permissions`) = 'STRING'
  AND `permissions` NOT LIKE '[%'
  AND `permissions` NOT LIKE '{%';

-- Step 2: Fix permissions that are JSON strings (need parsing)
-- Parse JSON strings that look like arrays
UPDATE `user_roles`
SET `permissions` = CAST(`permissions` AS JSON)
WHERE JSON_TYPE(`permissions`) = 'STRING'
  AND `permissions` LIKE '[%'
  AND JSON_VALID(`permissions`) = 1;

-- Step 3: Ensure all permissions are arrays (not objects or other types)
-- Convert any non-array JSON to empty array
UPDATE `user_roles`
SET `permissions` = JSON_ARRAY()
WHERE JSON_TYPE(`permissions`) NOT IN ('ARRAY')
  AND JSON_TYPE(`permissions`) IS NOT NULL;

-- Step 4: Validate and fix any remaining issues
-- Set to empty array if invalid JSON
UPDATE `user_roles`
SET `permissions` = JSON_ARRAY()
WHERE JSON_VALID(`permissions`) = 0
  OR `permissions` IS NULL;
