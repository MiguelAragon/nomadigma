-- CreateEnum
CREATE TYPE "GalleryStatus" AS ENUM ('PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "gallery" (
    "id" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleEs" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "contentEs" TEXT NOT NULL,
    "status" "GalleryStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "gallery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gallery_creatorId_idx" ON "gallery"("creatorId");

-- CreateIndex
CREATE INDEX "gallery_status_idx" ON "gallery"("status");

-- AddForeignKey
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
