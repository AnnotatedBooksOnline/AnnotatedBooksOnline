START TRANSACTION;

INSERT INTO "Permissions" ("actionName", "minRank") VALUES ('modify-bindings', 40);
INSERT INTO "Permissions" ("actionName", "minRank") VALUES ('delete-bindings', 50);

COMMIT;