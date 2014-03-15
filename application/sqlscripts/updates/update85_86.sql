SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

-- Revise RevisedAnnotations.

START TRANSACTION;

-- Keep track of Scan.
ALTER TABLE "##PREFIX##RevisedAnnotations" ADD COLUMN "scanId" integer;
UPDATE "##PREFIX##RevisedAnnotations" SET "scanId" = 
(
    SELECT "scanId" FROM "##PREFIX##Annotations"
    WHERE "##PREFIX##Annotations"."annotationId" = "##PREFIX##RevisedAnnotations"."annotationId"
) WHERE "annotationId" IS NOT NULL;
ALTER TABLE "##PREFIX##RevisedAnnotations" ADD CONSTRAINT "##PREFIX##ScansFK" FOREIGN KEY ("scanId")
    REFERENCES "##PREFIX##Scans" ("scanId") ON DELETE CASCADE;
    
-- Kind of mutation.
-- 1: ADD
-- 2: MODIFY
-- 3: DELETE
-- 4: RESTORE
ALTER TABLE "##PREFIX##RevisedAnnotations" ADD COLUMN "mutation" integer;
UPDATE "##PREFIX##RevisedAnnotations" SET "mutation" = 1 WHERE "revisionNumber" = 1;
UPDATE "##PREFIX##RevisedAnnotations" SET "mutation" = 2 WHERE "revisionNumber" > 1;
ALTER TABLE "##PREFIX##RevisedAnnotations" MODIFY "mutation" integer NOT NULL;

-- Insert all current revised Annotations as a MODIFY-revision.
INSERT INTO "##PREFIX##RevisedAnnotations" ("annotationId", "scanId", "revisionNumber", "polygon", "transcriptionOrig", "transcriptionEng", "changedUserId", "revisionCreateTime", "mutation")
    SELECT r."annotationId", "scanId", MAX("revisionNumber")+1, "polygon", "transcriptionOrig", "transcriptionEng", "changedUserId", "timeChanged", 2
    FROM "##PREFIX##Annotations" JOIN (SELECT "annotationId", "revisionNumber" FROM "##PREFIX##RevisedAnnotations") r
        ON "##PREFIX##Annotations"."annotationId" = r."annotationId"
    GROUP BY "annotationId";

-- Insert all non-revised Annotations as an ADD-revision.
INSERT INTO "##PREFIX##RevisedAnnotations" ("annotationId", "scanId", "revisionNumber", "polygon", "transcriptionOrig", "transcriptionEng", "changedUserId", "revisionCreateTime", "mutation")
    SELECT "annotationId", "scanId", 1, "polygon", "transcriptionOrig", "transcriptionEng", "createdUserId", "timeCreated", 1
    FROM "##PREFIX##Annotations"
    WHERE NOT EXISTS (SELECT * FROM "##PREFIX##RevisedAnnotations" WHERE "##PREFIX##Annotations"."annotationId" = "##PREFIX##RevisedAnnotations"."annotationId");

-- DROP the foreign key to Annotations, since we want to keep track after deletion.
ALTER TABLE "##PREFIX##RevisedAnnotations" DROP FOREIGN KEY "##PREFIX##RevisedAnnotations_ibfk_2";

COMMIT;
