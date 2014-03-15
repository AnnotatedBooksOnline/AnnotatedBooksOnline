BEGIN TRANSACTION;

-- Inserts new actions in Permissions
--   http://sp.urandom.nl:8091/display/WCOLLAB/Permissions+table

DELETE FROM "##PREFIX##Permissions" WHERE "actionName" = 'view-users';

INSERT INTO "##PREFIX##Permissions" ("actionName", "minRank") VALUES ('view-users-part', 10);
INSERT INTO "##PREFIX##Permissions" ("actionName", "minRank") VALUES ('view-users-complete', 50);

COMMIT;
