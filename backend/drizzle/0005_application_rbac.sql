-- Migration for Application RBAC system
-- Adds roles definition to applications and creates tables for application-specific user roles

-- Step 1: Add roles_definition column to applications table
ALTER TABLE `applications` 
ADD COLUMN `roles_definition` json NOT NULL DEFAULT (JSON_OBJECT('roles', JSON_ARRAY()));

-- Step 2: Create application_user_roles table for assigning users to application-specific roles
CREATE TABLE `application_user_roles` (
	`id` char(36) NOT NULL DEFAULT (UUID()),
	`user_id` char(36) NOT NULL,
	`application_id` char(36) NOT NULL,
	`role_code` varchar(100) NOT NULL,
	`title` varchar(255),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `application_user_roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `application_user_roles_user_app_role_unique` UNIQUE(`user_id`, `application_id`, `role_code`),
	CONSTRAINT `application_user_roles_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `application_user_roles_application_id_fk` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE
);

-- Step 3: Create application_sessions table for SSO-style launch tokens
CREATE TABLE `application_sessions` (
	`id` char(36) NOT NULL DEFAULT (UUID()),
	`token` varchar(255) NOT NULL,
	`user_id` char(36) NOT NULL,
	`application_id` char(36) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`used` boolean DEFAULT false,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `application_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `application_sessions_token_unique` UNIQUE(`token`),
	CONSTRAINT `application_sessions_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `application_sessions_application_id_fk` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE
);

-- Step 4: Create indexes for better query performance
CREATE INDEX `idx_app_user_roles_user` ON `application_user_roles` (`user_id`);
CREATE INDEX `idx_app_user_roles_app` ON `application_user_roles` (`application_id`);
CREATE INDEX `idx_app_sessions_token` ON `application_sessions` (`token`);
CREATE INDEX `idx_app_sessions_user` ON `application_sessions` (`user_id`);
CREATE INDEX `idx_app_sessions_expires` ON `application_sessions` (`expires_at`);
