/*
  Warnings:

  - You are about to drop the column `processingStatus` on the `PreOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PreOrder" DROP COLUMN "processingStatus",
ADD COLUMN     "processing" BOOLEAN NOT NULL DEFAULT false;
