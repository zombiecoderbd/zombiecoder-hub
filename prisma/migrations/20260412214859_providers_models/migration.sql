-- AlterTable
ALTER TABLE `system_config` MODIFY `value` TEXT NOT NULL;

-- CreateTable
CREATE TABLE `providers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `lastSyncedAt` DATETIME(3) NULL,
    `defaultModelId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `providers_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `models` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `providerId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `models_providerId_idx`(`providerId`),
    UNIQUE INDEX `models_providerId_name_key`(`providerId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `providers` ADD CONSTRAINT `providers_defaultModelId_fkey` FOREIGN KEY (`defaultModelId`) REFERENCES `models`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `models` ADD CONSTRAINT `models_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `providers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
