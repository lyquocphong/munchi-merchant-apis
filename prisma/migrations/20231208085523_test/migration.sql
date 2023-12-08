-- DropForeignKey
ALTER TABLE "business" DROP CONSTRAINT "business_orderingBusinessId_fkey";

-- AddForeignKey
ALTER TABLE "BusinessExtraSetting" ADD CONSTRAINT "BusinessExtraSetting_orderingBusinessId_fkey" FOREIGN KEY ("orderingBusinessId") REFERENCES "business"("orderingBusinessId") ON DELETE RESTRICT ON UPDATE CASCADE;
