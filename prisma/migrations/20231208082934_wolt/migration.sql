/*
  Warnings:

  - You are about to drop the `BusinessExtraSetting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "business" DROP CONSTRAINT "business_orderingBusinessId_fkey";

-- DropTable
DROP TABLE "BusinessExtraSetting";
