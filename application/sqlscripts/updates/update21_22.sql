BEGIN TRANSACTION;

-- Set the type of Bindings.signature to varchar instead of char (as has been done in update1_2.sql, but overridden by db13.sql).
-- Tom: this has now been fixed in db13.sql. It can't hurt to keep this updatescript though.

ALTER TABLE "##PREFIX##Bindings" ALTER COLUMN "signature" TYPE varchar(255);

COMMIT;
