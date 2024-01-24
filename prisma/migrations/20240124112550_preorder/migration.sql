/*
  Warnings:

  - You are about to drop the column `processing` on the `Preorder` table. All the data in the column will be lost.
  - You are about to drop the column `reminderTime` on the `Preorder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Preorder" DROP COLUMN "processing",
DROP COLUMN "reminderTime";
