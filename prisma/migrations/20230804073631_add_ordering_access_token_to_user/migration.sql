/*
  Warnings:

  - A unique constraint covering the columns `[orderingAccessToken]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderingAccessToken` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderingAccessTokenExpiredAt` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "orderingAccessToken" TEXT NOT NULL,
ADD COLUMN     "orderingAccessTokenExpiredAt" TIMESTAMP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_orderingAccessToken_key" ON "user"("orderingAccessToken");
