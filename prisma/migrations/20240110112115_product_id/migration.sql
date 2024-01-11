-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "deviceId" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT true,
    "lastAccessTs" TIMESTAMP NOT NULL,
    "openAppNotificationCount" INTEGER DEFAULT 0,
    "openAppNotifcationSending" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "orderingUserId" INTEGER NOT NULL,
    "orderingAccessToken" TEXT NOT NULL,
    "orderingAccessTokenExpiredAt" TIMESTAMP NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "level" INTEGER,
    "publicId" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business" (
    "id" SERIAL NOT NULL,
    "orderingBusinessId" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "description" TEXT,

    CONSTRAINT "business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessExtraSetting" (
    "id" SERIAL NOT NULL,
    "orderingBusinessId" TEXT NOT NULL,
    "name" TEXT,
    "value" TEXT
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "orderingBusinessId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "deliveryType" INTEGER NOT NULL,
    "preparedIn" TEXT,
    "createdAt" TEXT NOT NULL,
    "comment" TEXT,
    "type" TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreOrder" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "preorderTime" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "PreOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" TEXT NOT NULL,
    "comment" TEXT,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" SERIAL NOT NULL,
    "optionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "price" TEXT,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubOption" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "price" TEXT NOT NULL,
    "position" INTEGER,
    "quantity" INTEGER NOT NULL,
    "optionId" INTEGER NOT NULL,

    CONSTRAINT "SubOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "rate_type" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferSummary" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "discount" TEXT NOT NULL,

    CONSTRAINT "OfferSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "_MyUserBusinessTable" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BusinessSessionTable" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_publicId_key" ON "Session"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshToken_key" ON "Session"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "Session_deviceId_key" ON "Session"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "user_orderingUserId_key" ON "user"("orderingUserId");

-- CreateIndex
CREATE UNIQUE INDEX "user_orderingAccessToken_key" ON "user"("orderingAccessToken");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_publicId_key" ON "user"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "business_orderingBusinessId_key" ON "business"("orderingBusinessId");

-- CreateIndex
CREATE UNIQUE INDEX "business_publicId_key" ON "business"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessExtraSetting_id_key" ON "BusinessExtraSetting"("id");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessExtraSetting_orderingBusinessId_key" ON "BusinessExtraSetting"("orderingBusinessId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessExtraSetting_value_key" ON "BusinessExtraSetting"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "PreOrder_orderId_key" ON "PreOrder"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_orderId_key" ON "Product"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_id_key" ON "Offer"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_orderId_key" ON "Offer"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "OfferSummary_id_key" ON "OfferSummary"("id");

-- CreateIndex
CREATE UNIQUE INDEX "OfferSummary_offerId_key" ON "OfferSummary"("offerId");

-- CreateIndex
CREATE UNIQUE INDEX "active_status_queue_userPublicId_key" ON "active_status_queue"("userPublicId");

-- CreateIndex
CREATE UNIQUE INDEX "active_status_queue_businessPublicId_key" ON "active_status_queue"("businessPublicId");

-- CreateIndex
CREATE UNIQUE INDEX "_MyUserBusinessTable_AB_unique" ON "_MyUserBusinessTable"("A", "B");

-- CreateIndex
CREATE INDEX "_MyUserBusinessTable_B_index" ON "_MyUserBusinessTable"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BusinessSessionTable_AB_unique" ON "_BusinessSessionTable"("A", "B");

-- CreateIndex
CREATE INDEX "_BusinessSessionTable_B_index" ON "_BusinessSessionTable"("B");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessExtraSetting" ADD CONSTRAINT "BusinessExtraSetting_orderingBusinessId_fkey" FOREIGN KEY ("orderingBusinessId") REFERENCES "business"("orderingBusinessId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_orderingBusinessId_fkey" FOREIGN KEY ("orderingBusinessId") REFERENCES "business"("orderingBusinessId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreOrder" ADD CONSTRAINT "PreOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubOption" ADD CONSTRAINT "SubOption_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferSummary" ADD CONSTRAINT "OfferSummary_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MyUserBusinessTable" ADD CONSTRAINT "_MyUserBusinessTable_A_fkey" FOREIGN KEY ("A") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MyUserBusinessTable" ADD CONSTRAINT "_MyUserBusinessTable_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessSessionTable" ADD CONSTRAINT "_BusinessSessionTable_A_fkey" FOREIGN KEY ("A") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessSessionTable" ADD CONSTRAINT "_BusinessSessionTable_B_fkey" FOREIGN KEY ("B") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
