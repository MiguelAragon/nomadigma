/*
  Warnings:

  - Added the required column `url` to the `gallery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "gallery" ADD COLUMN     "url" TEXT NOT NULL,
ADD COLUMN     "urlThumbnail" TEXT;
