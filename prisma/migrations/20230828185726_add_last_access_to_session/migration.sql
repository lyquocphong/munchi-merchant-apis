/*
  Warnings:

  - Added the required column `lastAccessTs` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "lastAccessTs" TIMESTAMP NOT NULL;
