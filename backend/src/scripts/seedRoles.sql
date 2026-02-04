-- Seed default roles
-- This script is idempotent - it checks if roles exist before inserting

INSERT INTO `roles` (`name`, `permissions`, `is_protected`, `is_exclusive`)
SELECT 'Admin', '["admin"]', false, false
WHERE NOT EXISTS (SELECT 1 FROM `roles` WHERE `name` = 'Admin');

INSERT INTO `roles` (`name`, `permissions`, `is_protected`, `is_exclusive`)
SELECT 'Admin Viewer', '["applicants.read", "users.read"]', false, false
WHERE NOT EXISTS (SELECT 1 FROM `roles` WHERE `name` = 'Admin Viewer');

INSERT INTO `roles` (`name`, `permissions`, `is_protected`, `is_exclusive`)
SELECT 'Applicant', '[]', false, true
WHERE NOT EXISTS (SELECT 1 FROM `roles` WHERE `name` = 'Applicant');

INSERT INTO `roles` (`name`, `permissions`, `is_protected`, `is_exclusive`)
SELECT 'Disabled', '[]', false, true
WHERE NOT EXISTS (SELECT 1 FROM `roles` WHERE `name` = 'Disabled');
