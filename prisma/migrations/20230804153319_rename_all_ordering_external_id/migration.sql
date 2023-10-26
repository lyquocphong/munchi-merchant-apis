/*
  Warnings:

  - You are about to drop the column `orderingExternalId` on the `business` table. All the data in the column will be lost.
  - You are about to drop the column `orderingExternalId` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderingBusinessId]` on the table `business` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderingUserId]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderingBusinessId` to the `business` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderingUserId` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "business_orderingExternalId_key";

-- DropIndex
DROP INDEX "user_orderingExternalId_key";

-- AlterTable
ALTER TABLE "business" DROP COLUMN "orderingExternalId",
ADD COLUMN     "orderingBusinessId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "orderingExternalId",
ADD COLUMN     "orderingUserId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "business_orderingBusinessId_key" ON "business"("orderingBusinessId");

-- CreateIndex
CREATE UNIQUE INDEX "user_orderingUserId_key" ON "user"("orderingUserId");
