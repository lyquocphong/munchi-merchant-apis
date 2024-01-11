/*
  Warnings:

  - Added the required column `subOptionId` to the `SubOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubOption" ADD COLUMN     "subOptionId" TEXT NOT NULL;
