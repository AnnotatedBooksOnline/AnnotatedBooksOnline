-- Adds a scanType column to Scans.

ALTER TABLE "Scans" ADD COLUMN "scanType" character(4) NOT NULL;
ALTER TABLE "Scans" ADD CHECK ("scanType" = 'jpeg' OR "scanType" = 'tiff');
