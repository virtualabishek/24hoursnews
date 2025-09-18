-- CreateTable
CREATE TABLE `News` (
    `id` VARCHAR(191) NOT NULL,
    `nepaliTitle` VARCHAR(191) NOT NULL,
    `nepaliDescription` TEXT NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `url` VARCHAR(191) NOT NULL,
    `englishTitle` VARCHAR(191) NULL,
    `englishDescription` TEXT NULL,
    `category` ENUM('BUSINESS', 'ENTERTAINMENT', 'SPORTS', 'HEALTH', 'EDUCATION', 'TECHNOLOGY', 'INTERNATIONAL', 'MERO_SHARE', 'GENERAL', 'TRENDING') NOT NULL,
    `publisherId` VARCHAR(191) NOT NULL,
    `isTrending` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `scrapedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `News_url_key`(`url`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Publisher` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Publisher_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `News` ADD CONSTRAINT `News_publisherId_fkey` FOREIGN KEY (`publisherId`) REFERENCES `Publisher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
