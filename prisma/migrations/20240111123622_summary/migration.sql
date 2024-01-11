-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryEta" TEXT,
ADD COLUMN     "pickupEta" TEXT;

-- CreateTable
CREATE TABLE "Summary" (
    "id" SERIAL NOT NULL,
    "total" INTEGER NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "Summary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Summary_orderId_key" ON "Summary"("orderId");

-- AddForeignKey
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;
