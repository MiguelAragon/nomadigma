-- AlterTable: Add slugEn and slugEs columns
ALTER TABLE "products" ADD COLUMN "slugEn" TEXT;
ALTER TABLE "products" ADD COLUMN "slugEs" TEXT;

-- Create unique indexes for slugEn and slugEs
CREATE UNIQUE INDEX "products_slugEn_key" ON "products"("slugEn");
CREATE UNIQUE INDEX "products_slugEs_key" ON "products"("slugEs");

-- Create indexes for slugEn and slugEs
CREATE INDEX "products_slugEn_idx" ON "products"("slugEn");
CREATE INDEX "products_slugEs_idx" ON "products"("slugEs");

