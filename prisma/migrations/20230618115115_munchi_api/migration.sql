-- CreateTable
CREATE TABLE "Session" (
    "accessToken" TEXT NOT NULL,
    "tokenType" TEXT NOT NULL,
    "expiresAt" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("userId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "level" INTEGER,
    "publicId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "business" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "businessId" INTEGER NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_MyUserBusinessTable" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_MyUserBusinessTable_A_fkey" FOREIGN KEY ("A") REFERENCES "business" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MyUserBusinessTable_B_fkey" FOREIGN KEY ("B") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_accessToken_key" ON "Session"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "Session_userId_key" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_userId_key" ON "user"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_publicId_key" ON "user"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "user_refreshToken_key" ON "user"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "business_businessId_key" ON "business"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "business_publicId_key" ON "business"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "_MyUserBusinessTable_AB_unique" ON "_MyUserBusinessTable"("A", "B");

-- CreateIndex
CREATE INDEX "_MyUserBusinessTable_B_index" ON "_MyUserBusinessTable"("B");
