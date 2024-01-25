/*
  Warnings:

  - You are about to drop the column `providerid` on the `Provider` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[providerId]` on the table `Provider` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `providerId` to the `Provider` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Provider_providerid_key";

-- AlterTable
ALTER TABLE "Provider" DROP COLUMN "providerid",
ADD COLUMN     "providerId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Provider_providerId_key" ON "Provider"("providerId");
