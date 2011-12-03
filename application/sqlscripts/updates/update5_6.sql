-- Add additional information to Scans table.

ALTER TABLE "Scans" ADD COLUMN width integer NOT NULL;
ALTER TABLE "Scans" ADD COLUMN height integer NOT NULL;
ALTER TABLE "Scans" ADD COLUMN "zoomLevel" integer NOT NULL;

