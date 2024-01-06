/*
  Warnings:

  - You are about to drop the column `woltVenueId` on the `BusinessExtraSetting` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "BusinessExtraSetting_woltVenueId_key";

-- AlterTable
ALTER TABLE "BusinessExtraSetting" DROP COLUMN "woltVenueId",
ADD COLUMN     "name" TEXT,
ADD COLUMN     "value" TEXT;

-- CreateTable
CREATE TABLE "order" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);
