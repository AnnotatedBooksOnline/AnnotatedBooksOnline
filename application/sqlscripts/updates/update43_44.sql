BEGIN TRANSACTION;

-- Add the project title (Annotated Books Online) to the settings table.
INSERT INTO "Settings" ("settingName", "settingValue") VALUES ('project-title', 'Annotated Books Online');

-- Add the mail-from-address setting.
INSERT INTO "Settings" ("settingName", "settingValue") VALUES ('mail-from-address', 'no-reply@sp.urandom.nl');

COMMIT;
