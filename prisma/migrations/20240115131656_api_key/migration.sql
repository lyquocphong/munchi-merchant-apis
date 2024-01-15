/*
  Warnings:

  - A unique constraint covering the columns `[name,value]` on the table `ApiKey` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_name_value_key" ON "ApiKey"("name", "value");
