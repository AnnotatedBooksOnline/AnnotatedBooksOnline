BEGIN TRANSACTION;

-- To prevent future confusion, drop tables we're not using.
DROP TABLE "##PREFIX##BannedIPAddresses";
DROP TABLE "##PREFIX##BannedUsers";

COMMIT;
