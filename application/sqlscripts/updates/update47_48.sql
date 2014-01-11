BEGIN TRANSACTION;

-- Add order column to Annotations.
ALTER TABLE "##PREFIX##Annotations" ADD COLUMN "order" int;
UPDATE "##PREFIX##Annotations" a SET "order" = (SELECT COUNT(*) FROM "##PREFIX##Annotations" f WHERE f."annotationId" <= a."annotationId" AND f."scanId" = a."scanId");
ALTER TABLE "##PREFIX##Annotations" ALTER COLUMN "order" SET NOT NULL;

-- Set transcription columns to be not NULL.
UPDATE "##PREFIX##Annotations" SET "transcriptionEng" = '' WHERE "transcriptionEng" IS NULL;
UPDATE "##PREFIX##Annotations" SET "transcriptionOrig" = '' WHERE "transcriptionOrig" IS NULL;
ALTER TABLE "##PREFIX##Annotations" ALTER COLUMN "transcriptionEng" SET NOT NULL;
ALTER TABLE "##PREFIX##Annotations" ALTER COLUMN "transcriptionOrig" SET NOT NULL;

COMMIT;

