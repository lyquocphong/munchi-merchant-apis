/*
  Warnings:

  - Added the required column `provider` to the `PreorderQueue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PreorderQueue" ADD COLUMN     "provider" TEXT NOT NULL;
