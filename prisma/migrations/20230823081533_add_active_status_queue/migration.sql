-- CreateTable
CREATE TABLE "ActiveStatusQueue" (
    "id" SERIAL NOT NULL,
    "orderingBusinessId" INTEGER NOT NULL,
    "time" TIMESTAMP NOT NULL,
    "provider" TEXT NOT NULL,

    CONSTRAINT "ActiveStatusQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActiveStatusQueue_orderingBusinessId_key" ON "ActiveStatusQueue"("orderingBusinessId");
