ALTER TABLE `profiles` ADD `rss_token` text;--> statement-breakpoint
ALTER TABLE `profiles` ADD `delivery_prefs_json` text;--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_rss_token_unique` ON `profiles` (`rss_token`);