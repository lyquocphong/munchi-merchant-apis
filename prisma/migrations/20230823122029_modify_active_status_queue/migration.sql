/*
  Warnings:

  - You are about to drop the `ActiveStatusQueue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ActiveStatusQueue";

-- CreateTable
CREATE TABLE "active_status_queue" (
    "id" SERIAL NOT NULL,
    "userPublicId" TEXT NOT NULL,
    "businessPublicId" TEXT NOT NULL,
    "time" TIMESTAMP NOT NULL,
    "provider" TEXT NOT NULL,
    "processing" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "active_status_queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "active_status_queue_userPublicId_key" ON "active_status_queue"("userPublicId");

-- CreateIndex
CREATE UNIQUE INDEX "active_status_queue_businessPublicId_key" ON "active_status_queue"("businessPublicId");
