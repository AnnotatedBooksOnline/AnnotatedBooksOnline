BEGIN TRANSACTION;

-- Drops the redundant permission ID and makes actionName primary key, which makes more sense.
ALTER TABLE "Permissions" DROP COLUMN "permissionId";
ALTER TABLE "Permissions" ADD PRIMARY KEY ("actionName");

COMMIT;
