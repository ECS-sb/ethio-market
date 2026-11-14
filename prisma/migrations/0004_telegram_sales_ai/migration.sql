-- CreateEnum
CREATE TYPE "TelegramDealKind" AS ENUM ('SALE', 'REGISTRATION');

-- CreateEnum
CREATE TYPE "TelegramDealStatus" AS ENUM ('NEGOTIATING', 'AGREED', 'PAID', 'DELIVERED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TelegramAlertType" ADD VALUE 'PAYMENT_TO_OTHER_ACCOUNT';
ALTER TYPE "TelegramAlertType" ADD VALUE 'DUPLICATE_RECEIPT';
ALTER TYPE "TelegramAlertType" ADD VALUE 'AI_SUSPICION';

-- AlterTable
ALTER TABLE "telegram_chat" ADD COLUMN     "aiSummary" TEXT,
ADD COLUMN     "analyzedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "telegram_message" ADD COLUMN     "mimeType" TEXT;

-- CreateTable
CREATE TABLE "telegram_deal" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "kind" "TelegramDealKind" NOT NULL,
    "item" TEXT NOT NULL,
    "amountEtb" INTEGER,
    "status" "TelegramDealStatus" NOT NULL,
    "paidToCompany" BOOLEAN,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "note" TEXT NOT NULL DEFAULT '',
    "dealAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_receipt" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "isReceipt" BOOLEAN NOT NULL,
    "provider" TEXT,
    "amountEtb" DOUBLE PRECISION,
    "recipientName" TEXT,
    "recipientAccount" TEXT,
    "payerName" TEXT,
    "transactionId" TEXT,
    "paidAt" TEXT,
    "toCompany" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_receipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "telegram_deal_chatId_idx" ON "telegram_deal"("chatId");

-- CreateIndex
CREATE INDEX "telegram_deal_dealAt_idx" ON "telegram_deal"("dealAt");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_receipt_messageId_key" ON "telegram_receipt"("messageId");

-- CreateIndex
CREATE INDEX "telegram_receipt_transactionId_idx" ON "telegram_receipt"("transactionId");

-- AddForeignKey
ALTER TABLE "telegram_deal" ADD CONSTRAINT "telegram_deal_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "telegram_chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telegram_receipt" ADD CONSTRAINT "telegram_receipt_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "telegram_message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
