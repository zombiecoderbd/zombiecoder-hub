-- AlterTable
ALTER TABLE `agents` ADD COLUMN `modelId` INTEGER NULL,
    ADD COLUMN `providerId` INTEGER NULL;

-- CreateTable
CREATE TABLE `model_usage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `providerId` INTEGER NOT NULL,
    `modelId` INTEGER NOT NULL,
    `requestCount` INTEGER NOT NULL DEFAULT 0,
    `successCount` INTEGER NOT NULL DEFAULT 0,
    `errorCount` INTEGER NOT NULL DEFAULT 0,
    `avgLatencyMs` INTEGER NOT NULL DEFAULT 0,
    `lastLatencyMs` INTEGER NOT NULL DEFAULT 0,
    `lastStatus` VARCHAR(191) NOT NULL DEFAULT 'unknown',
    `lastError` TEXT NULL,
    `lastRequestAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `model_usage_providerId_idx`(`providerId`),
    INDEX `model_usage_modelId_idx`(`modelId`),
    UNIQUE INDEX `model_usage_providerId_modelId_key`(`providerId`, `modelId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `provider_usage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `providerId` INTEGER NOT NULL,
    `requestCount` INTEGER NOT NULL DEFAULT 0,
    `successCount` INTEGER NOT NULL DEFAULT 0,
    `errorCount` INTEGER NOT NULL DEFAULT 0,
    `avgLatencyMs` INTEGER NOT NULL DEFAULT 0,
    `lastLatencyMs` INTEGER NOT NULL DEFAULT 0,
    `lastStatus` VARCHAR(191) NOT NULL DEFAULT 'unknown',
    `lastError` TEXT NULL,
    `lastRequestAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `provider_usage_providerId_key`(`providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `agents` ADD CONSTRAINT `agents_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `providers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agents` ADD CONSTRAINT `agents_modelId_fkey` FOREIGN KEY (`modelId`) REFERENCES `models`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `model_usage` ADD CONSTRAINT `model_usage_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `providers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `model_usage` ADD CONSTRAINT `model_usage_modelId_fkey` FOREIGN KEY (`modelId`) REFERENCES `models`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `provider_usage` ADD CONSTRAINT `provider_usage_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `providers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
