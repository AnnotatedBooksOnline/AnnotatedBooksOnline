BEGIN TRANSACTION;

-- Add order column to Annotations.
ALTER TABLE "Annotations" ADD COLUMN "order" int;
UPDATE "Annotations" a SET "order" = (SELECT COUNT(*) FROM "Annotations" f WHERE f."annotationId" <= a."annotationId" AND f."scanId" = a."scanId");
ALTER TABLE "Annotations" ALTER COLUMN "order" SET NOT NULL;

-- Set transcription columns to be not NULL.
UPDATE "Annotations" SET "transcriptionEng" = '' WHERE "transcriptionEng" IS NULL;
UPDATE "Annotations" SET "transcriptionOrig" = '' WHERE "transcriptionOrig" IS NULL;
ALTER TABLE "Annotations" ALTER COLUMN "transcriptionEng" SET NOT NULL;
ALTER TABLE "Annotations" ALTER COLUMN "transcriptionOrig" SET NOT NULL;

COMMIT;

