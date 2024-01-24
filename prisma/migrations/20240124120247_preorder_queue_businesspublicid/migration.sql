/*
  Warnings:

  - You are about to drop the column `orderingBusinessId` on the `PreorderQueue` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[businessPublicId]` on the table `PreorderQueue` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `businessPublicId` to the `PreorderQueue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PreorderQueue" DROP COLUMN "orderingBusinessId",
ADD COLUMN     "businessPublicId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PreorderQueue_businessPublicId_key" ON "PreorderQueue"("businessPublicId");
