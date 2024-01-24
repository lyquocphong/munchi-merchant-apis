/*
  Warnings:

  - The `reminderTime` column on the `PreOrder` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "PreOrder" DROP COLUMN "reminderTime",
ADD COLUMN     "reminderTime" TIMESTAMP(3);
