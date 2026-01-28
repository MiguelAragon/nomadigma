-- Add categories column
ALTER TABLE "posts" ADD COLUMN "categories" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Migrate data from hashtags to categories (if hashtags exist)
-- Note: This assumes hashtags contain category-like values that should be migrated
-- You may need to adjust this based on your actual data
UPDATE "posts" SET "categories" = "hashtags" WHERE "hashtags" IS NOT NULL AND array_length("hashtags", 1) > 0;

-- Create index for categories
CREATE INDEX "posts_categories_idx" ON "posts" USING GIN ("categories");

-- Drop hashtags column
ALTER TABLE "posts" DROP COLUMN "hashtags";

-- Drop old hashtags index if it exists
DROP INDEX IF EXISTS "posts_hashtags_idx";
