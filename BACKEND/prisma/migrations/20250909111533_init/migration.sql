/*
  Warnings:

  - Made the column `userId` on table `Taches` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Taches` DROP FOREIGN KEY `Taches_userId_fkey`;

-- DropIndex
DROP INDEX `Taches_userId_fkey` ON `Taches`;

-- AlterTable
ALTER TABLE `Taches` MODIFY `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Taches` ADD CONSTRAINT `Taches_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
