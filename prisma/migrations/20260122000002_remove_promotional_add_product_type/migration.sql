-- Remove promotional fields
ALTER TABLE "products" DROP COLUMN IF EXISTS "saleDescriptionEn";
ALTER TABLE "products" DROP COLUMN IF EXISTS "saleDescriptionEs";
ALTER TABLE "products" DROP COLUMN IF EXISTS "saleImage";
ALTER TABLE "products" DROP COLUMN IF EXISTS "promotionalType";

-- Add ProductType enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "ProductType" AS ENUM ('PHYSICAL', 'DIGITAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new product type fields
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "productType" "ProductType" NOT NULL DEFAULT 'PHYSICAL';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "hasShippingCost" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "shippingCost" DOUBLE PRECISION;

-- Create index on productType
CREATE INDEX IF NOT EXISTS "products_productType_idx" ON "products"("productType");

