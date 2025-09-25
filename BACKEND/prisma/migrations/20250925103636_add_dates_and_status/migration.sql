-- AlterTable
ALTER TABLE `Taches` ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `startDate` DATETIME(3) NULL,
    MODIFY `etat` ENUM('En_Attente', 'En_Cours', 'Termine') NOT NULL DEFAULT 'En_Cours';
