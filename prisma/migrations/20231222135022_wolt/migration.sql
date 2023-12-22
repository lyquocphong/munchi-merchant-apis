/*
  Warnings:

  - You are about to drop the column `name` on the `BusinessExtraSetting` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `BusinessExtraSetting` table. All the data in the column will be lost.
  - Added the required column `woltVenueId` to the `BusinessExtraSetting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BusinessExtraSetting" DROP COLUMN "name",
DROP COLUMN "value",
ADD COLUMN     "woltVenueId" TEXT NOT NULL;
