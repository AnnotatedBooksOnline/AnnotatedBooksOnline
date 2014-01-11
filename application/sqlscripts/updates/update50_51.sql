BEGIN TRANSACTION;

ALTER TABLE "##PREFIX##Scans" ADD COLUMN "scanName" varchar(255);

UPDATE "##PREFIX##Scans" SET "scanName"="##PREFIX##Uploads"."filename"
FROM "##PREFIX##Uploads"
WHERE "##PREFIX##Uploads"."uploadId"="##PREFIX##Scans"."uploadId";

COMMIT;