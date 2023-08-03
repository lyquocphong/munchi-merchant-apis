/*
  Warnings:

  - You are about to drop the column `userId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `lastname` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderingId]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderingId]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderingId` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderingId` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropIndex
DROP INDEX "Session_userId_key";

-- DropIndex
DROP INDEX "user_userId_key";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "userId",
ADD COLUMN     "orderingId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "lastname",
DROP COLUMN "userId",
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "orderingId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Session_orderingId_key" ON "Session"("orderingId");

-- CreateIndex
CREATE UNIQUE INDEX "user_orderingId_key" ON "user"("orderingId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_orderingId_fkey" FOREIGN KEY ("orderingId") REFERENCES "user"("orderingId") ON DELETE CASCADE ON UPDATE CASCADE;
