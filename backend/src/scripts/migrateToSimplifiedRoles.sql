-- Migration to simplify user_roles structure
-- Converts from roles + user_roles to single user_roles table

-- Step 1: Backup existing user_roles table
CREATE TABLE IF NOT EXISTS `user_roles_backup` AS SELECT * FROM `user_roles`;

-- Step 2: Create new simplified user_roles table
DROP TABLE IF EXISTS `user_roles_new`;
CREATE TABLE `user_roles_new` (
	`id` char(36) NOT NULL DEFAULT (UUID()),
	`user_id` char(36) NOT NULL,
	`role_title` varchar(255) NOT NULL,
	`permissions` json NOT NULL DEFAULT JSON_ARRAY(),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_roles_new_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_roles_new_user_id_role_title_unique` UNIQUE(`user_id`, `role_title`),
	CONSTRAINT `user_roles_new_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action
);

-- Step 3: Migrate data from old structure to new
-- For each user-role assignment, copy role name as role_title and permissions
INSERT INTO `user_roles_new` (`user_id`, `role_title`, `permissions`, `created_at`)
SELECT 
  ur.user_id,
  r.name as role_title,
  CASE 
    WHEN r.is_protected = true THEN JSON_ARRAY_APPEND(r.permissions, '$', 'users.protected')
    ELSE r.permissions
  END as permissions,
  ur.created_at
FROM `user_roles` ur
INNER JOIN `roles` r ON ur.role_id = r.id
WHERE NOT EXISTS (
  SELECT 1 FROM `user_roles_new` ur_new 
  WHERE ur_new.user_id = ur.user_id AND ur_new.role_title = r.name
);

-- Step 4: Handle exclusive permissions - ensure users with admin/applicant/disabled only have that permission
-- Remove all other roles for users with admin
DELETE ur_new FROM `user_roles_new` ur_new
INNER JOIN (
  SELECT user_id FROM `user_roles_new` 
  WHERE JSON_SEARCH(permissions, 'one', 'admin') IS NOT NULL
) admin_users ON ur_new.user_id = admin_users.user_id
WHERE JSON_SEARCH(ur_new.permissions, 'one', 'admin') IS NULL;

-- Remove all other roles for users with applicant
DELETE ur_new FROM `user_roles_new` ur_new
INNER JOIN (
  SELECT user_id FROM `user_roles_new` 
  WHERE JSON_SEARCH(permissions, 'one', 'applicant') IS NOT NULL
) applicant_users ON ur_new.user_id = applicant_users.user_id
WHERE JSON_SEARCH(ur_new.permissions, 'one', 'applicant') IS NULL;

-- Remove all other roles for users with disabled
DELETE ur_new FROM `user_roles_new` ur_new
INNER JOIN (
  SELECT user_id FROM `user_roles_new` 
  WHERE JSON_SEARCH(permissions, 'one', 'disabled') IS NOT NULL
) disabled_users ON ur_new.user_id = disabled_users.user_id
WHERE JSON_SEARCH(ur_new.permissions, 'one', 'disabled') IS NULL;

-- Step 5: Replace old table with new one
DROP TABLE IF EXISTS `user_roles_old`;
RENAME TABLE `user_roles` TO `user_roles_old`;
RENAME TABLE `user_roles_new` TO `user_roles`;

-- Step 6: Drop old roles table (after verifying migration)
-- DROP TABLE IF EXISTS `roles`;
-- DROP TABLE IF EXISTS `user_roles_old`;
