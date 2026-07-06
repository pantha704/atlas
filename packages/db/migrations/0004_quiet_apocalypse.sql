CREATE TABLE `contributions` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`user_id` text NOT NULL,
	`action` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `public_sources`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `public_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`config_json` text NOT NULL,
	`name` text NOT NULL,
	`bio` text,
	`field_tags` text,
	`contributor_id` text NOT NULL,
	`contributor_count` integer DEFAULT 1 NOT NULL,
	`user_count` integer DEFAULT 0 NOT NULL,
	`avg_score` integer DEFAULT 0 NOT NULL,
	`snr` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'online' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`contributor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
