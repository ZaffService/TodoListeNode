-- DropForeignKey
ALTER TABLE `HistoriqueModifTache` DROP FOREIGN KEY `HistoriqueModifTache_tacheId_fkey`;

-- DropForeignKey
ALTER TABLE `HistoriqueModifTache` DROP FOREIGN KEY `HistoriqueModifTache_userId_fkey`;

-- DropForeignKey
ALTER TABLE `PermissionUserTache` DROP FOREIGN KEY `PermissionUserTache_tacheId_fkey`;

-- DropForeignKey
ALTER TABLE `PermissionUserTache` DROP FOREIGN KEY `PermissionUserTache_userId_fkey`;

-- DropIndex
DROP INDEX `HistoriqueModifTache_tacheId_fkey` ON `HistoriqueModifTache`;

-- DropIndex
DROP INDEX `HistoriqueModifTache_userId_fkey` ON `HistoriqueModifTache`;

-- DropIndex
DROP INDEX `PermissionUserTache_tacheId_fkey` ON `PermissionUserTache`;

-- DropIndex
DROP INDEX `PermissionUserTache_userId_fkey` ON `PermissionUserTache`;

-- AddForeignKey
ALTER TABLE `PermissionUserTache` ADD CONSTRAINT `PermissionUserTache_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermissionUserTache` ADD CONSTRAINT `PermissionUserTache_tacheId_fkey` FOREIGN KEY (`tacheId`) REFERENCES `Taches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoriqueModifTache` ADD CONSTRAINT `HistoriqueModifTache_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoriqueModifTache` ADD CONSTRAINT `HistoriqueModifTache_tacheId_fkey` FOREIGN KEY (`tacheId`) REFERENCES `Taches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
