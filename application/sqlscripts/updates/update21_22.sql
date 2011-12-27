BEGIN TRANSACTION;

-- Set the type of Bindings.signature to varchar instead of char (as has been done in update1_2.sql, but overridden by db13.sql).

ALTER TABLE "Bindings" ALTER COLUMN "signature" TYPE varchar(255);

COMMIT;
