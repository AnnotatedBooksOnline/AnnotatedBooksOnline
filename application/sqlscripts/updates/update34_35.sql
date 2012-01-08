BEGIN TRANSACTION;

-- Inserts new actions in Permissions
--   http://sp.urandom.nl:8091/display/WCOLLAB/Permissions+table

DELETE FROM "Permissions" WHERE "actionName" = 'view-users';

INSERT INTO "Permissions" ("actionName", "minRank") VALUES ('view-users-part', 10);
INSERT INTO "Permissions" ("actionName", "minRank") VALUES ('view-users-complete', 50);

COMMIT;
