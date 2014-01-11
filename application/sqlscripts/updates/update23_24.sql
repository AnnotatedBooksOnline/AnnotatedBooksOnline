BEGIN TRANSACTION;

-- Drops the redundant permission ID and makes actionName primary key, which makes more sense.
ALTER TABLE "##PREFIX##Permissions" DROP COLUMN "permissionId";
ALTER TABLE "##PREFIX##Permissions" ADD PRIMARY KEY ("actionName");

COMMIT;
