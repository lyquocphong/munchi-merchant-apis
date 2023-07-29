/*
  Warnings:

  - Added the required column `businessId` to the `notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "businessId" TEXT NOT NULL;
