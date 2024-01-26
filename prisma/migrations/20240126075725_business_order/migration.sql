-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_orderingBusinessId_fkey";

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_orderingBusinessId_fkey" FOREIGN KEY ("orderingBusinessId") REFERENCES "business"("orderingBusinessId") ON DELETE CASCADE ON UPDATE CASCADE;
