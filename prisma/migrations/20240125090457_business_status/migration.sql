/*
  Warnings:

  - You are about to drop the `BusinessExtraSetting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BusinessExtraSetting" DROP CONSTRAINT "BusinessExtraSetting_orderingBusinessId_fkey";

-- AlterTable
ALTER TABLE "business" ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "open" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "BusinessExtraSetting";

-- CreateTable
CREATE TABLE "Provider" (
    "id" SERIAL NOT NULL,
    "orderingBusinessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "providerid" TEXT NOT NULL,
    "open" BOOLEAN NOT NULL DEFAULT true,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "ipadFree" BOOLEAN
);

-- CreateIndex
CREATE UNIQUE INDEX "Provider_id_key" ON "Provider"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_orderingBusinessId_key" ON "Provider"("orderingBusinessId");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_providerid_key" ON "Provider"("providerid");

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_orderingBusinessId_fkey" FOREIGN KEY ("orderingBusinessId") REFERENCES "business"("orderingBusinessId") ON DELETE RESTRICT ON UPDATE CASCADE;
