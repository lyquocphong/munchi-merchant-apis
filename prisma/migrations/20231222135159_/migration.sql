/*
  Warnings:

  - A unique constraint covering the columns `[woltVenueId]` on the table `BusinessExtraSetting` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BusinessExtraSetting_woltVenueId_key" ON "BusinessExtraSetting"("woltVenueId");
