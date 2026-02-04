-- Seed roles for existing users based on their type (simplified structure)
-- This uses the new user_roles table structure with roleTitle and permissions

-- Assign Admin role to users with type='admin'
INSERT INTO `user_roles` (`user_id`, `role_title`, `permissions`)
SELECT u.id, 'Admin', JSON_ARRAY('admin')
FROM `users` u
WHERE u.type = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM `user_roles` ur 
    WHERE ur.user_id = u.id AND ur.role_title = 'Admin'
  );

-- Assign Admin Viewer role to users with type='adminviewer'
INSERT INTO `user_roles` (`user_id`, `role_title`, `permissions`)
SELECT u.id, 'Admin Viewer', JSON_ARRAY('applicants.read', 'users.read')
FROM `users` u
WHERE u.type = 'adminviewer'
  AND NOT EXISTS (
    SELECT 1 FROM `user_roles` ur 
    WHERE ur.user_id = u.id AND ur.role_title = 'Admin Viewer'
  );

-- Assign Applicant role to users with type='applicant' (exclusive permission)
-- First remove any existing roles
DELETE ur FROM `user_roles` ur
INNER JOIN `users` u ON ur.user_id = u.id
WHERE u.type = 'applicant';

INSERT INTO `user_roles` (`user_id`, `role_title`, `permissions`)
SELECT u.id, 'Applicant', JSON_ARRAY('applicant')
FROM `users` u
WHERE u.type = 'applicant'
  AND NOT EXISTS (
    SELECT 1 FROM `user_roles` ur 
    WHERE ur.user_id = u.id AND ur.role_title = 'Applicant'
  );

-- Assign Disabled role to users with type='disabled' (exclusive permission)
-- First remove any existing roles
DELETE ur FROM `user_roles` ur
INNER JOIN `users` u ON ur.user_id = u.id
WHERE u.type = 'disabled';

INSERT INTO `user_roles` (`user_id`, `role_title`, `permissions`)
SELECT u.id, 'Disabled', JSON_ARRAY('disabled')
FROM `users` u
WHERE u.type = 'disabled'
  AND NOT EXISTS (
    SELECT 1 FROM `user_roles` ur 
    WHERE ur.user_id = u.id AND ur.role_title = 'Disabled'
  );

-- Note: Users with type='user' get no default role assignment
-- They can be assigned roles manually through the UI
