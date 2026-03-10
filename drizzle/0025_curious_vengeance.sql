ALTER TABLE `banners` ADD `visibility` enum('site','intranet','both') DEFAULT 'site' NOT NULL;--> statement-breakpoint
ALTER TABLE `documents` ADD `visibility` enum('site','intranet','both') DEFAULT 'site' NOT NULL;--> statement-breakpoint
ALTER TABLE `pages` ADD `visibility` enum('site','intranet','both') DEFAULT 'site' NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `visibility` enum('site','intranet','both') DEFAULT 'site' NOT NULL;--> statement-breakpoint
ALTER TABLE `services` ADD `visibility` enum('site','intranet','both') DEFAULT 'site' NOT NULL;--> statement-breakpoint
ALTER TABLE `videos` ADD `visibility` enum('site','intranet','both') DEFAULT 'site' NOT NULL;