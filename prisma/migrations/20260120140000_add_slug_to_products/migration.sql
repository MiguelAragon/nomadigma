-- AlterTable: Add slug column with temporary default
ALTER TABLE "products" ADD COLUMN "slug" TEXT;

-- Generate slugs for existing products based on title
UPDATE "products" SET "slug" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) || '-' || SUBSTRING(id, 1, 8);

-- Make slug required and unique
ALTER TABLE "products" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "products" ADD CONSTRAINT "products_slug_key" UNIQUE ("slug");

-- CreateIndex
CREATE INDEX "products_slug_idx" ON "products"("slug");


