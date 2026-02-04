-- Migration to simplify user_roles table structure
-- This removes the separate roles table and consolidates everything into user_roles

-- Step 1: Create new user_roles table structure (backup old one first)
CREATE TABLE IF NOT EXISTS `user_roles_new` (
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

-- Step 2: Migrate data from old user_roles + roles to new user_roles
-- For each user-role assignment, get the role name and permissions
INSERT INTO `user_roles_new` (`user_id`, `role_title`, `permissions`)
SELECT 
  ur.user_id,
  r.name as role_title,
  r.permissions
FROM `user_roles` ur
INNER JOIN `roles` r ON ur.role_id = r.id
WHERE NOT EXISTS (
  SELECT 1 FROM `user_roles_new` ur_new 
  WHERE ur_new.user_id = ur.user_id AND ur_new.role_title = r.name
);

-- Step 3: Add is_protected as a permission for users who had protected roles
-- If a role was protected, add "users.protected" to the permissions array
UPDATE `user_roles_new` ur_new
INNER JOIN (
  SELECT ur.user_id, r.name, r.is_protected
  FROM `user_roles` ur
  INNER JOIN `roles` r ON ur.role_id = r.id
  WHERE r.is_protected = true
) protected_roles ON ur_new.user_id = protected_roles.user_id AND ur_new.role_title = protected_roles.name
SET ur_new.permissions = JSON_ARRAY_APPEND(
  ur_new.permissions,
  '$',
  'users.protected'
)
WHERE JSON_SEARCH(ur_new.permissions, 'one', 'users.protected') IS NULL;

-- Step 4: Drop old tables (after verifying data migration)
-- Note: Uncomment these after verifying the migration worked correctly
-- DROP TABLE IF EXISTS `user_roles`;
-- DROP TABLE IF EXISTS `roles`;

-- Step 5: Rename new table to replace old one
-- RENAME TABLE `user_roles_new` TO `user_roles`;
