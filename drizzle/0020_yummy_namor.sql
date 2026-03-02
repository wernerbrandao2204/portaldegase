CREATE TABLE `post_view_limits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`viewedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_view_limits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_shares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`platform` varchar(50) NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`userAgent` varchar(500),
	`sharedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `social_shares_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `post_view_limits` ADD CONSTRAINT `post_view_limits_postId_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `social_shares` ADD CONSTRAINT `social_shares_postId_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE no action;