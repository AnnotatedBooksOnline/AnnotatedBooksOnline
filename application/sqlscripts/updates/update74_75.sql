START TRANSACTION;

-- Give scans a scanPath, allowing the location at which their tiles are stored to vary.
-- When this is NULL even though the scan is ready, it means the default path should be used.
ALTER TABLE "Scans" ADD COLUMN "scanPath" varchar(100);

COMMIT;
