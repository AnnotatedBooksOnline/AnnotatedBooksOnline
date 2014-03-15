BEGIN TRANSACTION;

-- Create a special user representing all deleted users and insert its ID into the settings table.
INSERT INTO "##PREFIX##Users"("username", "passwordHash", "email", "active", "banned", "rank")
    VALUES ('<deleted user>', '', '', '1', '1', 0);

INSERT INTO "##PREFIX##Settings" ("settingName", "settingValue") 
    VALUES ('deleted-user-id', (SELECT "userId" FROM "##PREFIX##Users" WHERE "username" = '<deleted user>'));

COMMIT;
