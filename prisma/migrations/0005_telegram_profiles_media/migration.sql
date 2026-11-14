-- AlterTable
ALTER TABLE "telegram_chat" ADD COLUMN     "profile" JSONB,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "telegram_media_file" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_media_file_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "telegram_media_file_messageId_key" ON "telegram_media_file"("messageId");

-- AddForeignKey
ALTER TABLE "telegram_media_file" ADD CONSTRAINT "telegram_media_file_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "telegram_message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
