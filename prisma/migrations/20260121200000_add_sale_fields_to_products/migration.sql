-- AlterTable
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "isOnSale" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "discountPercentage" DOUBLE PRECISION;

