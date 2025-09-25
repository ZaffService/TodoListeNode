/*
  Warnings:

  - You are about to drop the column `modifiedAt` on the `Taches` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `HistoriqueModifTache` ADD COLUMN `modifiedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Taches` DROP COLUMN `modifiedAt`;
