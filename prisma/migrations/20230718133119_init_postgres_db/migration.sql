-- CreateTable
CREATE TABLE "Session" (
    "accessToken" TEXT NOT NULL,
    "tokenType" TEXT NOT NULL,
    "expiresAt" TEXT NOT NULL,
    "userId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "level" INTEGER,
    "publicId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business" (
    "id" SERIAL NOT NULL,
    "businessId" INTEGER NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MyUserBusinessTable" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
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

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MyUserBusinessTable" ADD CONSTRAINT "_MyUserBusinessTable_A_fkey" FOREIGN KEY ("A") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MyUserBusinessTable" ADD CONSTRAINT "_MyUserBusinessTable_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
