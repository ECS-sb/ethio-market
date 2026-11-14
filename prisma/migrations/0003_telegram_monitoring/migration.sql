-- CreateEnum
CREATE TYPE "TelegramDirection" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "TelegramAlertType" AS ENUM ('PHONE_NUMBER', 'TELEGRAM_CONTACT', 'WHATSAPP', 'BANK_ACCOUNT', 'SUSPICIOUS_PHRASE', 'DELETED_MESSAGE');

-- CreateEnum
CREATE TYPE "TelegramAlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "telegram_connection" (
    "id" TEXT NOT NULL,
    "ownerId" BIGINT NOT NULL,
    "ownerChatId" BIGINT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "ownerUsername" TEXT,
    "canReply" BOOLEAN NOT NULL DEFAULT false,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "connectedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_chat" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "chatId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT,
    "lastMessageAt" TIMESTAMP(3) NOT NULL,
    "lastDirection" "TelegramDirection" NOT NULL,
    "lastInboundAt" TIMESTAMP(3),
    "lastOutboundAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_message" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "messageId" INTEGER NOT NULL,
    "direction" "TelegramDirection" NOT NULL,
    "senderName" TEXT NOT NULL,
    "viaBot" BOOLEAN NOT NULL DEFAULT false,
    "text" TEXT NOT NULL DEFAULT '',
    "mediaType" TEXT,
    "fileId" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "editedAt" TIMESTAMP(3),
    "previousText" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_alert" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "messageId" TEXT,
    "type" "TelegramAlertType" NOT NULL,
    "severity" "TelegramAlertSeverity" NOT NULL,
    "evidence" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "telegram_chat_lastMessageAt_idx" ON "telegram_chat"("lastMessageAt");

-- CreateIndex
CREATE INDEX "telegram_chat_lastDirection_idx" ON "telegram_chat"("lastDirection");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_chat_connectionId_chatId_key" ON "telegram_chat"("connectionId", "chatId");

-- CreateIndex
CREATE INDEX "telegram_message_sentAt_idx" ON "telegram_message"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_message_chatId_messageId_key" ON "telegram_message"("chatId", "messageId");

-- CreateIndex
CREATE INDEX "telegram_alert_resolved_createdAt_idx" ON "telegram_alert"("resolved", "createdAt");

-- CreateIndex
CREATE INDEX "telegram_alert_chatId_idx" ON "telegram_alert"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_alert_messageId_type_evidence_key" ON "telegram_alert"("messageId", "type", "evidence");

-- AddForeignKey
ALTER TABLE "telegram_chat" ADD CONSTRAINT "telegram_chat_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "telegram_connection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telegram_message" ADD CONSTRAINT "telegram_message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "telegram_chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telegram_alert" ADD CONSTRAINT "telegram_alert_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "telegram_chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telegram_alert" ADD CONSTRAINT "telegram_alert_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "telegram_message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
