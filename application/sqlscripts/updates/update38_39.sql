BEGIN TRANSACTION;

-- Make sure there are no more scans with status 0.
UPDATE "##PREFIX##Scans" SET "status" = 5 WHERE "status" = 0;

-- Check is no longer correct, could just as well be removed.
ALTER TABLE "##PREFIX##Scans" DROP CONSTRAINT "##PREFIX##Scans_check";

-- Adding mail-from-name-setting.
INSERT INTO "##PREFIX##Settings" ("settingName", "settingValue") VALUES ('mail-from-name', 'Collaboratory for the History of Reading');

COMMIT;
