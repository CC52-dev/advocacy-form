-- Migration for Events and RSVPs
-- Admins can CRUD events, any non-applicant user can RSVP

CREATE TABLE `events` (
	`id` char(36) NOT NULL DEFAULT (UUID()),
	`title` varchar(255) NOT NULL,
	`description` text,
	`location` varchar(500),
	`event_date` timestamp NOT NULL,
	`created_by` char(36) NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`),
	CONSTRAINT `events_created_by_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `event_rsvps` (
	`id` char(36) NOT NULL DEFAULT (UUID()),
	`event_id` char(36) NOT NULL,
	`user_id` char(36) NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `event_rsvps_id` PRIMARY KEY(`id`),
	CONSTRAINT `event_rsvps_event_user_unique` UNIQUE(`event_id`, `user_id`),
	CONSTRAINT `event_rsvps_event_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE,
	CONSTRAINT `event_rsvps_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE INDEX `idx_events_event_date` ON `events` (`event_date`);
CREATE INDEX `idx_event_rsvps_event` ON `event_rsvps` (`event_id`);
CREATE INDEX `idx_event_rsvps_user` ON `event_rsvps` (`user_id`);
