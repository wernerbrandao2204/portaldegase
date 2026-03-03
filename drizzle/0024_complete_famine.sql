CREATE TABLE `menu_access_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role` enum('user','admin','contributor') NOT NULL,
	`menuItemId` int NOT NULL,
	`canAccess` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `menu_access_permissions_id` PRIMARY KEY(`id`)
);
