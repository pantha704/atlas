ALTER TABLE `users` ADD `stripe_customer_id` text;
--> statement-breakpoint
ALTER TABLE `users` ADD `trial_ends_at` text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `items_external_id_unique` ON `items` (`external_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `scores_item_user_unique` ON `scores` (`item_id`,`user_id`);
