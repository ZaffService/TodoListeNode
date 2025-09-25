-- CreateTable
CREATE TABLE `HistoriqueModifTache` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `tacheId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HistoriqueModifTache` ADD CONSTRAINT `HistoriqueModifTache_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoriqueModifTache` ADD CONSTRAINT `HistoriqueModifTache_tacheId_fkey` FOREIGN KEY (`tacheId`) REFERENCES `Taches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
