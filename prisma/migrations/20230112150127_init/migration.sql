-- CreateTable
CREATE TABLE "Session" (
    "accessToken" TEXT NOT NULL,
    "tokenType" TEXT NOT NULL,
    "expiresIn" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "level" INTEGER
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_accessToken_key" ON "Session"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "Session_userId_key" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
