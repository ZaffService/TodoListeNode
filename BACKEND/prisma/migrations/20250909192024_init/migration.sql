/*
  Warnings:

  - Added the required column `permission` to the `PermissionUserTache` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PermissionUserTache` ADD COLUMN `permission` ENUM('GET', 'PATCH', 'DELETE') NOT NULL;
