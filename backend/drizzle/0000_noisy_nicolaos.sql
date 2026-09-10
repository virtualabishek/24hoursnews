CREATE TABLE `News` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nepaliDescription` text,
	`imageUrl` text,
	`url` varchar(512) NOT NULL,
	`englishTitle` text,
	`nepaliTitle` text,
	`englishDescription` text,
	`dateEnglish` varchar(64),
	`dateNepali` varchar(64),
	`time` varchar(64),
	`category` enum('BUSINESS','ENTERTAINMENT','SPORTS','HEALTH','EDUCATION','TECHNOLOGY','INTERNATIONAL','MERO_SHARE','GENERAL','TRENDING','LIFESTYLE','NATIONAL','OPINION','POLITICS') NOT NULL,
	`publisherId` varchar(30) NOT NULL,
	`isTrending` boolean NOT NULL DEFAULT false,
	`publishedAt` datetime(3),
	`scrapedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `News_id` PRIMARY KEY(`id`),
	CONSTRAINT `News_url_key` UNIQUE(`url`)
);
--> statement-breakpoint
CREATE TABLE `Publisher` (
	`id` varchar(30) NOT NULL,
	`name` varchar(191) NOT NULL,
	`logoUrl` text,
	CONSTRAINT `Publisher_id` PRIMARY KEY(`id`),
	CONSTRAINT `Publisher_name_key` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `News` ADD CONSTRAINT `News_publisherId_fkey` FOREIGN KEY (`publisherId`) REFERENCES `Publisher`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `News_category_idx` ON `News` (`category`);--> statement-breakpoint
CREATE INDEX `News_publishedAt_idx` ON `News` (`publishedAt`);--> statement-breakpoint
CREATE INDEX `News_publisher_category_idx` ON `News` (`publisherId`,`category`);