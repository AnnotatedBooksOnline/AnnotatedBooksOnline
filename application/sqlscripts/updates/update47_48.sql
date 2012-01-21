BEGIN TRANSACTION;

-- Add order column to Annotations.
ALTER TABLE "Annotations" ADD COLUMN "order" int NOT NULL;

-- Set transcription columns to be not NULL.
ALTER TABLE "Annotations" ALTER COLUMN "transcriptionEng" SET NOT NULL;
ALTER TABLE "Annotations" ALTER COLUMN "transcriptionOrig" SET NOT NULL;

COMMIT;
