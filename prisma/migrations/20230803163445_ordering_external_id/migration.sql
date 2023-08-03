/*
  Warnings:

  - You are about to drop the column `orderingId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `businessId` on the `business` table. All the data in the column will be lost.
  - You are about to drop the column `orderingId` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderingExternalId]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderingExternalId]` on the table `business` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderingExternalId]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderingExternalId` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderingExternalId` to the `business` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderingExternalId` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_orderingId_fkey";

-- DropIndex
DROP INDEX "Session_orderingId_key";

-- DropIndex
DROP INDEX "business_businessId_key";

-- DropIndex
DROP INDEX "user_orderingId_key";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "orderingId",
ADD COLUMN     "orderingExternalId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "business" DROP COLUMN "businessId",
ADD COLUMN     "orderingExternalId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "orderingId",
ADD COLUMN     "orderingExternalId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Session_orderingExternalId_key" ON "Session"("orderingExternalId");

-- CreateIndex
CREATE UNIQUE INDEX "business_orderingExternalId_key" ON "business"("orderingExternalId");

-- CreateIndex
CREATE UNIQUE INDEX "user_orderingExternalId_key" ON "user"("orderingExternalId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_orderingExternalId_fkey" FOREIGN KEY ("orderingExternalId") REFERENCES "user"("orderingExternalId") ON DELETE CASCADE ON UPDATE CASCADE;
