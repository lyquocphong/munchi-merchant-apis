/*
  Warnings:

  - A unique constraint covering the columns `[providerOrderId]` on the table `PreorderQueue` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PreorderQueue_businessPublicId_key";

-- CreateIndex
CREATE UNIQUE INDEX "PreorderQueue_providerOrderId_key" ON "PreorderQueue"("providerOrderId");
