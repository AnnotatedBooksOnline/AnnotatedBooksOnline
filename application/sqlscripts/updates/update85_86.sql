SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

-- Revise RevisedAnnotations.

START TRANSACTION;

-- Keep track of Scan.
ALTER TABLE "RevisedAnnotations" ADD COLUMN "scanId" integer;
UPDATE "RevisedAnnotations" SET "scanId" = 
(
    SELECT "scanId" FROM "Annotations"
    WHERE "Annotations"."annotationId" = "RevisedAnnotations"."annotationId"
) WHERE "annotationId" IS NOT NULL;
ALTER TABLE "RevisedAnnotations" ADD CONSTRAINT "ScansFK" FOREIGN KEY ("scanId")
    REFERENCES "Scans" ("scanId") ON DELETE CASCADE;
    
-- Kind of mutation.
-- 1: ADD
-- 2: MODIFY
-- 3: DELETE
-- 4: RESTORE
ALTER TABLE "RevisedAnnotations" ADD COLUMN "mutation" integer;
UPDATE "RevisedAnnotations" SET "mutation" = 1 WHERE "revisionNumber" = 1;
UPDATE "RevisedAnnotations" SET "mutation" = 2 WHERE "revisionNumber" > 1;
ALTER TABLE "RevisedAnnotations" MODIFY "mutation" integer NOT NULL;

-- Insert all current revised Annotations as a MODIFY-revision.
INSERT INTO "RevisedAnnotations" ("annotationId", "scanId", "revisionNumber", "polygon", "transcriptionOrig", "transcriptionEng", "changedUserId", "revisionCreateTime", "mutation")
    SELECT r."annotationId", "scanId", MAX("revisionNumber")+1, "polygon", "transcriptionOrig", "transcriptionEng", "changedUserId", "timeChanged", 2
    FROM "Annotations" JOIN (SELECT "annotationId", "revisionNumber" FROM "RevisedAnnotations") r
        ON "Annotations"."annotationId" = r."annotationId"
    GROUP BY "annotationId";

-- Insert all non-revised Annotations as an ADD-revision.
INSERT INTO "RevisedAnnotations" ("annotationId", "scanId", "revisionNumber", "polygon", "transcriptionOrig", "transcriptionEng", "changedUserId", "revisionCreateTime", "mutation")
    SELECT "annotationId", "scanId", 1, "polygon", "transcriptionOrig", "transcriptionEng", "createdUserId", "timeCreated", 1
    FROM "Annotations"
    WHERE "Annotations"."annotationId" NOT IN
    (
        SELECT "annotationId" FROM "RevisedAnnotations"
    );

-- DROP the foreign key to Annotations, since we want to keep track after deletion.
ALTER TABLE "RevisedAnnotations" DROP FOREIGN KEY "RevisedAnnotations_ibfk_2";

COMMIT;

