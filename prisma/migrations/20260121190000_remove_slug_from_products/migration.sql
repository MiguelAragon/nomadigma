-- AlterTable
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_slug_key";

-- DropIndex
DROP INDEX IF EXISTS "products_slug_idx";

-- AlterTable
ALTER TABLE "products" DROP COLUMN IF EXISTS "slug";

