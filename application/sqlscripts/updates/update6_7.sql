BEGIN TRANSACTION;

-- Widens the confirmation code somewhat so an MD5 hash can fit in.

ALTER TABLE "PendingUsers" ALTER "confirmationCode" TYPE character(32);


-- Add an identifier for PendingUsers, make userId unique instead of primary key.
ALTER TABLE "PendingUsers" DROP CONSTRAINT "PendingUsers_pkey";
ALTER TABLE "PendingUsers" ADD COLUMN "pendingUserId" serial NOT NULL;
ALTER TABLE "PendingUsers" ADD PRIMARY KEY ("pendingUserId");
ALTER TABLE "PendingUsers" ADD UNIQUE ("userId");

COMMIT;

