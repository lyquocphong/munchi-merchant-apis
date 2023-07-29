-- CreateTable
CREATE TABLE "DeviceId" (
    "deviceId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "DeviceId_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceId_deviceId_key" ON "DeviceId"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceId_userId_key" ON "DeviceId"("userId");
