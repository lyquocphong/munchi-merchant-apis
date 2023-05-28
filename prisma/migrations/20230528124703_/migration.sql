/*
  Warnings:

  - You are about to drop the column `userId` on the `business` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_MyUserBusinessTable" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_MyUserBusinessTable_A_fkey" FOREIGN KEY ("A") REFERENCES "business" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MyUserBusinessTable_B_fkey" FOREIGN KEY ("B") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_business" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "businessId" INTEGER NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL
);
INSERT INTO "new_business" ("businessId", "id", "name", "publicId") SELECT "businessId", "id", "name", "publicId" FROM "business";
DROP TABLE "business";
ALTER TABLE "new_business" RENAME TO "business";
CREATE UNIQUE INDEX "business_businessId_key" ON "business"("businessId");
CREATE UNIQUE INDEX "business_publicId_key" ON "business"("publicId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_MyUserBusinessTable_AB_unique" ON "_MyUserBusinessTable"("A", "B");

-- CreateIndex
CREATE INDEX "_MyUserBusinessTable_B_index" ON "_MyUserBusinessTable"("B");
