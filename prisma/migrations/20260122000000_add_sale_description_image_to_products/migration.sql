-- AlterTable
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "saleDescriptionEn" TEXT,
ADD COLUMN IF NOT EXISTS "saleDescriptionEs" TEXT,
ADD COLUMN IF NOT EXISTS "saleImage" TEXT;

