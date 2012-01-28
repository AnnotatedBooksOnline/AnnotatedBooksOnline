BEGIN TRANSACTION;

-- Make scan dimensions floating-point.
ALTER TABLE "Scans" ALTER "width" TYPE real;
ALTER TABLE "Scans" ALTER "height" TYPE real;

COMMIT;