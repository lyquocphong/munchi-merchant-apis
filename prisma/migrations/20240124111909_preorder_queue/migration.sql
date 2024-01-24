/*
  Warnings:

  - You are about to drop the `PreOrder` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PreOrder" DROP CONSTRAINT "PreOrder_orderId_fkey";

-- DropTable
DROP TABLE "PreOrder";

-- CreateTable
CREATE TABLE "Preorder" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "preorderTime" TEXT NOT NULL,
    "reminderTime" TIMESTAMP(3),
    "processing" BOOLEAN NOT NULL DEFAULT false,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "Preorder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreorderQueue" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "providerOrderId" TEXT NOT NULL,
    "orderingBusinessId" TEXT NOT NULL,
    "processing" BOOLEAN NOT NULL DEFAULT false,
    "reminderTime" TIMESTAMP(3) NOT NULL,
    "orderNumber" TEXT NOT NULL,

    CONSTRAINT "PreorderQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Preorder_orderId_key" ON "Preorder"("orderId");

-- AddForeignKey
ALTER TABLE "Preorder" ADD CONSTRAINT "Preorder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;
