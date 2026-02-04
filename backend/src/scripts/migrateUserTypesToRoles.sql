-- Migration script to assign roles to existing users based on their type field
-- This script is idempotent - it checks if assignments already exist before inserting

-- Step 1: Get role IDs (these should already exist from db:seed)
-- We'll use subqueries to get the role IDs dynamically

-- Step 2: Assign Admin role to users with type='admin'
INSERT INTO `user_roles` (`user_id`, `role_id`)
SELECT u.id, r.id
FROM `users` u
CROSS JOIN `roles` r
WHERE u.type = 'admin'
  AND r.name = 'Admin'
  AND NOT EXISTS (
    SELECT 1 FROM `user_roles` ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- Step 3: Assign Admin Viewer role to users with type='adminviewer'
-- First, remove any existing roles for these users (since Admin Viewer is not exclusive, but we want clean assignment)
-- Then assign Admin Viewer role
INSERT INTO `user_roles` (`user_id`, `role_id`)
SELECT u.id, r.id
FROM `users` u
CROSS JOIN `roles` r
WHERE u.type = 'adminviewer'
  AND r.name = 'Admin Viewer'
  AND NOT EXISTS (
    SELECT 1 FROM `user_roles` ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- Step 4: Assign Applicant role to users with type='applicant'
-- This is an exclusive role, so remove any existing roles first
DELETE ur FROM `user_roles` ur
INNER JOIN `users` u ON ur.user_id = u.id
INNER JOIN `roles` r ON ur.role_id = r.id
WHERE u.type = 'applicant' AND r.name != 'Applicant';

INSERT INTO `user_roles` (`user_id`, `role_id`)
SELECT u.id, r.id
FROM `users` u
CROSS JOIN `roles` r
WHERE u.type = 'applicant'
  AND r.name = 'Applicant'
  AND NOT EXISTS (
    SELECT 1 FROM `user_roles` ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- Step 5: Assign Disabled role to users with type='disabled'
-- This is an exclusive role, so remove any existing roles first
DELETE ur FROM `user_roles` ur
INNER JOIN `users` u ON ur.user_id = u.id
INNER JOIN `roles` r ON ur.role_id = r.id
WHERE u.type = 'disabled' AND r.name != 'Disabled';

INSERT INTO `user_roles` (`user_id`, `role_id`)
SELECT u.id, r.id
FROM `users` u
CROSS JOIN `roles` r
WHERE u.type = 'disabled'
  AND r.name = 'Disabled'
  AND NOT EXISTS (
    SELECT 1 FROM `user_roles` ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- Note: Users with type='user' get no default role assignment
-- They can be assigned roles manually through the UI
