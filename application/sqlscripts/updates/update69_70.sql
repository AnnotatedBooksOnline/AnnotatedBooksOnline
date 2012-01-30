BEGIN TRANSACTION;

-- To prevent future confusion, drop tables we're not using.
DROP TABLE "BannedIPAddresses";
DROP TABLE "BannedUsers";

COMMIT;
