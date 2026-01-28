-- AlterTable: Add multilingual columns
ALTER TABLE "products" ADD COLUMN "titleEn" TEXT;
ALTER TABLE "products" ADD COLUMN "titleEs" TEXT;
ALTER TABLE "products" ADD COLUMN "descriptionEn" TEXT;
ALTER TABLE "products" ADD COLUMN "descriptionEs" TEXT;

-- Copy existing data to both languages
UPDATE "products" SET "titleEn" = "title", "titleEs" = "title", "descriptionEn" = "description", "descriptionEs" = "description";

-- Make columns required
ALTER TABLE "products" ALTER COLUMN "titleEn" SET NOT NULL;
ALTER TABLE "products" ALTER COLUMN "titleEs" SET NOT NULL;
ALTER TABLE "products" ALTER COLUMN "descriptionEn" SET NOT NULL;
ALTER TABLE "products" ALTER COLUMN "descriptionEs" SET NOT NULL;

-- Drop old columns
ALTER TABLE "products" DROP COLUMN "title";
ALTER TABLE "products" DROP COLUMN "description";

