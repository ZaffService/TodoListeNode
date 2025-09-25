-- AlterTable
ALTER TABLE `Taches` ADD COLUMN `etat` ENUM('Termine', 'En_Cours') NOT NULL DEFAULT 'En_Cours';
