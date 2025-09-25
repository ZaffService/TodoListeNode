/*
  Warnings:

  - You are about to drop the column `audio` on the `Taches` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Taches` DROP COLUMN `audio`,
    ADD COLUMN `voiceMessage` VARCHAR(191) NULL;
