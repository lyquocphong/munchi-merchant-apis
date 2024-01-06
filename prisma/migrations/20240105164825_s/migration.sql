/*
  Warnings:

  - A unique constraint covering the columns `[value]` on the table `BusinessExtraSetting` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BusinessExtraSetting_value_key" ON "BusinessExtraSetting"("value");
