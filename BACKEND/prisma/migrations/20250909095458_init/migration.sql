/*
  Warnings:

  - You are about to drop the column `tachesId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_tachesId_fkey`;

-- DropIndex
DROP INDEX `User_tachesId_fkey` ON `User`;

-- AlterTable
ALTER TABLE `Taches` ADD COLUMN `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `tachesId`;

-- AddForeignKey
ALTER TABLE `Taches` ADD CONSTRAINT `Taches_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
