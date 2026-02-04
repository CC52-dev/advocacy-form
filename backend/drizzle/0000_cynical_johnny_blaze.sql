CREATE TABLE `help` (
	`id` char(36) NOT NULL DEFAULT (UUID()),
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(255) NOT NULL,
	`last_modified` timestamp NOT NULL,
	`authorId` varchar(36) NOT NULL,
	`image` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `help_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `otp` (
	`id` char(36) NOT NULL DEFAULT (UUID()),
	`email` varchar(255) NOT NULL,
	`user_id` char(36) NOT NULL,
	`otp` varchar(6) NOT NULL DEFAULT FLOOR(RAND() * (999999 - 100000 + 1) + 100000),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `otp_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(255) NOT NULL,
	`user_id` char(36) NOT NULL,
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` char(36) NOT NULL DEFAULT (UUID()),
	`firstname` varchar(255),
	`lastname` varchar(255),
	`phone` varchar(20),
	`email` varchar(255),
	`location` json NOT NULL DEFAULT JSON_ARRAY(),
	`addr` varchar(255),
	`city` varchar(255),
	`zip` varchar(10),
	`interest` json NOT NULL DEFAULT JSON_ARRAY(),
	`over16` boolean NOT NULL DEFAULT false,
	`applied_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`accepted_at` timestamp DEFAULT NULL,
	`type` enum('admin','user','applicant','disabled') DEFAULT 'applicant',
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `help` ADD CONSTRAINT `help_authorId_users_id_fk` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `otp` ADD CONSTRAINT `otp_email_users_email_fk` FOREIGN KEY (`email`) REFERENCES `users`(`email`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `otp` ADD CONSTRAINT `otp_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;