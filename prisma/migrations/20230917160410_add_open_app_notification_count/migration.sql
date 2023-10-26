/*
  Warnings:

  - You are about to drop the column `lastOpenAppNotificationSentTs` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "lastOpenAppNotificationSentTs",
ADD COLUMN     "openAppNotificationCount" INTEGER DEFAULT 0;
