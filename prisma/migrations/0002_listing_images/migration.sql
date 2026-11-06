-- AlterTable
ALTER TABLE "listing" ADD COLUMN     "monetized" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "noAdsense" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "strikeFree" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "listing_image" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "thumb" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "listing_image_listingId_position_key" ON "listing_image"("listingId", "position");

-- AddForeignKey
ALTER TABLE "listing_image" ADD CONSTRAINT "listing_image_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
