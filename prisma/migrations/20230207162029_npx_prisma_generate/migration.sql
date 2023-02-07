-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_business" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "businessId" INTEGER NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "business_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("userId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_business" ("businessId", "id", "name", "publicId", "userId") SELECT "businessId", "id", "name", "publicId", "userId" FROM "business";
DROP TABLE "business";
ALTER TABLE "new_business" RENAME TO "business";
CREATE UNIQUE INDEX "business_businessId_key" ON "business"("businessId");
CREATE UNIQUE INDEX "business_publicId_key" ON "business"("publicId");
CREATE TABLE "new_Session" (
    "accessToken" TEXT NOT NULL,
    "tokenType" TEXT NOT NULL,
    "expiresIn" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("userId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("accessToken", "expiresIn", "tokenType", "userId") SELECT "accessToken", "expiresIn", "tokenType", "userId" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
CREATE UNIQUE INDEX "Session_accessToken_key" ON "Session"("accessToken");
CREATE UNIQUE INDEX "Session_userId_key" ON "Session"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
