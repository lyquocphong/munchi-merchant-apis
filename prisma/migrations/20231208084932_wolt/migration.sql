-- CreateTable
CREATE TABLE "BusinessExtraSetting" (
    "id" SERIAL NOT NULL,
    "orderingBusinessId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessExtraSetting_id_key" ON "BusinessExtraSetting"("id");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessExtraSetting_orderingBusinessId_key" ON "BusinessExtraSetting"("orderingBusinessId");

-- AddForeignKey
ALTER TABLE "business" ADD CONSTRAINT "business_orderingBusinessId_fkey" FOREIGN KEY ("orderingBusinessId") REFERENCES "BusinessExtraSetting"("orderingBusinessId") ON DELETE RESTRICT ON UPDATE CASCADE;
