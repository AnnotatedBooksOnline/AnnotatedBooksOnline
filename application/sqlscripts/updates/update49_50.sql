BEGIN TRANSACTION;

ALTER TABLE "Scans" ADD COLUMN "scanName" varchar(255);

UPDATE "Scans" SET "scanName"="Uploads"."filename"
FROM "Uploads"
WHERE "Uploads"."uploadId"="Scans"."uploadId";

COMMIT;
