START TRANSACTION;

-- Inserts actions in Permissions table as specified here:
--   http://sp.urandom.nl:8091/display/WCOLLAB/Permissions+table

INSERT INTO "Permissions" ("actionName", "minRank") VALUES ('view-pages', 0);
INSERT INTO "Permissions" ("actionName", "minRank") VALUES ('search-books', 0);
INSERT INTO "Permissions" ("actionName", "minRank") VALUES ('add-annotations', 10);
INSERT INTO "Permissions" ("actionName", "minRank") VALUES ('edit-annotations', 10);
INSERT INTO "Permissions" ("actionName", "minRank") VALUES ('upload-bindings', 10);
INSERT INTO "Permissions" ("actionName", "minRank") VALUES ('manage-bookshelf', 10);
INSERT INTO "Permissions" ("actionName", "minRank") VALUES ('manage-notebook', 10);
INSERT INTO "Permissions" ("actionName", "minRank") VALUES ('export-books', 10);
INSERT INTO "Permissions" ("actionName", "minRank") VALUES ('view-history', 40);
INSERT INTO "Permissions" ("actionName", "minRank") VALUES ('revert-changes', 40);
INSERT INTO "Permissions" ("actionName", "minRank") VALUES ('change-book-info', 40);
INSERT INTO "Permissions" ("actionName", "minRank") VALUES ('view-users', 50);
INSERT INTO "Permissions" ("actionName", "minRank") VALUES ('accept-registrations', 50);
INSERT INTO "Permissions" ("actionName", "minRank") VALUES ('ban-users', 50);
INSERT INTO "Permissions" ("actionName", "minRank") VALUES ('change-user-roles', 50);
INSERT INTO "Permissions" ("actionName", "minRank") VALUES ('change-global-settings', 50);

COMMIT;
