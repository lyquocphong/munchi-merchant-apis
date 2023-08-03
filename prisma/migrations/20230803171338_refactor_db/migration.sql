/*
  Warnings:

  - You are about to drop the column `businessId` on the `business` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `business` table. All the data in the column will be lost.
  - You are about to drop the column `lastname` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderingExternalId]` on the table `business` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderingExternalId]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderingExternalId` to the `business` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderingExternalId` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropIndex
DROP INDEX "business_businessId_key";

-- DropIndex
DROP INDEX "user_userId_key";

-- AlterTable
ALTER TABLE "business" DROP COLUMN "businessId",
DROP COLUMN "logo",
ADD COLUMN     "orderingExternalId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "lastname",
DROP COLUMN "userId",
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "orderingExternalId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "business_orderingExternalId_key" ON "business"("orderingExternalId");

-- CreateIndex
CREATE UNIQUE INDEX "user_orderingExternalId_key" ON "user"("orderingExternalId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
