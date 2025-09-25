/*
  Warnings:

  - Added the required column `action` to the `HistoriqueModifTache` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `HistoriqueModifTache` ADD COLUMN `action` ENUM('GET', 'PATCH', 'DELETE') NOT NULL;
